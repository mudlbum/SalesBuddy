// This file makes real calls to the Gemini API.

// System prompts define the persona and instructions for the AI model.
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
    'GET_TRENDS': {
        role: "user",
        parts: [{ text: "As a retail analyst, provide a bulleted list of the top 3 current footwear trends for the upcoming season. Include a brief, one-sentence description for each trend." }]
    },
    'ANALYZE_PLAN': {
         role: "user",
         parts: [{ text: "Analyze the following assortment plan and provide a strength, a weakness, and an opportunity for improvement. Context: {planContext}" }]
    }
};


export async function callGeminiAPI(promptOrPersona, context = {}) {
    const apiKey = "AIzaSyCh9hgOOi_sCezHGHJo8Wb3xQkuQTEE9Zs"; // This will be handled by the environment.
    const apiUrl = `https://generativelace.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    let payload;

    // Check if it's a chat-based request by seeing if the persona exists in our prompts
    if (systemPrompts[promptOrPersona] && systemPrompts[promptOrPersona].role === 'system') {
        payload = {
            contents: context, // context is the chat history
            systemInstruction: systemPrompts[promptOrPersona]
        };
    } else {
        // Handle non-chat, tool-based requests
        let promptText = systemPrompts[promptOrPersona]?.parts[0]?.text || "Provide a helpful response.";
        if (promptOrPersona === 'ANALYZE_PLAN' && context) {
            const planContext = `Item Count: ${context.itemCount}, Has Boots: ${context.hasBoots}, Has Sandals: ${context.hasSandals}`;
            promptText = promptText.replace('{planContext}', planContext);
        }
        
        payload = {
            contents: [{ role: "user", parts: [{ text: promptText }] }]
        };
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error("API request failed with status:", response.status);
            const errorBody = await response.text();
            console.error("Error body:", errorBody);
            return "Sorry, there was an error connecting to the AI service.";
        }

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts[0].text) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.error("Invalid response structure from API:", result);
            return "I'm sorry, I received an unexpected response. Please try again.";
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "An error occurred while trying to reach the AI assistant. Please check your connection.";
    }
}
