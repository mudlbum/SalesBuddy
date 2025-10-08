// --- Gemini API Configuration ---
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Calls the Gemini API with the provided prompt.
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
        contents: [{ parts: [{ text: prompt }] }]
    };

    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API request failed: ${errorData.error?.message || response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
            throw new Error("Received an invalid or empty response from the Gemini API.");
        }
        return text;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
    }
}

/**
 * Fetches historical weather data for multiple locations concurrently.
 * @param {string} apiKey - The user's Weather API key.
 * @param {string[]} locations - An array of location names to fetch weather for.
 * @param {string} startDate - The start date in "YYYY-MM-DD" format.
 * @param {string} endDate - The end date in "YYYY-MM-DD" format.
 * @returns {Promise<{weatherData: object, failedLocations: string[]}>} An object containing the fetched data and a list of locations that failed.
 */
export async function fetchWeatherForLocations(apiKey, locations, startDate, endDate) {
    if (!apiKey) {
        throw new Error("Weather API key is missing. Please add it in settings.");
    }

    const weatherPromises = locations.map(location => 
        fetchSingleLocationWeather(apiKey, location, startDate, endDate)
    );

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
 * Fetches historical weather for a single location over a date range.
 * @param {string} apiKey - The Weather API key.
 * @param {string} location - The location name.
 * @param {string} startDate - The start date.
 * @param {string} endDate - The end date.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of daily weather records.
 */
async function fetchSingleLocationWeather(apiKey, location, startDate, endDate) {
    const dailyData = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        const apiUrl = `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${encodeURIComponent(location)}&dt=${dateString}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message);
        }
        const data = await response.json();
        const forecastDay = data.forecast.forecastday[0];
        
        dailyData.push({
            date: forecastDay.date,
            avg_temp_c: forecastDay.day.avgtemp_c,
            precip_mm: forecastDay.day.totalprecip_mm,
            wind_kph: forecastDay.day.maxwind_kph,
            condition: forecastDay.day.condition.text,
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dailyData;
}

