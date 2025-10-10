/**
 * @fileoverview This module handles all external API communications,
 * including calls to the Gemini and Weather APIs.
 */

// --- Configuration ---
// For production, these should be moved to a backend service to protect them.
const API_CONFIG = {
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    WEATHER_API_URL: 'https://api.weatherapi.com/v1/history.json',
};

/**
 * Retrieves an API key from local storage.
 * In a production environment, this should be replaced with a secure method.
 * @param {('gemini' | 'weather')} serviceName - The service for which to get the key.
 * @returns {string|null} The API key.
 */
function getApiKey(serviceName) {
    const key = localStorage.getItem(`${serviceName}ApiKey`);
    if (!key) {
        console.warn(`${serviceName} API key is missing from local storage.`);
    }
    return key;
}

/**
 * Calls the Gemini API with a prompt and expects a JSON response.
 * @param {string} prompt - The detailed text prompt for the AI.
 * @returns {Promise<object>} The parsed JSON object from the API response.
 */
export async function callGemini(prompt) {
    const apiKey = getApiKey('gemini');
    if (!apiKey) {
        throw new Error("Gemini API key is missing. Please add it in the settings modal.");
    }

    const fullUrl = `${API_CONFIG.GEMINI_API_URL}?key=${apiKey}`;
    const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        // Request a JSON response for more reliable parsing.
        generationConfig: {
            "response_mime_type": "application/json",
        }
    };

    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API request failed: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!rawText) {
            throw new Error("Received an invalid or empty response from the Gemini API.");
        }

        // The response from the API is a string that needs to be parsed into a JSON object.
        return JSON.parse(rawText);

    } catch (error) {
        console.error('Error calling or parsing Gemini API response:', error);
        // Re-throw the error to be handled by the main application logic.
        throw error;
    }
}

/**
 * Fetches historical weather data for multiple locations concurrently.
 * @param {string[]} locations - An array of location names.
 * @param {string} startDate - The start date in "YYYY-MM-DD" format.
 * @param {string} endDate - The end date in "YYYY-MM-DD" format.
 * @returns {Promise<{weatherData: object, failedLocations: string[]}>} Contains fetched data and a list of failed locations.
 */
export async function fetchWeatherForLocations(locations, startDate, endDate) {
    const apiKey = getApiKey('weather');
    if (!apiKey) {
        console.warn("Weather API key is missing. Proceeding without weather data enrichment.");
        return { weatherData: {}, failedLocations: locations };
    }

    // Create a promise for each location to fetch its weather data.
    const weatherPromises = locations.map(location => 
        fetchSingleLocationWeather(apiKey, location, startDate, endDate)
    );

    // Promise.allSettled allows all promises to complete, even if some fail.
    const results = await Promise.allSettled(weatherPromises);

    const weatherData = {};
    const failedLocations = [];

    results.forEach((result, index) => {
        const location = locations[index];
        if (result.status === 'fulfilled') {
            weatherData[location] = result.value;
        } else {
            failedLocations.push(location);
            console.error(`Failed to fetch weather for ${location}:`, result.reason);
        }
    });

    return { weatherData, failedLocations };
}

/**
 * Fetches historical weather for a single location.
 * Note: The WeatherAPI.com history endpoint only allows fetching one day at a time.
 * This function iterates through the date range to collect the daily data.
 * @param {string} apiKey - The Weather API key.
 * @param {string} location - The location name.
 * @param {string} startDate - The start date.
 * @param {string} endDate - The end date.
 * @returns {Promise<Array<Object>>} An array of daily weather records.
 */
async function fetchSingleLocationWeather(apiKey, location, startDate, endDate) {
    const dailyData = [];
    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    // Loop through each day in the date range.
    while (currentDate <= lastDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        const apiUrl = `${API_CONFIG.WEATHER_API_URL}?key=${apiKey}&q=${encodeURIComponent(location)}&dt=${dateString}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`(${response.status}) ${errorData.error.message}`);
        }
        const data = await response.json();
        const forecastDay = data.forecast.forecastday[0];
        
        if (forecastDay) {
            dailyData.push({
                date: forecastDay.date,
                avg_temp_c: forecastDay.day.avgtemp_c,
                precip_mm: forecastDay.day.totalprecip_mm,
                wind_kph: forecastDay.day.maxwind_kph,
                condition: forecastDay.day.condition.text,
            });
        }
        // Move to the next day.
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dailyData;
}
