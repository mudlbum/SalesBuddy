// This file makes real calls to the Gemini API and provides fallbacks.

// Use a reliable proxy to handle browser security (CORS)
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/'; // Note: Consider a more robust proxy for production
const API_BASE_URL = 'https://generativelanguage.googleapis.com';
// IMPORTANT: Replace with your actual API Key - DO NOT COMMIT THIS TO GIT
const API_KEY = "AIzaSyCh9hgOOi_sCezHGHJo8Wb3xQkuQTEE9Zs"; // Replace with your key

if (API_KEY === "AIzaSyCh9hgOOi_sCezHGHJo8Wb3xQkuQTEE9Zs") {
    console.warn("API Key not set in js/api.js. Using fallback responses.");
    // Optionally, disable API calls entirely or show a UI warning
}


const systemPrompts = {
    'AI Assistant': {
        // FIX: System prompts should be structured for the systemInstruction field
        parts: [{ text: "You are a helpful AI assistant for a retail manager using the SoftMoc Unified Commerce Platform. Your name is 'SalesBuddy'. Be concise, insightful, and focus on providing actionable business advice based on the user's questions. Analyze data provided and offer recommendations on assortment planning, sales trends, and operations." }]
    },
    'HQ Buyer': {
        parts: [{ text: "You are a senior buyer from the corporate headquarters, communicating with a store manager. Your tone should be professional, data-driven, and supportive. Focus on inventory levels, budget adherence, and overall sales strategy. Keep your responses brief and to the point, like a real chat message." }]
    },
    'Vendor Rep': {
        parts: [{ text: "You are a sales representative for a major footwear vendor. You are friendly, helpful, and knowledgeable about your products. You are talking to a store manager. You can provide information on product availability, lead times, and new product features. Be positive and encouraging." }]
    },
    'Vendor2 Rep': {
        parts: [{ text: "You are a sales representative for a competing footwear vendor, 'Urban Kicks'. You are professional but trying to win business. You can provide information on your unique styles, competitive pricing, and flexible ordering options." }]
    },
    'Logistics Manager': {
        parts: [{ text: "You are the company's logistics manager. You are communicating with a store manager about shipments, inventory transfers, and warehouse operations. Your tone is direct, efficient, and focused on operational details like tracking numbers, delivery schedules, and stock counts." }]
    },
    'Accounting Manager': {
        parts: [{ text: "You are the company's accounting manager, speaking with a store manager. Your communication style is precise and detail-oriented. You discuss topics like invoice statuses, budget reports, and payroll deadlines." }]
    },
     // --- NEW CONTEXTUAL PROMPTS for the AI Assistant ---
    'assortment-planning': {
        parts: [{ text: "You are SalesBuddy, an AI assistant for a retail manager viewing the 'Assortment Planning' module. Be concise and focus on trends, products, purchase planning, budget, and store allocation based on the data visible in this module. You can explain the data on screen (like trends, product details, budgets) and offer suggestions. Assume the user is looking at this specific module." }]
    },
    'accounting': {
        parts: [{ text: "You are SalesBuddy, an AI assistant for a retail manager viewing the 'Accounting' module. Be precise and focus on KPIs, invoices, expenses, and payroll visible in this module. Explain financial terms simply based on the context of this module." }]
    },
    'logistics': {
        parts: [{ text: "You are SalesBuddy, an AI assistant for a retail manager viewing the 'Logistics' module. Be direct and focus on inventory levels, shipping statuses, warehouse capacity, and returns visible in this module. You can provide status updates on orders or explain logistics terms based on this module's context." }]
    },
    'hr': {
        parts: [{ text: "You are SalesBuddy, an AI assistant for a retail manager viewing the 'HR & Scheduling' module. Be helpful and focus on staffing, schedules, time-off requests, and performance reviews visible in this module. You cannot approve requests yourself, but you can guide the user on how to do it within the platform." }]
    },
    'operations': {
        parts: [{ text: "You are SalesBuddy, an AI assistant for a retail manager viewing the 'Operation Tasks' module. Your primary function is to help manage the store's task list and weekly planner visible in this module. You can create new tasks via chat (e.g., 'create a task to call the electrician'), explain existing tasks, and help the manager prioritize their day based on the tasks shown." }]
    },
     // --- Tool Prompts (Keep role: 'user' here as they are direct requests) ---
     'GET_ASSORTMENT_TRENDS': {
        role: "user", // This is correct, it's a direct user request simulation
        parts: [{ text: "Analyze current market data and provide a JSON object with upcoming seasonal trends for footwear. The object should have keys: 'brands', 'styles', 'colors', 'genders', 'pricePoints'. Each key should be an array of objects, with each object containing 'name' and 'trendPercentage' (a positive integer). Provide at least 4-5 items for each category. Respond ONLY with the raw JSON object, without any markdown formatting." }]
    },
    'ANALYZE_PRODUCT_SUGGESTION': {
         role: "user", // This is correct
         parts: [{ text: "Analyze the product '{productName}' and provide a detailed recommendation. The response should be in HTML format suitable for direct injection into a list (e.g., using <li> tags). It must include a strength, a weakness, and an opportunity based on market data. Use bold tags (<strong>) for headers like 'Sales Forecast:'. Provide specific data points related to sales forecasts, market trends, and economic indicators. Do not use markdown backticks or full HTML document structure. Example item: <li><strong>Sales Forecast:</strong> <span class=\"text-green-600 font-semibold\">+18% growth</span> projected...</li>" }]
    },
    'GET_STORE_ALLOCATION_INSIGHT': {
        role: "user", // This is correct
        parts: [{ text: "For product '{productName}' and store '{storeName}', provide a brief, one-sentence analysis supporting a suggested inventory quantity. Mention a key local demographic or sales trend." }]
    }
};

// Fallback responses if API key is missing or call fails
const sampleResponses = {
    'AI Assistant': () => "How can I assist with your store management tasks today?",
    'HQ Buyer': () => "Checking in on inventory levels. Are we on track with the Q4 plan?",
    'Vendor Rep': () => "Hi there! Just wanted to let you know about our new spring collection arriving soon.",
    'Vendor2 Rep': () => "Following up - have you had a chance to review the Urban Kicks catalog I sent?",
    'Logistics Manager': () => "Shipment ETA for order #89339 is now EOD tomorrow due to weather delays.",
    'Accounting Manager': () => "Reminder: Q3 expense reports are due by Friday.",
    // Contextual fallbacks
    'assortment-planning': () => "Looking at the assortment plan? Let me know if you need help analyzing trends or budget.",
    'accounting': () => "Need help understanding the accounting KPIs or invoice statuses?",
    'logistics': () => "Need an update on inventory or shipments in the logistics module?",
    'hr': () => "Managing schedules or staff in HR? Ask me anything.",
    'operations': () => "Let me help you prioritize your operational tasks for today.",
    // Tool fallbacks
    'ANALYZE_PRODUCT_SUGGESTION': (productName) => `
        <ul class="space-y-2">
            <li><strong>Sales Forecast:</strong> <span class="text-green-600 font-semibold">+15% growth</span> projected (Sample Data).</li>
            <li><strong>Market Trend:</strong> Aligns with 'Sample Trend' (+20% engagement) (Sample Data).</li>
            <li><strong>Economic:</strong> Consumer spending stable in this bracket (Sample Data).</li>
        </ul>
    `,
    'GET_ASSORTMENT_TRENDS': () => JSON.stringify({
        "brands": [{"name":"Velocity","trendPercentage":22},{"name":"TrekWise","trendPercentage":18},{"name":"Milano","trendPercentage":15},{"name":"Aura","trendPercentage":12}],
        "styles": [{"name":"Retro Runners","trendPercentage":25},{"name":"Hiking Boots","trendPercentage":20},{"name":"Chunky Loafers","trendPercentage":18},{"name":"Performance","trendPercentage":10}],
        "colors": [{"name":"Forest Green","trendPercentage":28},{"name":"Deep Blue","trendPercentage":24},{"name":"Cream","trendPercentage":19},{"name":"Burgundy","trendPercentage":15}],
        "genders": [{"name":"Unisex","trendPercentage":30},{"name":"Womens","trendPercentage":15},{"name":"Mens","trendPercentage":12}],
        "pricePoints": [{"name":"$150-$200","trendPercentage":35},{"name":"$200-$250","trendPercentage":25},{"name":"$100-$150","trendPercentage":20}]
    }),
    'GET_STORE_ALLOCATION_INSIGHT': (productName, storeName) => `The ${storeName} area shows sample demand for ${productName ? productName.split(' ')[1] : 'these'} styles.`
};


/**
 * Calls the Gemini API.
 * @param {string} promptOrPersona - Identifier for the system prompt or tool request.
 * @param {Array} chatHistory - Array of message objects (role: 'user' or 'model').
 * @param {object} metadata - Additional data like moduleId, productName, storeName.
 * @returns {Promise<string>} - The generated text response.
 */
export async function callGeminiAPI(promptOrPersona, chatHistory = [], metadata = {}) {
    // Use fallback immediately if API key is missing
    if (API_KEY === "YOUR_GEMINI_API_KEY") {
        console.warn("API Key missing, using fallback response for:", promptOrPersona);
        return getFallbackResponse(promptOrPersona, metadata);
    }

    const urlPath = "/v1beta/models/gemini-2.5-flash:generateContent";
    const apiUrl = `${PROXY_URL}${API_BASE_URL}${urlPath}`; // Using proxy

    let payload;
    let systemInstruction = null; // Initialize systemInstruction

    // Check if it's a specific tool request first
    const toolPrompt = systemPrompts[promptOrPersona];
    if (toolPrompt && toolPrompt.role === 'user') {
        // Handle tool-based requests (e.g., GET_ASSORTMENT_TRENDS)
        let promptText = toolPrompt.parts[0]?.text || "Provide a helpful response.";
        if (promptOrPersona === 'ANALYZE_PRODUCT_SUGGESTION' && metadata.productName) {
            promptText = promptText.replace('{productName}', metadata.productName);
        }
        if (promptOrPersona === 'GET_STORE_ALLOCATION_INSIGHT' && metadata.productName && metadata.storeName) {
            promptText = promptText.replace('{productName}', metadata.productName).replace('{storeName}', metadata.storeName);
        }
        // Tool requests don't typically use chat history or system prompts in this structure
        payload = { contents: [{ role: "user", parts: [{ text: promptText }] }] };

    } else {
        // Handle chat-based requests
        let baseSystemPrompt = systemPrompts[promptOrPersona];

        // Context Switching Logic: If it's the AI Assistant, check for a more specific module prompt.
        if (promptOrPersona === 'AI Assistant' && metadata.moduleId && systemPrompts[metadata.moduleId]) {
            baseSystemPrompt = systemPrompts[metadata.moduleId];
            console.log(`Using contextual prompt for module: ${metadata.moduleId}`);
        } else {
             console.log(`Using base prompt for persona: ${promptOrPersona}`);
        }

        // Ensure we have a valid system prompt structure
        if (baseSystemPrompt && baseSystemPrompt.parts) {
             systemInstruction = {
                // FIX: Structure system prompt correctly for the API
                role: "system", // Although API docs say optional, let's include it conceptually
                parts: baseSystemPrompt.parts
            };
        } else {
            console.warn(`No valid system prompt found for: ${promptOrPersona}. Using default behavior.`);
            // You might want a default system prompt here if needed
             systemInstruction = { role: "system", parts: [{ text: "You are a helpful assistant."}] };
        }


        // FIX: Ensure chatHistory only contains valid roles ('user', 'model')
        const validChatHistory = chatHistory.filter(msg => msg.role === 'user' || msg.role === 'model');

        payload = {
            contents: validChatHistory,
            // FIX: Add systemInstruction field separately
            systemInstruction: systemInstruction
        };
    }


    try {
        console.log("API Payload:", JSON.stringify(payload, null, 2)); // Log payload for debugging
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': API_KEY, // Use the API_KEY variable
                'X-Requested-With': 'XMLHttpRequest' // Might be needed for some proxies
            },
            body: JSON.stringify(payload)
        });

        const responseBodyText = await response.text(); // Get raw response text

        if (!response.ok) {
            console.error("API request failed:", response.status, responseBodyText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = JSON.parse(responseBodyText); // Parse JSON after checking ok status

        if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
            return result.candidates[0].content.parts[0].text;
        } else if (result.promptFeedback && result.promptFeedback.blockReason) {
             console.error("API Response Blocked:", result.promptFeedback.blockReason, result.promptFeedback.safetyRatings);
             return `Response blocked due to: ${result.promptFeedback.blockReason}. Please rephrase your message.`;
        }
         else {
            console.error("Invalid response structure:", result);
            throw new Error("Invalid response structure from API.");
        }
    } catch (error) {
        console.warn("API call failed, using fallback sample response.", error);
        return getFallbackResponse(promptOrPersona, metadata);
    }
}

/**
 * Gets the appropriate fallback response.
 * @param {string} promptOrPersona
 * @param {object} metadata
 * @returns {string}
 */
function getFallbackResponse(promptOrPersona, metadata) {
     if (sampleResponses[promptOrPersona]) {
        const responseGenerator = sampleResponses[promptOrPersona];
        if (typeof responseGenerator === 'function') {
            // Pass necessary metadata for specific fallbacks
            if (promptOrPersona === 'ANALYZE_PRODUCT_SUGGESTION') {
                return responseGenerator(metadata.productName);
            }
            if (promptOrPersona === 'GET_STORE_ALLOCATION_INSIGHT') {
                return responseGenerator(metadata.productName, metadata.storeName);
            }
            return responseGenerator(); // For general fallbacks
        }
        return responseGenerator; // If it's just a string
    }
    // Generic fallback if no specific one is defined
    return "Sorry, there was an error connecting to the AI service (using fallback).";
}
