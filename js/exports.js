import { Logger } from './logger.js';

/**
 * Exports the curated planner items to a professional-looking PDF document.
 * @param {Array<Object>} plannerItems - The array of items added to the planner.
 * @returns {boolean} True if export was successful, false otherwise.
 */
export function exportPlannerToPDF(plannerItems) {
    if (typeof jspdf === 'undefined') {
        Logger.error('jsPDF library is not loaded. Cannot export to PDF.');
        return false;
    }
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    let y = 22;

    doc.setFontSize(18);
    doc.text("AI-Powered Assortment Action Plan", 14, y);
    y += 10;
    doc.setFontSize(11);
    doc.text("Generated on: " + new Date().toLocaleDateString(), 14, y);
    y += 15;

    plannerItems.forEach((item, index) => {
        if (y > 250) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. SKU: ${item.sku}`, 14, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');

        const scoreColor = item.opportunityScore > 75 ? '#16a34a' : item.opportunityScore > 50 ? '#f59e0b' : '#ef4444';
        doc.setFillColor(scoreColor);
        doc.circle(180, y - 2, 5, 'F');
        doc.setTextColor('#ffffff');
        doc.text(String(item.opportunityScore), 180, y, { align: 'center' });
        doc.setTextColor('#000000');
        
        doc.text(`Opportunity Score:`, 165, y);
        y += 8;

        doc.text(`Recommendation:`, 14, y);
        doc.setFont(undefined, 'bold');
        doc.text(item.recommendation, 45, y);
        doc.setFont(undefined, 'normal');
        y += 6;

        doc.text(`Suggested Units: ${item.suggestedUnits.toLocaleString()}`, 14, y);
        y += 6;
        doc.text(`Estimated Cost: $${item.estimatedCost.toLocaleString()}`, 14, y);
        y += 6;

        doc.text(`Sales Trend: ${item.salesTrendSummary || 'N/A'}`, 14, y);
        y += 6;
        doc.text(`Volatility: ${item.salesVolatilitySummary || 'N/A'}`, 14, y);
        y += 8;
        
        doc.text("AI Reasoning:", 14, y);
        y += 6;
        const reasoningLines = doc.splitTextToSize(item.reasoning, 180);
        doc.text(reasoningLines, 14, y);
        y += reasoningLines.length * 5 + 10;

        if(index < plannerItems.length - 1) {
             doc.setDrawColor(200);
             doc.line(14, y, 196, y);
             y += 10;
        }
    });

    doc.save("AI_Assortment_Plan.pdf");
    Logger.info('Planner exported to PDF.', { itemCount: plannerItems.length });
    return true;
}

/**
 * Exports the curated planner items to a multi-sheet Excel file.
 * @param {Array<Object>} plannerItems - The array of items added to the planner.
 * @returns {boolean} True if export was successful, false otherwise.
 */
export function exportPlannerToExcel(plannerItems) {
    if (typeof XLSX === 'undefined') {
        Logger.error('SheetJS (XLSX) library is not loaded. Cannot export to Excel.');
        return false;
    }

    const wb = XLSX.utils.book_new();
    const sheetData = [
        ["SKU", "Opportunity Score", "Recommendation", "Suggested Units", "Estimated Cost", "Sales Trend", "Sales Volatility", "AI Reasoning"]
    ];

    plannerItems.forEach(item => {
        sheetData.push([
            item.sku,
            item.opportunityScore,
            item.recommendation,
            item.suggestedUnits,
            item.estimatedCost,
            item.salesTrendSummary,
            item.salesVolatilitySummary,
            item.reasoning
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    ws['!cols'] = [
        { wch: 25 }, // SKU
        { wch: 15 }, // Score
        { wch: 20 }, // Recommendation
        { wch: 15 }, // Suggested Units
        { wch: 15 }, // Estimated Cost
        { wch: 40 }, // Sales Trend
        { wch: 40 }, // Sales Volatility
        { wch: 80 }  // AI Reasoning
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, "AI Action Plan");
    XLSX.writeFile(wb, "AI_Assortment_Plan.xlsx");
    Logger.info('Planner exported to Excel.', { itemCount: plannerItems.length });
    return true;
}

