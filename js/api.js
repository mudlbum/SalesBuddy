// --- Gemini API Configuration ---
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Calls the Gemini API with the provided prompt.
 * Includes improved error handling and a clear request structure.
 * @param {string} apiKey - The user's Gemini API key.
 * @param {string} prompt - The detailed text prompt for the AI.
 * @returns {Promise<string>} The text response from the API.
 */
export async function callGemini(apiKey, prompt) {
    if (!apiKey) {
        throw new Error("Gemini API key is missing. Please add it in settings.");
    }

    const fullUrl = `${GEMINI_API_URL}?key=${apiKey}`;
    
    const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        // Adding safety settings can help prevent irrelevant or harmful responses.
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
    };

    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            const message = errorData.error?.message || 'An unknown error occurred with the API request.';
            throw new Error(`Gemini API Error: ${message}`);
        }

        const data = await response.json();
        
        // Check for empty or blocked responses
        if (!data.candidates || data.candidates.length === 0) {
            const blockReason = data.promptFeedback?.blockReason || 'No content';
            throw new Error(`AI response was blocked. Reason: ${blockReason}. Your prompt may contain sensitive content.`);
        }
        
        const text = data.candidates[0].content?.parts?.[0]?.text;
        
        if (!text) {
            throw new Error("Received a valid but empty response from the Gemini API.");
        }
        
        return text;

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        // Re-throw the error to be caught by the main application logic
        throw error;
    }
}


/**
 * Fetches historical weather data for a single location, day by day.
 * @param {string} apiKey - The user's Weather API key.
 * @param {string} location - The location to fetch weather for.
 * @param {string} startDate - The start date in "YYYY-MM-DD" format.
 * @param {string} endDate - The end date in "YYYY-MM-DD" format.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of daily weather records.
 */
async function fetchWeatherForSingleLocation(apiKey, location, startDate, endDate) {
    const results = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        const apiUrl = `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${encodeURIComponent(location)}&dt=${dateString}`;
        
        // Small delay to avoid hitting rate limits if the date range is very large
        await new Promise(resolve => setTimeout(resolve, 50)); 
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            // Throw a specific error for this location that can be caught later
            throw new Error(`Weather data for "${location}" failed: ${errorData.error.message}`);
        }
        const data = await response.json();
        const forecastDay = data.forecast.forecastday[0];
        
        results.push({
            date: forecastDay.date,
            max_temp_c: forecastDay.day.maxtemp_c,
            min_temp_c: forecastDay.day.mintemp_c,
            avg_temp_c: forecastDay.day.avgtemp_c,
            precip_mm: forecastDay.day.totalprecip_mm,
            wind_kph: forecastDay.day.maxwind_kph,
            condition: forecastDay.day.condition.text
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }
    return results;
}

/**
 * Fetches historical weather for multiple locations concurrently.
 * @param {string} apiKey - The user's Weather API key.
 * @param {string[]} locations - An array of unique location names.
 * @param {string} startDate - The start date in "YYYY-MM-DD" format.
 * @param {string} endDate - The end date in "YYYY-MM-DD" format.
 * @returns {Promise<{weatherData: Object, failedLocations: string[]}>} An object containing the fetched data and a list of any locations that failed.
 */
export async function fetchWeatherForLocations(apiKey, locations, startDate, endDate) {
    if (!apiKey) {
        throw new Error("Weather API key is missing. Please add it in settings.");
    }

    // Create an array of promises, one for each location
    const promises = locations.map(location => 
        fetchWeatherForSingleLocation(apiKey, location, startDate, endDate)
    );

    // Use Promise.allSettled to wait for all promises to resolve, even if some fail
    const results = await Promise.allSettled(promises);

    const weatherData = {};
    const failedLocations = [];

    results.forEach((result, index) => {
        const location = locations[index];
        if (result.status === 'fulfilled') {
            weatherData[location] = result.value;
        } else {
            console.error(`Failed to fetch weather for ${location}:`, result.reason.message);
            failedLocations.push(location);
        }
    });

    return { weatherData, failedLocations };
}

