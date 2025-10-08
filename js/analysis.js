    import { findTopWeatherCorrelation } from './statistics.js';

    /**
     * Parses the user-uploaded sales file (CSV or JSON) with enhanced validation.
     * @param {File} file - The file object from the input element.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of sales records.
     */
    export function parseSalesFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const text = event.target.result;
                    let data;
                    if (file.name.endsWith('.csv')) {
                        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
                        if (lines.length < 2) throw new Error("CSV file must have a header and at least one data row.");
                        const headers = lines[0].split(',').map(h => h.trim());
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

                    const requiredColumns = ['sku', 'location', 'date', 'sales', 'revenue'];
                    if (!requiredColumns.every(col => col in data[0])) {
                        throw new Error(`Input data is missing required columns. Ensure it has: ${requiredColumns.join(', ')}`);
                    }

                    const cleanData = data.map(row => ({
                        ...row,
                        date: new Date(row.date).toISOString().split('T')[0],
                        sales: parseFloat(row.sales) || 0,
                        revenue: parseFloat(row.revenue) || 0,
                    }));
                    resolve(cleanData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error("Error reading the file."));
            reader.readAsText(file);
        });
    }

    /**
     * Joins sales data with weather data based on date and location.
     * @param {Array<Object>} salesData - Parsed sales records.
     * @param {Object} weatherDataByLocation - Weather records from the API, keyed by location.
     * @returns {Array<Object>} An array of combined sales and weather records.
     */
    export function joinSalesAndWeather(salesData, weatherDataByLocation) {
        return salesData
            .map(sale => {
                const locationWeather = weatherDataByLocation[sale.location];
                if (!locationWeather) return null;
                
                const weatherForDay = locationWeather.find(w => w.date === sale.date);
                return weatherForDay ? { ...sale, ...weatherForDay } : null;
            })
            .filter(Boolean);
    }

    /**
     * Performs local statistical analysis on the joined data, grouped by location.
     * @param {Array<Object>} joinedData - Combined sales and weather data.
     * @returns {Object} An object containing aggregated stats and correlation results per location.
     */
    export function runLocalAnalysis(joinedData) {
        const results = {
            totalRevenue: 0,
            totalSales: 0,
            locations: {}
        };

        const dataByLocation = joinedData.reduce((acc, row) => {
            acc[row.location] = acc[row.location] || [];
            acc[row.location].push(row);
            results.totalRevenue += row.revenue;
            results.totalSales += row.sales;
            return acc;
        }, {});

        const weatherVariables = ['avg_temp_c', 'precip_mm', 'wind_kph'];

        for (const location in dataByLocation) {
            const locationData = dataByLocation[location];
            results.locations[location] = {
                totalRevenue: locationData.reduce((sum, r) => sum + r.revenue, 0),
                totalSales: locationData.reduce((sum, r) => sum + r.sales, 0),
                correlations: []
            };
            
            const dataBySku = locationData.reduce((acc, row) => {
                acc[row.sku] = acc[row.sku] || [];
                acc[row.sku].push(row);
                return acc;
            }, {});

            for (const sku in dataBySku) {
                const skuData = dataBySku[sku].sort((a, b) => new Date(a.date) - new Date(b.date));
                if (skuData.length > 10) { // Require a minimum number of data points
                    const topCorrelation = findTopWeatherCorrelation(skuData, weatherVariables);
                    if (topCorrelation) {
                        results.locations[location].correlations.push(topCorrelation);
                    }
                }
            }
            results.locations[location].correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
        }

        return results;
    }

    /**
     * Prepares a detailed, structured payload for the Gemini API.
     * @param {Object} localAnalysis - The results from runLocalAnalysis.
     * @returns {string} A detailed prompt string for the AI.
     */
    export function preparePayload(localAnalysis) {
        let prompt = `
            **AI-Powered Sales & Weather Analysis**

            **Objective:** Analyze the provided statistical correlations between product sales and weather conditions for different store locations. For each significant correlation, provide a deep, actionable insight.

            **Analysis Input:**
            Below are the top statistical findings for each location. A "lag" indicates a delayed effect (e.g., a lag of 2 means sales change 2 days after the weather event).
        `;

        for (const location in localAnalysis.locations) {
            const locData = localAnalysis.locations[location];
            if (locData.correlations.length > 0) {
                prompt += `\n\n--- LOCATION: ${location} ---\n`;
                locData.correlations.slice(0, 3).forEach(c => {
                    prompt += `- SKU ${c.sku} sales show a correlation of ${c.correlation.toFixed(2)} with ${c.weatherVariable} at a ${c.bestLag}-day lag.\n`;
                });
            }
        }

        prompt += `
            \n**Your Task:**
            For each location, provide a list of insights based on the correlations above. If you find no strong correlations for a location, state that.
            For each insight, use the following structured format exactly:

            **LOCATION:** [Location Name]
            **SKU:** [SKU Code]
            **FINDING:** [A concise, one-sentence summary of the relationship. Example: "Sales of winter jackets spike 2 days after a significant temperature drop."]
            **THEORY:** [A plausible explanation for this behavior. Example: "Customers likely assess their current winter gear after feeling the first real cold snap and purchase new jackets shortly after."]
            **CONFIDENCE:** [A numerical score from 1 to 5, representing your confidence in the finding.]
            **RECOMMENDATION:** [A specific, actionable business recommendation. Example: "Launch a targeted social media ad campaign for this SKU to users in this location 1 day after the first major temperature drop of the season."]
        `;
        return prompt;
    }

    /**
     * Parses the structured text response from the Gemini API.
     * @param {string} rawText - The raw text response.
     * @returns {Object} An object of structured insights, keyed by location.
     */
    export function parseGeminiResponse(rawText) {
        const insightsByLocation = {};
        const sections = rawText.split('**LOCATION:**').slice(1);

        sections.forEach(section => {
            const lines = section.trim().split('\n');
            const locationName = lines[0].trim();
            if (!insightsByLocation[locationName]) {
                insightsByLocation[locationName] = [];
            }

            const insight = {};
            lines.forEach(line => {
                if (line.startsWith('**SKU:**')) insight.sku = line.replace('**SKU:**', '').trim();
                if (line.startsWith('**FINDING:**')) insight.finding = line.replace('**FINDING:**', '').trim();
                if (line.startsWith('**THEORY:**')) insight.theory = line.replace('**THEORY:**', '').trim();
                if (line.startsWith('**CONFIDENCE:**')) insight.confidence = parseInt(line.match(/\d+/)?.[0] || '3', 10);
                if (line.startsWith('**RECOMMENDATION:**')) insight.recommendation = line.replace('**RECOMMENDATION:**', '').trim();
            });
            
            if (insight.sku && insight.finding) {
                insightsByLocation[locationName].push(insight);
            }
        });

        return insightsByLocation;
    }


    // --- EXPORT FUNCTIONS ---

    /**
     * Exports the user's curated action plan to an Excel file.
     * @param {Array<Object>} plannerItems - The items from the planner.
     */
    export function exportPlannerToExcel(plannerItems) {
        if (typeof XLSX === 'undefined') throw new Error('SheetJS library is not loaded.');

        const wb = XLSX.utils.book_new();
        const sheetData = [["Location", "SKU", "Finding", "Recommendation", "Confidence (1-5)"]];
        plannerItems.forEach(item => {
            sheetData.push([item.location, item.sku, item.finding, item.recommendation, item.confidence]);
        });
        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, "Action Plan");
        XLSX.writeFile(wb, "AI_Sales_Action_Plan.xlsx");
    }


    /**
     * Exports the user's curated action plan to a PDF file.
     * @param {Array<Object>} plannerItems - The items from the planner.
     */
    export function exportPlannerToPDF(plannerItems) {
        if (typeof jspdf === 'undefined') throw new Error('jsPDF library is not loaded.');
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        let y = 20;

        doc.setFontSize(18);
        doc.text("AI Sales Action Plan", 105, y, { align: 'center' });
        y += 8;
        doc.setFontSize(11);
        doc.text("Generated on: " + new Date().toLocaleDateString(), 105, y, { align: 'center' });
        y += 15;

        plannerItems.forEach((item, index) => {
            if (y > 260) { doc.addPage(); y = 20; }
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`Action ${index + 1}: ${item.sku} @ ${item.location}`, 14, y);
            y += 7;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Finding: ${item.finding}`, 16, y, { maxWidth: 178 });
            y += 10;
            doc.text(`Recommendation: ${item.recommendation}`, 16, y, { maxWidth: 178 });
            y += 10;
            doc.text(`Confidence: ${'★'.repeat(item.confidence)}${'☆'.repeat(5 - item.confidence)}`, 16, y);
            y += 15;
        });

        doc.save("AI_Sales_Action_Plan.pdf");
    }

