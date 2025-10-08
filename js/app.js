import { fetchWeather, callGemini } from './api.js';
import { 
    parseSalesFile,
    joinSalesAndWeather,
    runLocalAnalysis,
    preparePayload, 
    parseGeminiResponse, 
    exportToPDF, 
    exportToExcel 
} from './analysis.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { logEvent, downloadLogFile as downloadLog } from './logger.js';
import './statistics.js'; // Ensure statistics module is loaded

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyAXEJ5wR32T-1-_MR_lCddFxYt30YFvsVw",
  authDomain: "salesprediction-6c0a7.firebaseapp.com",
  projectId: "salesprediction-6c0a7",
  storageBucket: "salesprediction-6c0a7.firebasestorage.app",
  messagingSenderId: "224138096845",
  appId: "1:224138096845:web:240e3a832d5c2a58077984",
  measurementId: "G-6Q843X8RGZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// --- DOM Element References ---
const authContainer = document.getElementById('auth-container');
const forecastingInterface = document.getElementById('forecasting-interface');
const loginScreen = document.getElementById('login-screen');
const createAccountScreen = document.getElementById('create-account-screen');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.getElementById('loading-text');

// --- Chart instances ---
let salesTempChart, salesWeatherChart, lagChart, heatmapChart;

// --- App State ---
let currentAnalysisResults = null;
let currentAiInsights = null;
let salesFileName = '';

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    logEvent('App Initializing');
    setupEventListeners();
    monitorAuthState();
    loadApiKeys();
});

// --- Authentication ---

function monitorAuthState() {
    onAuthStateChanged(auth, user => {
        if (user) {
            logEvent(`User logged in: ${user.email}`);
            document.getElementById('user-email').textContent = user.email;
            showForecastingInterface();
        } else {
            logEvent('User logged out');
            showAuthContainer();
        }
    });
}

function handleCreateAccount(event) {
    event.preventDefault();
    const email = document.getElementById('create-email').value;
    const password = document.getElementById('create-password').value;
    const errorEl = document.getElementById('auth-error');
    errorEl.textContent = '';
    logEvent(`Attempting to create account for ${email}`);
    createUserWithEmailAndPassword(auth, email, password)
        .catch(error => {
            logEvent('Create account error: ' + error.message, 'ERROR');
            errorEl.textContent = error.message;
        });
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('auth-error');
    errorEl.textContent = '';
    logEvent(`Attempting to log in ${email}`);
    signInWithEmailAndPassword(auth, email, password)
        .catch(error => {
            logEvent('Login error: ' + error.message, 'ERROR');
            errorEl.textContent = 'Invalid email or password.';
        });
}

function handleGoogleSignIn() {
    const errorEl = document.getElementById('auth-error');
    errorEl.textContent = '';
    logEvent('Attempting Google Sign-In');
    signInWithPopup(auth, googleProvider)
        .catch(error => {
            logEvent('Google Sign-In Error: ' + error.message, 'ERROR');
            errorEl.textContent = error.message;
        });
}

function handleLogout() {
    logEvent('User logging out');
    signOut(auth).catch(error => logEvent('Logout error: ' + error.message, 'ERROR'));
}

// --- UI State Management ---
function showAuthContainer() {
    authContainer.classList.remove('hidden');
    forecastingInterface.classList.add('hidden');
}

function showForecastingInterface() {
    authContainer.classList.add('hidden');
    forecastingInterface.classList.remove('hidden');
}

function showLoading(text = 'Analyzing data...') {
    loadingText.textContent = text;
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Auth
    document.getElementById('show-create-account').addEventListener('click', () => { loginScreen.classList.add('hidden'); createAccountScreen.classList.remove('hidden'); document.getElementById('auth-error').textContent = ''; });
    document.getElementById('show-login').addEventListener('click', () => { createAccountScreen.classList.add('hidden'); loginScreen.classList.remove('hidden'); document.getElementById('auth-error').textContent = ''; });
    document.getElementById('create-account-form').addEventListener('submit', handleCreateAccount);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('google-signin-button').addEventListener('click', handleGoogleSignIn);
    document.getElementById('logout-button').addEventListener('click', handleLogout);
    
    // Main App
    document.getElementById('run-analysis-button').addEventListener('click', runAnalysis);
    document.getElementById('export-pdf-button').addEventListener('click', () => {
        if (currentAnalysisResults && currentAiInsights) {
            exportToPDF(currentAnalysisResults, currentAiInsights, salesFileName);
            logEvent('Exported report to PDF');
        } else { alert('Please run an analysis first.'); }
    });
    document.getElementById('export-excel-button').addEventListener('click', () => {
         if (currentAnalysisResults && currentAiInsights) {
            exportToExcel(currentAnalysisResults, currentAiInsights);
            logEvent('Exported report to Excel');
        } else { alert('Please run an analysis first.'); }
    });
    document.getElementById('download-log-button').addEventListener('click', downloadLog);

    // Settings Modal
    document.getElementById('settings-button').addEventListener('click', () => document.getElementById('settings-modal').classList.remove('hidden'));
    document.getElementById('close-settings-button').addEventListener('click', () => document.getElementById('settings-modal').classList.add('hidden'));
    document.getElementById('settings-form').addEventListener('submit', saveApiKeys);
}

// --- Core Application Logic ---
async function runAnalysis() {
    const salesFileInput = document.getElementById('sales-file-input');
    const startDateInput = document.getElementById('start-date-picker').value;
    const endDateInput = document.getElementById('end-date-picker').value;

    if (salesFileInput.files.length === 0 || !startDateInput || !endDateInput) {
        alert('Please upload a sales file and select a start and end date.');
        return;
    }
    salesFileName = salesFileInput.files[0].name;
    logEvent(`Starting analysis for ${salesFileName}`);

    showLoading('Parsing sales data...');
    document.getElementById('welcome-message').classList.add('hidden');
    document.getElementById('results-container').classList.add('hidden');

    try {
        const salesFile = salesFileInput.files[0];
        const parsedSales = await parseSalesFile(salesFile);
        logEvent(`Successfully parsed ${parsedSales.length} sales records.`);

        showLoading('Fetching weather data...');
        const weatherApiKey = localStorage.getItem('weatherApiKey') || '';
        // For now, we'll assume a single location from the sales data or a default
        const location = parsedSales[0]?.location || 'New York'; 
        const weatherData = await fetchWeather(weatherApiKey, location, startDateInput, endDateInput);
        logEvent(`Fetched ${weatherData.length} days of weather data for ${location}.`);

        showLoading('Running local analysis...');
        const joinedData = joinSalesAndWeather(parsedSales, weatherData);
        if (joinedData.length === 0) {
            throw new Error("No sales data matched the provided date range and weather data.");
        }
        const localAnalysis = runLocalAnalysis(joinedData);
        currentAnalysisResults = localAnalysis; // Store results
        logEvent(`Local analysis complete. Found ${localAnalysis.correlations.length} strong correlations.`);

        showLoading('Querying AI for deep insights...');
        const geminiApiKey = localStorage.getItem('geminiApiKey') || '';
        const prompt = preparePayload(localAnalysis, joinedData);
        const geminiResponse = await callGemini(geminiApiKey, prompt);
        logEvent('Received response from AI.');

        const insights = parseGeminiResponse(geminiResponse);
        currentAiInsights = insights; // Store insights
        logEvent(`Parsed ${insights.length} insights from AI response.`);
        
        renderResults(localAnalysis, insights, joinedData);
        document.getElementById('results-container').classList.remove('hidden');
        logEvent('Analysis complete and results rendered.');

    } catch (error) {
        logEvent('Analysis failed: ' + error.message, 'ERROR');
        alert(`An error occurred: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// --- Results Rendering ---
function renderResults(analysis, insights, joinedData) {
    // 1. Update metric cards
    document.getElementById('metric-revenue').textContent = `$${analysis.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('metric-sales').textContent = analysis.totalSales.toLocaleString();
    document.getElementById('metric-correlations').textContent = analysis.correlations.length;
    const topInsight = insights.length > 0 ? insights.sort((a, b) => b.stars - a.stars)[0] : null;
    document.getElementById('metric-confidence').innerHTML = topInsight ? renderStarRating(topInsight.stars, true) : 'N/A';

    // 2. Render all charts with real data
    renderSalesTempChart(joinedData);
    renderSalesWeatherChart(joinedData);
    renderLaggedCorrelationChart(analysis.correlations);
    renderHeatmap(analysis.correlations);


    // 3. Render AI insight cards
    const insightsContainer = document.getElementById('insights-output');
    insightsContainer.innerHTML = '';
    if (insights.length === 0) {
        insightsContainer.innerHTML = `<p class="text-gray-500 text-center">No specific insights were generated.</p>`;
        return;
    }
    insights.forEach(insight => {
        const card = document.createElement('div');
        card.className = 'insight-card fade-in';
        card.innerHTML = `
            <div class="icon"><i class="fas fa-lightbulb"></i></div>
            <div class="content">
                <p class="text">${insight.text}</p>
                <div class="details">
                    <span class="impact">Impact: <strong>${insight.impact}</strong></span>
                    <span class="rating">Confidence: ${renderStarRating(insight.stars)}</span>
                </div>
                <p class="recommendation"><strong>Recommendation:</strong> ${insight.recommendation}</p>
            </div>
        `;
        insightsContainer.appendChild(card);
    });
}

function renderStarRating(rating, isLarge = false) {
    let starsHtml = '';
    const starClass = isLarge ? 'text-2xl' : '';
    for (let i = 1; i <= 5; i++) {
        starsHtml += `<i class="fas fa-star ${i <= rating ? 'text-amber-400' : 'text-gray-300'} ${starClass}"></i>`;
    }
    return `<span class="star-rating">${starsHtml}</span>`;
}

// --- Charting Functions ---
function renderSalesTempChart(data) {
    const ctx = document.getElementById('sales-temp-chart').getContext('2d');
    if (salesTempChart) salesTempChart.destroy();
    
    // Aggregate sales by temperature
    const salesByTemp = data.reduce((acc, row) => {
        const temp = Math.round(row.avg_temp_c);
        acc[temp] = (acc[temp] || 0) + row.revenue;
        return acc;
    }, {});
    
    const sortedTemps = Object.keys(salesByTemp).map(Number).sort((a,b) => a - b);

    salesTempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedTemps.map(t => `${t}°C`),
            datasets: [{
                label: 'Total Revenue',
                data: sortedTemps.map(t => salesByTemp[t]),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function renderSalesWeatherChart(data) {
    const ctx = document.getElementById('sales-weather-chart').getContext('2d');
    if (salesWeatherChart) salesWeatherChart.destroy();

    const salesByCondition = data.reduce((acc, row) => {
        const condition = row.condition.toLowerCase();
        let simpleCondition = 'Other';
        if (condition.includes('sun') || condition.includes('clear')) simpleCondition = 'Sunny';
        else if (condition.includes('cloud') || condition.includes('overcast')) simpleCondition = 'Cloudy';
        else if (condition.includes('rain') || condition.includes('drizzle')) simpleCondition = 'Rain';
        else if (condition.includes('snow') || condition.includes('sleet')) simpleCondition = 'Snow';

        acc[simpleCondition] = (acc[simpleCondition] || 0) + row.revenue;
        return acc;
    }, {});

    salesWeatherChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(salesByCondition),
            datasets: [{
                label: 'Total Revenue',
                data: Object.values(salesByCondition),
                backgroundColor: ['#f59e0b', '#6b7280', '#3b82f6', '#d1d5db', '#10b981'],
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function renderLaggedCorrelationChart(correlations) {
    const ctx = document.getElementById('lag-timeline-chart').getContext('2d');
    if (lagChart) lagChart.destroy();

    const topCorrelation = correlations[0];
    if (!topCorrelation) return;

    lagChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Array.from({ length: 15 }, (_, i) => `${i} days`),
            datasets: [{
                label: `Correlation: SKU ${topCorrelation.sku} vs ${topCorrelation.weatherVariable}`,
                data: Array(15).fill(null).map((_, i) => i === topCorrelation.bestLag ? topCorrelation.correlation : 0),
                backgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: false, suggestedMin: -1, suggestedMax: 1 } },
            plugins: { title: { display: true, text: 'Top Correlation Lag Highlight' } }
        }
    });
}

function renderHeatmap(correlations) {
    const container = document.getElementById('demand-heatmap');
    container.innerHTML = ''; // Clear previous
    if (correlations.length === 0) return;

    const table = document.createElement('table');
    table.className = 'heatmap-table';
    
    const thead = `<thead><tr><th>SKU</th><th>Weather Variable</th><th>Correlation</th></tr></thead>`;
    let tbody = '<tbody>';
    correlations.slice(0, 5).forEach(c => { // Show top 5
        const corrValue = parseFloat(c.correlation);
        let colorClass = 'neutral';
        if (corrValue > 0.4) colorClass = 'high-positive';
        else if (corrValue > 0.2) colorClass = 'low-positive';
        else if (corrValue < -0.4) colorClass = 'high-negative';
        else if (corrValue < -0.2) colorClass = 'low-negative';

        tbody += `<tr><td>${c.sku}</td><td>${c.weatherVariable}</td><td class="${colorClass}">${c.correlation}</td></tr>`;
    });
    tbody += '</tbody>';
    
    table.innerHTML = thead + tbody;
    container.appendChild(table);
}


// --- Settings & API Keys ---
function saveApiKeys(event) {
    event.preventDefault();
    const geminiKey = document.getElementById('gemini-api-key').value;
    const weatherKey = document.getElementById('weather-api-key').value;

    if (geminiKey) localStorage.setItem('geminiApiKey', geminiKey);
    if (weatherKey) localStorage.setItem('weatherApiKey', weatherKey);
    
    logEvent('API keys saved to local storage.');
    document.getElementById('settings-modal').classList.add('hidden');
    alert('Settings saved!');
}

function loadApiKeys() {
    const geminiKey = localStorage.getItem('geminiApiKey');
    const weatherKey = localStorage.getItem('weatherApiKey');

    if (geminiKey) document.getElementById('gemini-api-key').value = geminiKey;
    if (weatherKey) document.getElementById('weather-api-key').value = weatherKey;
    logEvent('API keys loaded from local storage.');
}

