/**
 * Prepares a detailed data payload to be sent to the Gemini API.
 * This function creates a clear, structured prompt for the AI.
 * @param {object} salesData - An object containing information about the sales file.
 * @param {object} weatherData - The fetched weather data from the API.
 * @returns {object} A structured payload object with a detailed prompt.
 */
export function preparePayload(salesData, weatherData) {
    // In a real application, you would parse the salesData file and join it with weatherData.
    // For this example, we'll create a detailed prompt using metadata.
    const weatherSummary = weatherData.forecast.forecastday.map(d => 
        `Date: ${d.date}, Max Temp: ${d.day.maxtemp_c}°C, Condition: ${d.day.condition.text}`
    ).join('; ');

    const prompt = `
        Analyze the correlation between sales data and weather patterns.
        
        Sales Data File: ${salesData.fileName}
        
        Historical Weather Summary for the period:
        ${weatherSummary}
        
        Based on this information, please provide:
        1. A bulleted list of 3-5 key findings about how weather impacts sales.
        2. For each finding, provide a confidence score from 1 to 5 stars (e.g., ★★★☆☆).
        3. For each finding, provide a short, actionable suggestion for a store manager.
        
        Format each finding like this:
        - [Finding text] | Confidence: [Star rating] | Suggestion: [Actionable suggestion]
    `;
    return { prompt };
}

/**
 * Parses the raw text response from the Gemini API into a structured array of objects.
 * This version is more robust and expects a specific format from the prompt.
 * @param {string} rawText - The text response from the Gemini API.
 * @returns {Array<object>} An array of insight objects.
 */
export function parseGeminiResponse(rawText) {
    if (!rawText || typeof rawText !== 'string') {
        console.error("Invalid input to parseGeminiResponse:", rawText);
        return [];
    }
    
    const insights = [];
    const lines = rawText.split('\n').filter(line => line.trim().startsWith('-'));

    lines.forEach(line => {
        try {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length < 3) return;

            const text = parts[0].replace(/^-/, '').trim();
            
            let stars = 0;
            const starMatch = parts[1].match(/★/g);
            if (starMatch) {
                stars = starMatch.length;
            }

            const suggestion = parts[2].replace(/Suggestion:/, '').trim();

            insights.push({ text, stars, suggestion });
        } catch (e) {
            console.warn("Could not parse line:", line);
        }
    });

    if (insights.length === 0) {
        return [{ text: "Could not parse the AI's response. Raw output: " + rawText, stars: 1, suggestion: "Review the raw output." }];
    }

    return insights;
}

/**
 * Exports the analysis results to a PDF document using jsPDF.
 * @param {Array<object>} analysisResults - The array of insight objects.
 */
export function exportToPDF(analysisResults) {
    if (typeof jspdf === 'undefined') {
        alert('jsPDF library is not loaded.');
        return;
    }
    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("AI Sales Forecasting Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    let y = 45;
    analysisResults.forEach((result, index) => {
        if (y > 270) { // Add new page if content overflows
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFont(undefined, 'bold');
        doc.text(`Insight ${index + 1}:`, 14, y);
        
        doc.setFont(undefined, 'normal');
        const findingText = doc.splitTextToSize(result.text, 180); // wrap text
        doc.text(findingText, 14, y + 7);
        y += (findingText.length * 5) + 10;
        
        doc.setFont(undefined, 'bold');
        doc.text(`Confidence: `, 14, y);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(234, 179, 8); // Yellow color for stars
        doc.text('★'.repeat(result.stars) + '☆'.repeat(5 - result.stars), 40, y);
        y += 7;
        
        doc.setTextColor(0);
        doc.setFont(undefined, 'bold');
        doc.text(`Suggestion: `, 14, y);
        doc.setFont(undefined, 'normal');
        const suggestionText = doc.splitTextToSize(result.suggestion, 160);
        doc.text(suggestionText, 40, y);
        y += (suggestionText.length * 5) + 15;
    });

    doc.save("AI_Sales_Forecast_Report.pdf");
}

/**
 * Exports the analysis results to an Excel (XLSX) file using SheetJS.
 * @param {Array<object>} analysisResults - The array of insight objects.
 */
export function exportToExcel(analysisResults) {
    if (typeof XLSX === 'undefined') {
        alert('SheetJS library is not loaded.');
        return;
    }

    const worksheetData = [
        ["Finding", "Confidence (1-5)", "Suggestion"]
    ];

    analysisResults.forEach(result => {
        worksheetData.push([result.text, result.stars, result.suggestion]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths for better readability
    worksheet['!cols'] = [{ wch: 70 }, { wch: 20 }, { wch: 70 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AI Insights");

    XLSX.writeFile(workbook, "AI_Sales_Forecast_Report.xlsx");
}

