import {
    findTopWeatherCorrelation,
    analyzeSeasonality,
    detectPriceChanges,
    analyzeSalesTrend,
    analyzeSalesVolatility
} from './statistics.js';
import { Logger } from './logger.js';

// --- Analysis Configuration ---
const MAX_PRODUCTS_FOR_AI = 25; // Limit the number of products sent to the AI to manage prompt size and cost.

// --- Helper Functions ---

/**
 * Validates the headers of the parsed Excel data to ensure critical columns exist.
 * @param {string[]} headers - The array of header strings.
 */
function validateHeaders(headers) {
    const requiredHeaders = ['STYLE', 'STYLE DESC', 'COLOR', 'RETAIL', 'COST'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
        throw new Error(`The 'AP' sheet is missing required columns: ${missingHeaders.join(', ')}.`);
    }
}

/**
 * Parses the 'AP' sheet from the user's Assortment Plan Excel tool.
 * This is the primary data ingestion function for the application.
 * @param {File} file - The Excel file object from the input element.
 * @returns {Promise<Array<Object>>} A promise resolving to an array of structured product sales records.
 */
export function parseSalesFile(file) {
    return new Promise((resolve, reject) => {
        if (typeof XLSX === 'undefined') {
            return reject(new Error('SheetJS library is not loaded. Cannot read Excel file.'));
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const workbook = XLSX.read(event.target.result, { type: 'array' });
                const apSheet = workbook.Sheets['AP'];
                if (!apSheet) {
                    throw new Error("The uploaded Excel file must contain a sheet named 'AP'.");
                }
                const jsonData = XLSX.utils.sheet_to_json(apSheet, { header: 1, defval: null });

                const headerRowIndex = jsonData.findIndex(row => row && row.includes('DEPT'));
                if (headerRowIndex === -1) throw new Error("Could not find a valid header row containing 'DEPT' in the 'AP' sheet.");
                
                const headers = jsonData[headerRowIndex];
                validateHeaders(headers); // Validate required columns
                
                const year = jsonData[0] && jsonData[0][1] ? jsonData[0][1] : new Date().getFullYear();
                const dataRows = jsonData.slice(headerRowIndex + 1);
                const salesRecords = [];
                const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

                const unitsHeaderRowIndex = jsonData.findIndex(row => row && row.includes('UNITS'));
                if (unitsHeaderRowIndex === -1) throw new Error("Could not locate the 'UNITS' sub-header row for sales data.");
                const unitsHeaders = jsonData[unitsHeaderRowIndex];
                
                dataRows.forEach(row => {
                    const style = row[headers.indexOf('STYLE')];
                    if (!style || String(style).toLowerCase().includes('total')) return;

                    const baseRecord = {
                        dept: row[headers.indexOf('DEPT')],
                        brand: row[headers.indexOf('BRAND')],
                        style: style,
                        styleDesc: row[headers.indexOf('STYLE DESC')],
                        color: row[headers.indexOf('COLOR')],
                        size: row[headers.indexOf('SIZE')],
                        retailPrice: parseFloat(row[headers.indexOf('RETAIL')]) || 0,
                        costPrice: parseFloat(row[headers.indexOf('COST')]) || 0,
                        location: "DefaultStore"
                    };

                    months.forEach((month, monthIndex) => {
                        const monthUnitIndex = unitsHeaders.indexOf(month);
                        const unitsSold = monthUnitIndex > -1 ? parseInt(row[monthUnitIndex]) || 0 : 0;
                        
                        if (unitsSold > 0) {
                            salesRecords.push({
                                ...baseRecord,
                                sku: `${baseRecord.style}-${baseRecord.color}-${baseRecord.size}`,
                                date: new Date(year, monthIndex, 15).toISOString().split('T')[0],
                                sales: unitsSold,
                                revenue: unitsSold * baseRecord.retailPrice
                            });
                        }
                    });
                });

                if (salesRecords.length === 0) {
                    throw new Error("No valid monthly sales records could be parsed. Check the file format and data.");
                }

                resolve(salesRecords);

            } catch (error) {
                Logger.error("File Parsing Error", error);
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error("Error reading the file."));
        reader.readAsArrayBuffer(file);
    });
}


/**
 * Joins sales data with weather data based on matching location and month.
 */
export function joinSalesAndWeather(salesData, weatherDataByLocation) {
    return salesData.map(sale => {
        const locationWeather = weatherDataByLocation[sale.location];
        if (!locationWeather) return sale;

        const saleMonth = sale.date.substring(0, 7); // YYYY-MM
        const weatherForMonth = locationWeather.filter(w => w.date.startsWith(saleMonth));
        if (weatherForMonth.length === 0) return sale;

        const monthlyWeather = {
            avg_temp_c: weatherForMonth.reduce((sum, d) => sum + d.avg_temp_c, 0) / weatherForMonth.length,
            precip_mm: weatherForMonth.reduce((sum, d) => sum + d.precip_mm, 0),
        };

        return { ...sale, ...monthlyWeather };
    }).filter(Boolean);
}

/**
 * Performs a deep local analysis, calculating seasonality, price changes, and weather correlation.
 */
export function runLocalAnalysis(joinedData) {
    const results = {
        totalRevenue: joinedData.reduce((sum, r) => sum + r.revenue, 0),
        totalSales: joinedData.reduce((sum, r) => sum + r.sales, 0),
        products: {}
    };

    const dataBySku = joinedData.reduce((acc, row) => {
        acc[row.sku] = acc[row.sku] || [];
        acc[row.sku].push(row);
        return acc;
    }, {});
    
    const weatherVariables = ['avg_temp_c', 'precip_mm'];

    for (const sku in dataBySku) {
        const productData = dataBySku[sku].sort((a, b) => new Date(a.date) - new Date(b.date));
        if (productData.length < 2) continue;

        const firstRecord = productData[0];
        
        results.products[sku] = {
            sku,
            styleDesc: firstRecord.styleDesc,
            color: firstRecord.color,
            brand: firstRecord.brand,
            totalSales: productData.reduce((sum, r) => sum + r.sales, 0),
            averagePrice: firstRecord.retailPrice,
            costPrice: firstRecord.costPrice,
            priceProfile: detectPriceChanges(productData),
            seasonality: analyzeSeasonality(productData),
            weatherCorrelation: findTopWeatherCorrelation(productData, weatherVariables),
            salesTrend: analyzeSalesTrend(productData),
            salesVolatility: analyzeSalesVolatility(productData),
        };
    }

    return results;
}

/**
 * Prepares a highly detailed payload for Gemini, asking it to act as an expert retail planner
 * and to return a structured JSON response.
 */
export function preparePayload(localAnalysis, budget) {
    const topProducts = Object.values(localAnalysis.products)
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, MAX_PRODUCTS_FOR_AI);

    const productDataForPrompt = topProducts.map(p => ({
        sku: p.sku,
        description: `${p.styleDesc} - ${p.color}`,
        historicalSales: `${p.totalSales} units sold`,
        priceProfile: `${p.priceProfile.summary}. Average retail price: $${p.averagePrice.toFixed(2)}`,
        seasonalityProfile: p.seasonality.summary,
        weatherDriver: p.weatherCorrelation ? `Strongest correlation of ${p.weatherCorrelation.correlation.toFixed(2)} with ${p.weatherCorrelation.weatherVariable}.` : 'No significant weather correlation.',
        salesTrend: p.salesTrend.summary,
        salesVolatility: p.salesVolatility.summary,
        costPrice: p.costPrice
    }));

    const systemPrompt = `You are an expert retail buyer and assortment planner. Your task is to analyze product performance data to build a strategic, data-driven purchasing plan. Your response must be a valid JSON object. Do not include any text, notes, or markdown formatting before or after the JSON object.`;

    const userPrompt = `
        Total allocated budget: $${budget.toLocaleString()}.
        
        Product Performance Data:
        ${JSON.stringify(productDataForPrompt, null, 2)}
        
        Based on the data provided, generate a list of purchasing recommendations. For each product, calculate an "Opportunity Score" from 1-100 by weighing all factors (high sales, positive trends, and stability should yield a higher score). Then, provide a concise reasoning, a clear recommendation, a suggested number of units to buy, and the estimated cost (suggested units * cost price). 
        Include the sales trend and volatility summaries in your output for each product.
    `;

    const responseSchema = {
        type: "OBJECT",
        properties: {
            "recommendations": {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        "sku": { "type": "STRING" },
                        "opportunityScore": { "type": "NUMBER", "description": "A score from 1 to 100 weighing all factors." },
                        "reasoning": { "type": "STRING", "description": "Concise, data-driven explanation for the score." },
                        "recommendation": { "type": "STRING", "enum": ["BUY/REPEAT", "CONSIDER SIMILAR", "REDUCE/DISCONTINUE"] },
                        "suggestedUnits": { "type": "NUMBER" },
                        "estimatedCost": { "type": "NUMBER" },
                        "salesTrendSummary": { "type": "STRING", "description": "The summary of the sales trend analysis." },
                        "salesVolatilitySummary": { "type": "STRING", "description": "The summary of the sales volatility analysis." }
                    },
                    required: ["sku", "opportunityScore", "reasoning", "recommendation", "suggestedUnits", "estimatedCost", "salesTrendSummary", "salesVolatilitySummary"]
                }
            }
        },
        required: ["recommendations"]
    };

    return { systemPrompt, userPrompt, responseSchema };
}

/**
 * Parses the JSON response from the Gemini API and sorts the recommendations.
 * @param {string} responseText - The raw JSON string from the API.
 * @returns {Array<Object>} A sorted array of recommendation objects.
 */
export function processGeminiResponse(responseText) {
    try {
        const parsedJson = JSON.parse(responseText);
        if (!parsedJson.recommendations || !Array.isArray(parsedJson.recommendations)) {
            throw new Error("AI response is missing the 'recommendations' array.");
        }
        const recommendations = parsedJson.recommendations;
        // Sort by score descending
        return recommendations.sort((a, b) => b.opportunityScore - a.opportunityScore);
    } catch (error) {
        Logger.error("Error parsing Gemini JSON response", {
            error: error.message,
            responseText: responseText
        });
        throw new Error("The AI returned an invalid response. Please check the logs for more details.");
    }
}

