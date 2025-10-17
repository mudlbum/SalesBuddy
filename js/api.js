// This file simulates calls to a backend AI service (like Gemini).
// In a real application, this would make a network request to your server.

export async function callGeminiAPI(prompt, context = {}) {
    console.log("Calling Fake Gemini API with prompt:", prompt, "and context:", context);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    switch (prompt) {
        case "GET_TRENDS":
            return `
                <ul class="list-disc pl-5 space-y-2">
                    <li><strong>Sustainable Materials:</strong> Consumer interest in eco-friendly footwear is up 25% year-over-year. Prioritize products with recycled materials.</li>
                    <li><strong>Gorpcore Aesthetic:</strong> Rugged, outdoor-inspired footwear like hiking boots and trail runners continue to trend in urban markets. The 'Urban Hiker Boot' aligns perfectly with this.</li>
                    <li><strong>Comfort is King:</strong> Demand for cushioned soles and comfortable loafers for 'work from home' and casual office wear remains strong.</li>
                </ul>`;

        case "ANALYZE_PLAN":
             if (context.itemCount === 0) return `<p>Your plan is empty. Add some products from the marketplace to get an analysis.</p>`;
             let analysis = `<p>Based on your selection of ${context.itemCount} styles:</p><ul class="list-disc pl-5 space-y-2 mt-2">`;
             if (!context.hasBoots) analysis += `<li><strong>Opportunity:</strong> Your plan is missing boots. Given the strong 'Gorpcore' trend, consider adding the 'Urban Hiker Boot' or 'Winter Snow Boot' to capture this market.</li>`;
             if (!context.hasSandals) analysis += `<li><strong>Gap:</strong> There are no sandals in your plan. You may be missing out on the high-margin summer season sales.</li>`;
             analysis += `<li><strong>Strength:</strong> You have a good mix of casual footwear like loafers and slip-ons, which aligns with the current comfort trend.</li></ul>`;
             return analysis;

        case "GENERATE_FINANCIAL_SUMMARY":
            const { budget, transactions } = context;
            if (transactions.length === 0) {
                 return `<p>There are no planned orders to summarize. Add items to your assortment plan first.</p>`
            }
            return `
                <div class="space-y-3">
                     <h4 class="font-semibold text-lg">Q4 Financial Outlook</h4>
                     <p>Your current plan commits <strong>$${budget.spent.toLocaleString()}</strong> of your <strong>$${budget.total.toLocaleString()}</strong> budget, which is a commitment of <strong>${((budget.spent / budget.total) * 100).toFixed(1)}%</strong>.</p>
                     <p>This leaves <strong>$${budget.remaining.toLocaleString()}</strong> for in-season opportunities or re-orders.</p>
                     <p>The plan is well-diversified across ${transactions.length} purchase orders. Review vendor terms for potential early payment discounts to improve margins.</p>
                </div>
            `;
        
        case "CHAT_QUERY":
             return `Based on the current assortment plan, the focus on casual wear is strong. To improve, consider adding a product that aligns with the 'Gorpcore' trend, like a hiking boot, to capture a different market segment.`;

        case "PERSONA_CHAT_QUERY":
            const { persona, query } = context;
            if (persona === 'HQ Buyer') {
                return `Thanks for reaching out. Looking at the regional data, your plan seems solid, but let's keep an eye on the budget. We need to make sure we have enough left for Q1 opportunities. Let me know if you see any high-performing items we should double down on.`;
            }
            if (persona === 'Vendor Rep') {
                return `Hi there! Good to hear from you. Regarding your question: Yes, the 'Urban Hiker Boot' has been very popular. We have plenty of stock in all sizes right now, and the current lead time for a new order is about 2-3 weeks. Let me know if you need the latest spec sheet.`;
            }
            return `This is a canned response from ${persona}.`;

        default:
            return "I'm sorry, I can't provide information on that right now.";
    }
}

