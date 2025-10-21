// This file makes real calls to the Gemini API and provides fallbacks.

// Use a reliable proxy to handle browser security (CORS)
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const API_BASE_URL = 'https://generativelanguage.googleapis.com';

const systemPrompts = {
    'AI Assistant': {
        role: "system",
        parts: [{ text: "You are a helpful AI assistant for a retail manager using the SoftMoc Unified Commerce Platform. Your name is 'SalesBuddy'. Be concise, insightful, and focus on providing actionable business advice based on the user's questions. Analyze data provided and offer recommendations on assortment planning, sales trends, and operations." }]
    },
    'HQ Buyer': {
        role: "system",
        parts: [{ text: "You are a senior buyer from the corporate headquarters, communicating with a store manager. Your tone should be professional, data-driven, and supportive. Focus on inventory levels, budget adherence, and overall sales strategy. Keep your responses brief and to the point, like a real chat message." }]
    },
    'Vendor Rep': {
        role: "system",
        parts: [{ text: "You are a sales representative for a major footwear vendor. You are friendly, helpful, and knowledgeable about your products. You are talking to a store manager. You can provide information on product availability, lead times, and new product features. Be positive and encouraging." }]
    },
    'Vendor2 Rep': {
        role: "system",
        parts: [{ text: "You are a sales representative for a competing footwear vendor, 'Urban Kicks'. You are professional but trying to win business. You can provide information on your unique styles, competitive pricing, and flexible ordering options." }]
    },
    'Logistics Manager': {
        role: "system",
        parts: [{ text: "You are the company's logistics manager. You are communicating with a store manager about shipments, inventory transfers, and warehouse operations. Your tone is direct, efficient, and focused on operational details like tracking numbers, delivery schedules, and stock counts." }]
    },
    'Accounting Manager': {
        role: "system",
        parts: [{ text: "You are the company's accounting manager, speaking with a store manager. Your communication style is precise and detail-oriented. You discuss topics like invoice statuses, budget reports, and payroll deadlines." }]
    },
     // --- NEW CONTEXTUAL PROMPTS for the AI Assistant ---
    'assortment-planning': {
        role: "system",
        parts: [{ text: "You are SalesBuddy, an AI assistant for a retail manager viewing the 'Assortment Planning' module. Be concise and focus on trends, products, and purchase planning. You can explain the data on screen and offer suggestions for store allocation based on trends." }]
    },
    'accounting': {
        role: "system",
        parts: [{ text: "You are SalesBuddy, an AI assistant for a retail manager viewing the 'Accounting' module. Be precise and focus on KPIs, invoices, expenses, and payroll. Explain financial terms simply." }]
    },
    'logistics': {
        role: "system",
        parts: [{ text: "You are SalesBuddy, an AI assistant for a retail manager viewing the 'Logistics' module. Be direct and focus on inventory, shipping, and returns. You can provide status updates on orders or explain logistics terms." }]
    },
    'hr': {
        role: "system",
        parts: [{ text: "You are SalesBuddy, an AI assistant for a retail manager viewing the 'HR & Scheduling' module. Be helpful and focus on staffing, schedules, and performance. You cannot approve requests yourself, but you can guide the user on how to do it." }]
    },
    'operations': {
        role: "system",
        parts: [{ text: "You are SalesBuddy, an AI assistant for a retail manager viewing the 'Operation Tasks' module. Your primary function is to help manage the store's to-do list. You can create new tasks via chat (e.g., 'create a task to call the electrician'), explain existing tasks, and help the manager prioritize their day based on the tasks shown." }]
    },
     'GET_ASSORTMENT_TRENDS': {
        role: "user",
        parts: [{ text: "Analyze current market data and provide a JSON object with upcoming seasonal trends for footwear. The object should have keys: 'brands', 'styles', 'colors', 'genders', 'pricePoints'. Each key should be an array of objects, with each object containing 'name' and 'trendPercentage' (a positive integer). Provide at least 4-5 items for each category. Respond ONLY with the raw JSON object, without any markdown formatting." }]
    },
    'ANALYZE_PRODUCT_SUGGESTION': {
         role: "user",
         parts: [{ text: "Analyze the product '{productName}' and provide a detailed recommendation. The response should be in HTML format. It must include a strength, a weakness, and an opportunity based on market data. Use bold tags for headers. Provide specific data points related to sales forecasts, market trends, and economic indicators. Do not use markdown." }]
    },
    'GET_STORE_ALLOCATION_INSIGHT': {
        role: "user",
        parts: [{ text: "For product '{productName}' and store '{storeName}', provide a brief, one-sentence analysis supporting a suggested inventory quantity. Mention a key local demographic or sales trend." }]
    }
};

const sampleResponses = {
    'ANALYZE_PRODUCT_SUGGESTION': (productName) => `
        <ul class="space-y-2">
            <li>
                <strong>Sales Forecast:</strong> 
                <span class="text-green-600 font-semibold">+18% growth</span> projected for the '${productName}' category this quarter, driven by strong performance in urban centers.
            </li>
            <li>
                <strong>Market Trend Correlation:</strong> 
                This product aligns with the dominant <strong>'Retro Runners'</strong> trend (+25% social media engagement) and the rising demand for the <strong>'Velocity'</strong> brand (+12% search volume YoY).
            </li>
            <li>
                <strong>Economic Indicator:</strong> 
                Consumer spending on non-essential goods in this price bracket ($150-$200) has increased by 8% in the last six months, suggesting strong market health.
            </li>
             <li>
                <strong>Weather Outlook:</strong> 
                Warmer than average temperatures are predicted for the next 3 months, which may slightly temper demand for heavier boot styles but boosts runner and sneaker categories.
            </li>
        </ul>
    `,
    'GET_ASSORTMENT_TRENDS': () => JSON.stringify({
        "brands": [{"name":"Velocity","trendPercentage":22},{"name":"TrekWise","trendPercentage":18},{"name":"Milano","trendPercentage":15},{"name":"Aura","trendPercentage":12}],
        "styles": [{"name":"Retro Runners","trendPercentage":25},{"name":"Hiking Boots","trendPercentage":20},{"name":"Chunky Loafers","trendPercentage":18},{"name":"Performance","trendPercentage":10}],
        "colors": [{"name":"Forest Green","trendPercentage":28},{"name":"Deep Blue","trendPercentage":24},{"name":"Cream","trendPercentage":19},{"name":"Burgundy","trendPercentage":15}],
        "genders": [{"name":"Unisex","trendPercentage":30},{"name":"Womens","trendPercentage":15},{"name":"Mens","trendPercentage":12}],
        "pricePoints": [{"name":"$150-$200","trendPercentage":35},{"name":"$200-$250","trendPercentage":25},{"name":"$100-$150","trendPercentage":20}]
    }),
    'GET_STORE_ALLOCATION_INSIGHT': (productName, storeName) => `The ${storeName} area shows high demand for ${productName.split(' ')[1]} styles among young professionals.`
};


export async function callGeminiAPI(promptOrPersona, chatHistory = [], metadata = {}) {
    const apiKey = "AIzaSyCh9hgOOi_sCezHGHJo8Wb3xQkuQTEE9Zs"; 
    const urlPath = "/v1beta/models/gemini-2.5-flash:generateContent";
    const apiUrl = `${PROXY_URL}${API_BASE_URL}${urlPath}`;

    let payload;
    let systemInstruction = systemPrompts[promptOrPersona];

    // Context Switching Logic: If it's the AI Assistant, check for a more specific module prompt.
    if (promptOrPersona === 'AI Assistant' && metadata.moduleId && systemPrompts[metadata.moduleId]) {
        systemInstruction = systemPrompts[metadata.moduleId];
    }

    // Chat-based request using a system prompt
    if (systemInstruction && systemInstruction.role === 'system') {
        payload = {
            contents: chatHistory,
            systemInstruction: systemInstruction
        };
    } else { // Tool-based request (e.g., GET_ASSORTMENT_TRENDS)
        let promptText = systemPrompts[promptOrPersona]?.parts[0]?.text || "Provide a helpful response.";
        if (promptOrPersona === 'ANALYZE_PRODUCT_SUGGESTION' && metadata.productName) {
            promptText = promptText.replace('{productName}', metadata.productName);
        }
        if (promptOrPersona === 'GET_STORE_ALLOCATION_INSIGHT' && metadata.productName && metadata.storeName) {
            promptText = promptText.replace('{productName}', metadata.productName).replace('{storeName}', metadata.storeName);
        }
        payload = { contents: [{ role: "user", parts: [{ text: promptText }] }] };
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'X-goog-api-key': apiKey,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error("API request failed:", response.status, await response.text());
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.error("Invalid response structure:", result);
            throw new Error("Invalid response structure from API.");
        }
    } catch (error) {
        console.warn("API call failed, using fallback sample response.", error);
        // Provide a sample response on failure
        if (sampleResponses[promptOrPersona]) {
             if (promptOrPersona === 'ANALYZE_PRODUCT_SUGGESTION') {
                return sampleResponses[promptOrPersona](metadata.productName);
            }
            if (promptOrPersona === 'GET_STORE_ALLOCATION_INSIGHT') {
                return sampleResponses[promptOrPersona](metadata.productName, metadata.storeName);
            }
            return sampleResponses[promptOrPersona]();
        }
        return "Sorry, there was an error connecting to the AI service.";
    }
}
