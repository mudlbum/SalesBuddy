import { findBestLaggedCorrelation } from './statistics.js';

/**
 * Parses the user-uploaded sales file (CSV or JSON) with enhanced validation.
 * @param {File} file - The file object from the input element.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of validated sales records.
 */
export function parseSalesFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                let data;
                if (file.name.endsWith('.csv')) {
                    const lines = text.split('\n').filter(line => line.trim() !== '');
                    if (lines.length < 2) throw new Error("CSV file must have a header and at least one data row.");
                    
                    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                    data = lines.slice(1).map(line => {
                        const values = line.split(',').map(v => v.trim());
                        return headers.reduce((obj, header, index) => {
                            obj[header] = values[index];
                            return obj;
                        }, {});
                    });
                } else if (file.name.endsWith('.json')) {
                    data = JSON.parse(text);
                } else {
                    throw new Error("Unsupported file type. Please use .csv or .json");
                }
                
                if (!Array.isArray(data) || data.length === 0) {
                     throw new Error("File is empty or not in a valid array format.");
                }

                // --- Data Validation and Cleaning ---
                const requiredColumns = ['date', 'sku', 'sales', 'revenue', 'location'];
                const firstRow = data[0];
                for (const col of requiredColumns) {
                    if (!(col in firstRow)) {
                        throw new Error(`Invalid file format. Missing required column: "${col}".`);
                    }
                }

                const cleanData = data.map((row, i) => {
                    const sales = parseFloat(row.sales);
                    const revenue = parseFloat(row.revenue);
                    if (isNaN(sales) || isNaN(revenue) || !row.date) {
                        console.warn(`Skipping invalid row #${i + 2}:`, row);
                        return null;
                    }
                    return {
                        date: new Date(row.date).toISOString().split('T')[0], // Standardize date format
                        sku: String(row.sku).trim(),
                        sales,
                        revenue,
                        location: String(row.location).trim()
                    };
                }).filter(Boolean); // Filter out null (invalid) rows

                if(cleanData.length === 0) {
                    throw new Error("No valid data rows could be parsed from the file.");
                }

                resolve(cleanData);
            } catch (error) {
                reject(new Error(`Failed to parse file: ${error.message}`));
            }
        };
        reader.onerror = () => reject(new Error("Error reading the file."));
        reader.readAsText(file);
    });
}


/**
 * Joins sales data with weather data based on date and location.
 * @param {Array<Object>} salesData - Parsed sales records.
 * @param {Object<string, Array<Object>>} weatherDataByLocation - Weather records from the API, keyed by location.
 * @returns {Array<Object>} An array of combined sales and weather records.
 */
export function joinSalesAndWeather(salesData, weatherDataByLocation) {
    // Create a nested map for efficient lookup: location -> date -> weather
    const weatherMap = new Map();
    for (const location in weatherDataByLocation) {
        const dateMap = new Map(weatherDataByLocation[location].map(d => [d.date, d]));
        weatherMap.set(location, dateMap);
    }
    
    return salesData
        .map(sale => {
            const locationWeather = weatherMap.get(sale.location);
            if (!locationWeather) return null;
            const weather = locationWeather.get(sale.date);
            return weather ? { ...sale, ...weather } : null;
        })
        .filter(Boolean); // Filter out sales with no matching weather data
}

/**
 * Performs local statistical analysis on the joined data, now handling multiple locations.
 * @param {Array<Object>} joinedData - Combined sales and weather data.
 * @returns {Object} An object containing aggregated stats and correlation results, structured by location.
 */
export function runLocalAnalysis(joinedData) {
    const results = {
        totalRevenue: 0,
        totalSales: 0,
        locations: {}
    };
    
    // Group all data by location first
    const dataByLocation = joinedData.reduce((acc, row) => {
        acc[row.location] = acc[row.location] || [];
        acc[row.location].push(row);
        results.totalRevenue += row.revenue;
        results.totalSales += row.sales;
        return acc;
    }, {});

    // Analyze each location independently
    for (const location in dataByLocation) {
        const locationData = dataByLocation[location];
        const locationCorrelations = [];

        const dataBySku = locationData.reduce((acc, row) => {
            acc[row.sku] = acc[row.sku] || [];
            acc[row.sku].push(row);
            return acc;
        }, {});

        const weatherVariables = ['avg_temp_c', 'precip_mm', 'wind_kph']; // Key variables to test

        for (const sku in dataBySku) {
            const skuData = dataBySku[sku].sort((a,b) => new Date(a.date) - new Date(b.date));
            const revenueSeries = skuData.map(d => d.revenue);

            let bestCorrelationForSku = null;

            weatherVariables.forEach(variable => {
                const weatherSeries = skuData.map(d => d[variable] || 0);
                const result = findBestLaggedCorrelation(revenueSeries, weatherSeries);
                
                if (!bestCorrelationForSku || Math.abs(result.correlation) > Math.abs(bestCorrelationForSku.correlation)) {
                    if (Math.abs(result.correlation) > 0.25) { // Stricter threshold for significance
                         bestCorrelationForSku = {
                            sku,
                            weatherVariable: variable,
                            bestLag: result.lag,
                            correlation: result.correlation
                        };
                    }
                }
            });

            if (bestCorrelationForSku) {
                locationCorrelations.push(bestCorrelationForSku);
            }
        }

        // Add sorted correlations to the final results object for this location
        results.locations[location] = {
            correlations: locationCorrelations.sort((a,b) => Math.abs(b.correlation) - Math.abs(a.correlation))
        };
    }

    return results;
}

/**
 * Prepares a highly detailed, structured payload for the Gemini API.
 * @param {Object} localAnalysis - The results from runLocalAnalysis.
 * @returns {string} A detailed prompt string for the AI.
 */
export function preparePayload(localAnalysis) {
    let prompt = `
        **AI Sales & Weather Analysis Task**

        **Executive Summary:**
        We have analyzed sales data across multiple locations and found several statistically significant correlations between weather patterns and product revenue. Your task is to interpret these findings, provide deeper insights, and generate actionable business recommendations.

        **Key Statistical Findings (Local Analysis):**
    `;

    for (const location in localAnalysis.locations) {
        prompt += `\n* **Location: ${location}**\n`;
        const topCorrelations = localAnalysis.locations[location].correlations.slice(0, 3);
        if (topCorrelations.length === 0) {
            prompt += `    * No strong correlations found.\n`;
        } else {
            topCorrelations.forEach(c => {
                 prompt += `    * SKU ${c.sku} vs. ${c.weatherVariable}: Found a correlation of **${c.correlation.toFixed(3)}** with a **${c.bestLag}-day delay**. This suggests that changes in ${c.weatherVariable} impact sales of this SKU ${c.bestLag} days later.\n`;
            });
        }
    }

    prompt += `
        **AI Instructions:**
        Please analyze the findings above. For each location, provide up to 3 insights in the exact format below. Be concise and business-focused.

        ---
        **Location:** [Location Name]
        
        **Insight 1:**
        **Finding:** [A one-sentence summary of the relationship. Example: "Hotter temperatures strongly drive sales of SKU X."]
        **Causal Theory:** [A brief theory on why this relationship exists. Example: "Customers likely purchase this item for outdoor activities on warm days."]
        **Business Recommendation:** [A concrete, actionable suggestion. Example: "Launch a social media campaign for SKU X when a heatwave is forecasted."]
        **Confidence Score:** [A rating from 1 to 5. Example: 4/5]

        **Insight 2:**
        ... (repeat for other insights)
        ---
        **Location:** [Next Location Name]
        ... (repeat for the next location)
    `;
    return prompt;
}

/**
 * Parses the structured text response from the Gemini API with improved resilience.
 * @param {string} rawText - The raw text response.
 * @returns {Object<string, Array<Object>>} An object of structured insights, keyed by location.
 */
export function parseGeminiResponse(rawText) {
    const insightsByLocation = {};
    const locationSections = rawText.split('**Location:**').slice(1);

    locationSections.forEach(section => {
        const lines = section.trim().split('\n');
        const locationName = lines[0].trim();
        const insights = [];
        
        const insightChunks = section.split('**Insight ');

        insightChunks.slice(1).forEach(chunk => {
            const findingMatch = chunk.match(/Finding:\s*(.*)/);
            const theoryMatch = chunk.match(/Causal Theory:\s*(.*)/);
            const recMatch = chunk.match(/Business Recommendation:\s*(.*)/);
            const confidenceMatch = chunk.match(/Confidence Score:\s*(\d)\/5/);

            if (findingMatch && recMatch && confidenceMatch) {
                insights.push({
                    finding: findingMatch[1].trim(),
                    theory: theoryMatch ? theoryMatch[1].trim() : "Not provided.",
                    recommendation: recMatch[1].trim(),
                    confidence: parseInt(confidenceMatch[1], 10)
                });
            }
        });
        
        insightsByLocation[locationName] = insights;
    });

    if (Object.keys(insightsByLocation).length === 0) {
        throw new Error("The AI response could not be parsed into the expected format. Please check the raw log.");
    }
    return insightsByLocation;
}


/**
 * Exports the full analysis to a multi-sheet Excel file.
 * @param {Object} analysisResults - The comprehensive results object from `runLocalAnalysis`.
 * @param {Object} aiInsightsByLocation - The parsed insights from the AI, keyed by location.
 */
export function exportToExcel(analysisResults, aiInsightsByLocation) {
    if (typeof XLSX === 'undefined') {
        alert('SheetJS library is not loaded.');
        return;
    }

    const wb = XLSX.utils.book_new();

    // Sheet 1: Summary
    const summaryData = [
        ["Metric", "Value"],
        ["Total Revenue", analysisResults.totalRevenue.toFixed(2)],
        ["Total Sales Units", analysisResults.totalSales],
        ["Locations Analyzed", Object.keys(analysisResults.locations).length],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

    // Sheet 2: AI Recommendations
    const insightsSheetData = [["Location", "Finding", "Causal Theory", "Recommendation", "Confidence (1-5)"]];
    for(const location in aiInsightsByLocation) {
        aiInsightsByLocation[location].forEach(i => {
            insightsSheetData.push([location, i.finding, i.theory, i.recommendation, i.confidence]);
        });
    }
    const insightsSheet = XLSX.utils.aoa_to_sheet(insightsSheetData);
    XLSX.utils.book_append_sheet(wb, insightsSheet, "AI Recommendations");

    // Sheet 3: Statistical Correlations
    const correlationsSheetData = [["Location", "SKU", "Weather Variable", "Best Lag (Days)", "Correlation"]];
     for(const location in analysisResults.locations) {
        analysisResults.locations[location].correlations.forEach(c => {
            correlationsSheetData.push([location, c.sku, c.weatherVariable, c.bestLag, c.correlation.toFixed(4)]);
        });
    }
    const correlationsSheet = XLSX.utils.aoa_to_sheet(correlationsSheetData);
    XLSX.utils.book_append_sheet(wb, correlationsSheet, "Statistical Correlations");

    XLSX.writeFile(wb, "AI_Sales_Forecast_Report.xlsx");
}

/**
 * Exports a professionally formatted summary report to a PDF file.
 * @param {Object} analysisResults - The results from `runLocalAnalysis`.
 * @param {Object} aiInsightsByLocation - The parsed insights from the AI.
 * @param {string} salesFileName - Name of the sales file.
 */
export function exportToPDF(analysisResults, aiInsightsByLocation, salesFileName) {
    if (typeof jspdf === 'undefined') {
        alert('jsPDF library is not loaded.');
        return;
    }
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    let y = 22; // Current Y position on the page

    const addPageIfNeeded = () => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
    };

    // Header
    doc.setFontSize(18);
    doc.text("AI Sales Forecasting Report", 14, y);
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Analysis of: ${salesFileName}`, 14, y);
    y += 6;
    doc.text("Generated on: " + new Date().toLocaleDateString(), 14, y);
    y += 15;
    
    // Summary Metrics
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Executive Summary", 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`- Total Revenue: $${analysisResults.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 16, y);
    y += 6;
    doc.text(`- Total Sales Units: ${analysisResults.totalSales.toLocaleString()}`, 16, y);
    y += 6;
    doc.text(`- Locations Analyzed: ${Object.keys(analysisResults.locations).length}`, 16, y);
    y += 12;

    // AI Insights by Location
    for(const location in aiInsightsByLocation) {
        addPageIfNeeded();
        y += 5;
        doc.setFontSize(14);
        doc.text(`AI Recommendations for ${location}`, 14, y);
        y += 8;

        aiInsightsByLocation[location].forEach((insight, index) => {
             addPageIfNeeded();
             doc.setFontSize(11);
             doc.setFont(undefined, 'bold');
             doc.text(`${index + 1}. ${insight.finding}`, 16, y, { maxWidth: 180 });
             y += 6;
             doc.setFont(undefined, 'normal');
             doc.setFontSize(10);
             doc.setTextColor(100);
             doc.text(`Confidence: ${'★'.repeat(insight.confidence)}${'☆'.repeat(5 - insight.confidence)}`, 18, y);
             y += 6;
             doc.setTextColor(0);
             doc.text(`Recommendation: ${insight.recommendation}`, 18, y, { maxWidth: 170 });
             y += 15;
        });
    }

    doc.save("AI_Sales_Forecast_Report.pdf");
}

