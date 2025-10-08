/**
 * @fileoverview Utility functions for advanced statistical calculations.
 * This module provides robust functions for correlation analysis across multiple datasets.
 */

/**
 * Calculates the Pearson correlation coefficient between two arrays of numbers.
 * This version includes checks for variance to avoid misleading results.
 * @param {number[]} x - The first array of numbers.
 * @param {number[]} y - The second array of numbers.
 * @returns {number} The Pearson correlation coefficient, a value between -1 and 1. Returns 0 if calculation is not possible.
 */
function calculatePearsonCorrelation(x, y) {
    const n = x.length;
    if (n < 2 || n !== y.length) {
        return 0; // Correlation requires at least 2 data points and equal length arrays.
    }

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
    const sumX2 = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);
    const sumY2 = y.map(yi => yi * yi).reduce((a, b) => a + b, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominatorX = n * sumX2 - sumX * sumX;
    const denominatorY = n * sumY2 - sumY * sumY;

    // If one of the series has zero variance (all values are the same), correlation is not meaningful.
    if (denominatorX === 0 || denominatorY === 0) {
        return 0;
    }

    const denominator = Math.sqrt(denominatorX * denominatorY);

    return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Finds the best lagged correlation between two time series.
 * This helps identify delayed effects (e.g., does a rainy day affect sales 3 days later?).
 * @param {number[]} primarySeries - The main series (e.g., sales).
 * @param {number[]} secondarySeries - The series to test for correlation (e.g., temperature).
 * @param {number} maxLag - The maximum number of days/periods to shift the secondary series.
 * @returns {{lag: number, correlation: number}} An object with the lag and correlation that has the highest absolute value.
 */
export function findBestLaggedCorrelation(primarySeries, secondarySeries, maxLag = 14) {
    let bestResult = { lag: 0, correlation: 0 };

    for (let lag = 0; lag <= maxLag; lag++) {
        // Create lagged version of the secondary series by taking a slice from the beginning
        const laggedSecondary = secondarySeries.slice(0, secondarySeries.length - lag);
        
        // Align the primary series by removing elements from the start to match the lagged series
        const alignedPrimary = primarySeries.slice(lag);

        if (alignedPrimary.length > 1) { // Ensure there are enough points to compare
            const correlation = calculatePearsonCorrelation(alignedPrimary, laggedSecondary);
            
            // If the absolute correlation of the current lag is stronger than the best one found so far, update it.
            if (Math.abs(correlation) > Math.abs(bestResult.correlation)) {
                bestResult = { lag, correlation };
            }
        }
    }
    return bestResult;
}

