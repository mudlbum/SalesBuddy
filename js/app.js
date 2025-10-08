import { fetchWeather, callGemini } from './api.js';
import { preparePayload, parseGeminiResponse, exportToPDF, exportToExcel } from './analysis.js';
import { logEvent, downloadLogFile } from './logger.js';
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

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyAXEJ5wR32T-1-_MR_lCddFxYt30YFvsVw",
  authDomain: "salesprediction-6c0a7.firebaseapp.com",
  projectId: "salesprediction-6c0a7",
  storageBucket: "salesprediction-6c0a7.appspot.com",
  messagingSenderId: "224138096845",
  appId: "1:224138096845:web:240e3a832d5c2a58077984",
  measurementId: "G-6Q843X8RGZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// --- DOM Element References ---
const authContainer = document.getElementById('auth-container');
const forecastingInterface = document.getElementById('forecasting-interface');
const loginScreen = document.getElementById('login-screen');
const createAccountScreen = document.getElementById('create-account-screen');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.getElementById('loading-text');

// --- Chart instances ---
let salesTempChart, salesWeatherChart;

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    logEvent('Application initializing.');
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
            logEvent('User logged out.');
            showAuthContainer();
        }
    });
}

function handleCreateAccount(event) {
    event.preventDefault();
    const email = document.getElementById('create-email').value;
    const password = document.getElementById('create-password').value;
    const errorEl = document.getElementById('auth-error');
    logEvent(`Attempting to create account for: ${email}`);
    createUserWithEmailAndPassword(auth, email, password)
        .catch(error => {
            logEvent(`Create account error: ${error.message}`, 'ERROR');
            errorEl.textContent = error.message;
        });
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('auth-error');
    logEvent(`Login attempt for: ${email}`);
    signInWithEmailAndPassword(auth, email, password)
        .catch(error => {
            logEvent(`Login error: ${error.message}`, 'ERROR');
            errorEl.textContent = 'Invalid email or password.';
        });
}

function handleGoogleSignIn() {
    logEvent('Attempting Google Sign-In.');
    signInWithPopup(auth, provider)
        .catch((error) => {
            logEvent(`Google Sign-In error: ${error.message}`, 'ERROR');
            document.getElementById('auth-error').textContent = 'Could not sign in with Google.';
        });
}

function handleLogout() {
    logEvent('User initiated logout.');
    signOut(auth).catch(error => logEvent(`Logout error: ${error.message}`, 'ERROR'));
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
    // Auth screen toggling
    document.getElementById('show-create-account').addEventListener('click', () => {
        loginScreen.classList.add('hidden');
        createAccountScreen.classList.remove('hidden');
        document.getElementById('auth-error').textContent = '';
    });
    document.getElementById('show-login').addEventListener('click', () => {
        createAccountScreen.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        document.getElementById('auth-error').textContent = '';
    });

    // Auth forms
    document.getElementById('create-account-form').addEventListener('submit', handleCreateAccount);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('google-signin-button').addEventListener('click', handleGoogleSignIn);
    document.getElementById('logout-button').addEventListener('click', handleLogout);
    
    // Main app buttons
    document.getElementById('run-analysis-button').addEventListener('click', runAnalysis);
    document.getElementById('export-pdf-button').addEventListener('click', () => exportToPDF({}));
    document.getElementById('export-excel-button').addEventListener('click', () => exportToExcel({}));
    document.getElementById('download-log-button').addEventListener('click', downloadLogFile);

    // Settings Modal
    document.getElementById('settings-button').addEventListener('click', () => document.getElementById('settings-modal').classList.remove('hidden'));
    document.getElementById('close-settings-button').addEventListener('click', () => document.getElementById('settings-modal').classList.add('hidden'));
    document.getElementById('settings-form').addEventListener('submit', saveApiKeys);
}


// --- Core Application Logic ---

async function runAnalysis() {
    const salesFileInput = document.getElementById('sales-file-input');
    if (salesFileInput.files.length === 0) {
        alert('Please upload a sales data file.');
        logEvent('Analysis run aborted: No file selected.', 'WARN');
        return;
    }

    logEvent('Starting analysis run.');
    showLoading('Fetching weather data...');
    document.getElementById('welcome-message').classList.add('hidden');
    document.getElementById('results-container').classList.add('hidden');

    try {
        const salesData = { fileName: salesFileInput.files[0].name };
        logEvent(`Sales data file: ${salesData.fileName}`);
        
        // Step 1: Fetch weather data
        const weatherApiKey = localStorage.getItem('weatherApiKey') || '';
        const weatherData = await fetchWeather(weatherApiKey, 'New York', '2023-01-01', '2023-01-31');

        // Step 2: Prepare payload for Gemini
        showLoading('Analyzing with AI...');
        const geminiPayload = preparePayload(salesData, weatherData);

        // Step 3: Call Gemini API
        const geminiApiKey = localStorage.getItem('geminiApiKey') || '';
        const geminiResponse = await callGemini(geminiApiKey, geminiPayload);

        // Step 4: Parse the response
        const insights = parseGeminiResponse(geminiResponse);
        
        // Step 5: Render results
        logEvent('Analysis complete. Rendering results.');
        renderResults(insights);
        document.getElementById('results-container').classList.remove('hidden', 'fade-in');
        void document.getElementById('results-container').offsetWidth; // Trigger reflow
        document.getElementById('results-container').classList.add('fade-in');


    } catch (error) {
        logEvent(`Analysis failed: ${error.message}`, 'ERROR');
        alert(`An error occurred during analysis: ${error.message}`);
    } finally {
        hideLoading();
    }
}


// --- Results Rendering ---

function renderResults(insights) {
    // 1. Update metric cards (mock data for now)
    document.getElementById('metric-revenue').textContent = '$1,250,300';
    document.getElementById('metric-sales').textContent = '8,450';
    document.getElementById('metric-correlations').textContent = insights.length;
    const topInsight = insights.sort((a, b) => b.stars - a.stars)[0];
    document.getElementById('metric-confidence').innerHTML = topInsight ? renderStarRating(topInsight.stars, true) : 'N/A';

    // 2. Render charts (mock data for now)
    renderSalesTempChart();
    renderSalesWeatherChart();

    // 3. Render AI insight cards
    const insightsContainer = document.getElementById('insights-output');
    insightsContainer.innerHTML = ''; // Clear previous results
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
                <div class="rating">
                    <strong>Confidence:</strong> ${renderStarRating(insight.stars)}
                </div>
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

function renderSalesTempChart() {
    const ctx = document.getElementById('sales-temp-chart').getContext('2d');
    if (salesTempChart) salesTempChart.destroy();
    salesTempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['-5°C', '0°C', '5°C', '10°C', '15°C', '20°C', '25°C'],
            datasets: [{
                label: 'Sales Revenue',
                data: [12000, 19000, 25000, 55000, 82000, 115000, 130000],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function renderSalesWeatherChart() {
    const ctx = document.getElementById('sales-weather-chart').getContext('2d');
    if (salesWeatherChart) salesWeatherChart.destroy();
    salesWeatherChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sunny', 'Cloudy', 'Rain', 'Snow'],
            datasets: [{
                label: 'Average Daily Sales',
                data: [15000, 11000, 8500, 4000],
                backgroundColor: ['#f59e0b', '#6b7280', '#3b82f6', '#d1d5db'],
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
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

