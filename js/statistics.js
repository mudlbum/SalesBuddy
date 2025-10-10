/**
 * @fileoverview Utility functions for advanced statistical calculations.
 * This module provides functions for seasonality, price, and correlation analysis.
 */

// --- Analysis Configuration ---
const CORRELATION_MAX_LAG_MONTHS = 3; // How many months to shift time series data for weather correlation.
const CORRELATION_SIGNIFICANCE_THRESHOLD = 0.3; // The minimum correlation value to be considered significant.

// --- Core Correlation Functions ---

/**
 * Calculates the Pearson correlation coefficient between two arrays of numbers.
 * @param {number[]} x - The first array of numbers.
 * @param {number[]} y - The second array of numbers.
 * @returns {number} The Pearson correlation coefficient, a value between -1 and 1.
 */
function calculatePearsonCorrelation(x, y) {
    const n = x.length;
    if (n < 2 || n !== y.length) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
    const sumX2 = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);
    const sumY2 = y.map(yi => yi * yi).reduce((a, b) => a + b, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0;
    return numerator / denominator;
}

/**
 * Calculates the correlation between two time series at different time lags.
 * @param {number[]} primarySeries - The main series (e.g., sales).
 * @param {number[]} secondarySeries - The series to test for correlation (e.g., temperature).
 * @param {number} maxLag - The maximum number of months to shift the secondary series.
 * @returns {Array<{lag: number, correlation: number}>} An array of correlation results for each lag.
 */
function calculateLaggedCorrelation(primarySeries, secondarySeries, maxLag) {
    const results = [];
    for (let lag = 0; lag <= maxLag; lag++) {
        const laggedSecondary = secondarySeries.slice(0, secondarySeries.length - lag);
        const alignedPrimary = primarySeries.slice(lag);

        if (alignedPrimary.length > 1) {
            const correlation = calculatePearsonCorrelation(alignedPrimary, laggedSecondary);
            results.push({ lag, correlation: isNaN(correlation) ? 0 : correlation });
        } else {
            results.push({ lag, correlation: 0 });
        }
    }
    return results;
}

// --- High-Level Analysis Functions ---

/**
 * Analyzes product data to find the single weather variable with the strongest correlation.
 * @param {Array<Object>} productData - Monthly sales data for a single product.
 * @param {Array<string>} weatherVariables - Array of weather variable keys to test (e.g., ['avg_temp_c']).
 * @returns {Object|null} The best correlation found, or null if none are significant.
 */
export function findTopWeatherCorrelation(productData, weatherVariables) {
    let bestResult = { correlation: 0 };

    weatherVariables.forEach(variable => {
        if (productData.every(d => d[variable] === undefined)) return;

        const salesSeries = productData.map(d => d.sales);
        const weatherSeries = productData.map(d => d[variable]);
        const laggedResults = calculateLaggedCorrelation(salesSeries, weatherSeries, CORRELATION_MAX_LAG_MONTHS);

        const bestLagForVar = laggedResults.reduce((best, current) =>
            Math.abs(current.correlation) > Math.abs(best.correlation) ? current : best
        );

        if (Math.abs(bestLagForVar.correlation) > Math.abs(bestResult.correlation)) {
            bestResult = { ...bestLagForVar, weatherVariable: variable };
        }
    });

    // Only return correlations that are reasonably strong
    return Math.abs(bestResult.correlation) > CORRELATION_SIGNIFICANCE_THRESHOLD ? bestResult : null;
}

/**
 * Analyzes a product's sales history to determine its seasonal profile.
 * @param {Array<Object>} productData - Monthly sales data for a single product.
 * @returns {Object} An object describing the product's seasonality.
 */
export function analyzeSeasonality(productData) {
    const salesByMonth = Array(12).fill(0);
    productData.forEach(r => {
        const month = new Date(r.date).getUTCMonth();
        salesByMonth[month] += r.sales;
    });

    const totalSales = salesByMonth.reduce((sum, sales) => sum + sales, 0);
    if (totalSales === 0) return { summary: "No sales data to determine seasonality." };

    const peakMonthIndex = salesByMonth.indexOf(Math.max(...salesByMonth));
    const peakMonthSales = salesByMonth[peakMonthIndex];
    const peakMonthName = new Date(2000, peakMonthIndex).toLocaleString('default', { month: 'long' });

    const concentration = peakMonthSales / totalSales;
    let summary;
    if (concentration > 0.5) {
        summary = `Highly seasonal with a strong peak in ${peakMonthName}.`;
    } else if (concentration > 0.25) {
        summary = `Seasonal with a notable peak in ${peakMonthName}.`;
    } else {
        summary = `Non-seasonal with consistent sales throughout the year.`;
    }

    return {
        summary,
        peakMonth: peakMonthName,
        concentration: parseFloat(concentration.toFixed(2))
    };
}

/**
 * Analyzes a product's sales history to detect if its price changed.
 * @param {Array<Object>} productData - Monthly sales data for a single product.
 * @returns {Object} An object describing the product's price stability.
 */
export function detectPriceChanges(productData) {
    const prices = productData.map(p => p.retailPrice);
    const uniquePrices = [...new Set(prices)];

    if (uniquePrices.length === 1) {
        return { summary: "Stable price.", stable: true };
    }

    const firstPrice = productData[0].retailPrice;
    const lastPrice = productData[productData.length - 1].retailPrice;

    if (lastPrice < firstPrice) {
        return { summary: `Price was reduced over the period, indicating markdowns.`, stable: false };
    } else if (lastPrice > firstPrice) {
        return { summary: `Price increased over the period.`, stable: false };
    } else {
        return { summary: `Price fluctuated during the period.`, stable: false };
    }
}

// --- Helper functions for new analysis ---

/**
 * Calculates the mean of a set of numbers.
 * @param {number[]} data - The array of numbers.
 * @returns {number} The mean.
 */
function getMean(data) {
    if (data.length === 0) return 0;
    return data.reduce((a, b) => a + b, 0) / data.length;
}

/**
 * Calculates the standard deviation of a set of numbers.
 * @param {number[]} data - The array of numbers.
 * @returns {number} The standard deviation.
 */
function getStandardDeviation(data) {
    const n = data.length;
    if (n < 2) return 0;
    const mean = getMean(data);
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
    return Math.sqrt(variance);
}


// --- New High-Level Analysis Functions ---

/**
 * Analyzes the sales trend over time using simple linear regression.
 * @param {Array<Object>} productData - Monthly sales data for a single product, sorted by date.
 * @returns {Object} An object describing the sales trend.
 */
export function analyzeSalesTrend(productData) {
    const n = productData.length;
    if (n < 3) return { summary: "Not enough data for trend analysis.", slope: null };

    const x = Array.from({ length: n }, (_, i) => i); // Time periods 0, 1, 2...
    const y = productData.map(p => p.sales);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Normalize slope by average sales to make it comparable across products
    const meanSales = sumY / n;
    const normalizedSlope = meanSales !== 0 ? slope / meanSales : 0;
    
    let summary;
    if (normalizedSlope > 0.15) {
        summary = "Strong positive sales trend.";
    } else if (normalizedSlope > 0.05) {
        summary = "Moderate positive sales trend.";
    } else if (normalizedSlope < -0.15) {
        summary = "Strong negative sales trend.";
    } else if (normalizedSlope < -0.05) {
        summary = "Moderate negative sales trend.";
    } else {
        summary = "Stable sales trend with no significant growth or decline.";
    }

    return {
        summary,
        slope: parseFloat(slope.toFixed(2))
    };
}

/**
 * Analyzes the sales data for volatility using the coefficient of variation.
 * @param {Array<Object>} productData - Monthly sales data for a single product.
 * @returns {Object} An object describing sales volatility.
 */
export function analyzeSalesVolatility(productData) {
    const salesSeries = productData.map(d => d.sales);
    if (salesSeries.length < 2) return { summary: "Not enough data for volatility analysis.", cv: null };

    const mean = getMean(salesSeries);
    const stdDev = getStandardDeviation(salesSeries);

    if (mean === 0) return { summary: "No sales to analyze for volatility.", cv: 0 };

    const cv = stdDev / mean;
    let summary;

    if (cv < 0.25) {
        summary = "Very consistent sales month-over-month.";
    } else if (cv < 0.75) {
        summary = "Moderately consistent sales with some monthly fluctuation.";
    } else {
        summary = "Volatile sales with significant month-over-month swings.";
    }

    return {
        summary,
        cv: parseFloat(cv.toFixed(2))
    };
}

