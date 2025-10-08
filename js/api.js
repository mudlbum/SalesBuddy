// --- Gemini API Configuration ---
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Calls the Gemini API with the provided payload.
 * @param {string} apiKey - The user's Gemini API key.
 * @param {object} payload - The data payload containing the prompt.
 * @returns {Promise<string>} The text response from the API.
 */
export async function callGemini(apiKey, payload) {
    if (!apiKey) {
        throw new Error("Gemini API key is missing. Please add it in the settings.");
    }

    const fullUrl = `${GEMINI_API_URL}?key=${apiKey}`;
    
    const requestBody = {
        contents: [{
            parts: [{ text: payload.prompt }]
        }]
    };

    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error:', errorData);
            throw new Error(`API request failed: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
            throw new Error("Received an invalid or empty response from the Gemini API.");
        }
        
        return text;

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error; // Re-throw to be caught by the main app logic
    }
}

/**
 * Fetches historical weather data from WeatherAPI.com.
 * @param {string} apiKey - The user's Weather API key.
 * @param {string} location - The location to fetch weather for.
 * @param {string} startDate - The start date (YYYY-MM-DD).
 * @param {string} endDate - The end date (YYYY-MM-DD).
 * @returns {Promise<object>} A promise that resolves to the weather data.
 */
export async function fetchWeather(apiKey, location, startDate, endDate) {
     if (!apiKey) {
        console.warn("Weather API key is missing. Returning mock data for development.");
        return getMockWeatherData();
    }
    
    // Using WeatherAPI.com history endpoint. Note: It may require a paid plan for date ranges.
    // For free tier, you might need to make single-day requests in a loop.
    const WEATHER_API_ENDPOINT = `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${location}&dt=${startDate}&end_dt=${endDate}`;

    try {
        const response = await fetch(WEATHER_API_ENDPOINT);
        if (!response.ok) {
             const errorData = await response.json();
             console.error('Weather API Error:', errorData);
            throw new Error(`Weather API request failed: ${errorData.error?.message || 'Check API key and location.'}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching real weather data:', error);
        alert('Failed to fetch real weather data. Please check your API key and location. Falling back to mock data.');
        return getMockWeatherData(); // Fallback on error
    }
}

/**
 * Returns mock weather data for development and fallback purposes.
 */
function getMockWeatherData() {
    return {
        "location": { "name": "New York" },
        "forecast": {
            "forecastday": [
                { "date": "2023-01-01", "day": { "maxtemp_c": 5.2, "condition": { "text": "Cloudy" } } },
                { "date": "2023-01-02", "day": { "maxtemp_c": 3.1, "condition": { "text": "Snow" } } },
                { "date": "2023-01-03", "day": { "maxtemp_c": 7.5, "condition": { "text": "Sunny" } } },
                { "date": "2023-01-04", "day": { "maxtemp_c": 6.0, "condition": { "text": "Rain" } } },
            ]
        }
    };
}

