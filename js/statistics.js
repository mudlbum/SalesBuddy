/**
 * @fileoverview Utility functions for advanced statistical calculations.
 * This module provides functions for correlation and regression analysis.
 */

/**
 * Calculates the Pearson correlation coefficient between two arrays of numbers.
 * @param {number[]} x - The first array of numbers.
 * @param {number[]} y - The second array of numbers.
 * @returns {number} The Pearson correlation coefficient, between -1 and 1.
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
 * @param {number} maxLag - The maximum number of days to shift the secondary series.
 * @returns {{lag: number, correlation: number}[]} An array of objects with the lag and correlation.
 */
export function calculateLaggedCorrelation(primarySeries, secondarySeries, maxLag) {
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

/**
 * Finds the single weather variable with the highest absolute correlation for a given SKU.
 * @param {Array<Object>} skuData - The joined sales and weather data for a single SKU.
 * @param {Array<string>} weatherVariables - The weather metrics to test (e.g., ['avg_temp_c', 'precip_mm']).
 * @returns {Object|null} The best correlation found, or null if none are significant.
 */
export function findTopWeatherCorrelation(skuData, weatherVariables) {
    let topCorrelation = null;
    let maxCorrelation = 0;

    const salesSeries = skuData.map(d => d.sales);

    weatherVariables.forEach(variable => {
        const weatherSeries = skuData.map(d => d[variable] || 0);
        const laggedResults = calculateLaggedCorrelation(salesSeries, weatherSeries, 14);

        const bestLagResult = laggedResults.reduce((best, current) =>
            Math.abs(current.correlation) > Math.abs(best.correlation) ? current : best, 
            { lag: 0, correlation: 0 }
        );

        if (Math.abs(bestLagResult.correlation) > Math.abs(maxCorrelation)) {
            maxCorrelation = bestLagResult.correlation;
            topCorrelation = {
                sku: skuData[0].sku,
                weatherVariable: variable,
                bestLag: bestLagResult.lag,
                correlation: bestLagResult.correlation
            };
        }
    });

    // Only return if the correlation is somewhat meaningful
    if (topCorrelation && Math.abs(topCorrelation.correlation) > 0.15) {
        return topCorrelation;
    }
    
    return null;
}

