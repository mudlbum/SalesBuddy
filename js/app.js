// --- Imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { callGemini, fetchWeather } from './api.js';
import { preparePayload, parseGeminiResponse, exportToPDF, exportToExcel } from './analysis.js';

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


// --- App Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// --- DOM Elements ---
const authContainer = document.getElementById('auth-container');
const forecastingInterface = document.getElementById('forecasting-interface');
const loginScreen = document.getElementById('login-screen');
const createAccountScreen = document.getElementById('create-account-screen');
const authError = document.getElementById('auth-error');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.getElementById('loading-text');

// --- Global State ---
let salesFile = null;
let analysisResults = null;
let salesTempChart = null;
let salesWeatherChart = null;

// --- Authentication Logic ---

// Listen for authentication state changes
onAuthStateChanged(auth, user => {
    if (user) {
        // User is signed in
        authContainer.classList.add('hidden');
        forecastingInterface.classList.remove('hidden');
        document.getElementById('user-email').textContent = user.email;
        loadApiKeys();
    } else {
        // User is signed out
        authContainer.classList.remove('hidden');
        forecastingInterface.classList.add('hidden');
    }
});

// Event Listeners for Auth Forms
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.textContent = '';
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        authError.textContent = "Invalid email or password.";
    }
});

document.getElementById('create-account-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.textContent = '';
    const email = document.getElementById('create-email').value;
    const password = document.getElementById('create-password').value;
    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        authError.textContent = error.message;
    }
});

document.getElementById('google-signin-button').addEventListener('click', async () => {
    authError.textContent = '';
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        authError.textContent = `Google Sign-In Error: ${error.message}`;
    }
});


document.getElementById('logout-button').addEventListener('click', () => {
    signOut(auth);
});

// Screen switching
document.getElementById('show-create-account').addEventListener('click', () => {
    loginScreen.classList.add('hidden');
    createAccountScreen.classList.remove('hidden');
    authError.textContent = '';
});

document.getElementById('show-login').addEventListener('click', () => {
    createAccountScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    authError.textContent = '';
});


// --- Main Application Logic ---

// Settings Modal Logic
const settingsModal = document.getElementById('settings-modal');
document.getElementById('settings-button').addEventListener('click', () => settingsModal.classList.remove('hidden'));
document.getElementById('close-settings-button').addEventListener('click', () => settingsModal.classList.add('hidden'));
document.getElementById('settings-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const geminiKey = document.getElementById('gemini-api-key').value;
    const weatherKey = document.getElementById('weather-api-key').value;
    localStorage.setItem('geminiApiKey', geminiKey);
    localStorage.setItem('weatherApiKey', weatherKey);
    settingsModal.classList.add('hidden');
    alert('API keys saved!');
});

function loadApiKeys() {
    const geminiKey = localStorage.getItem('geminiApiKey');
    const weatherKey = localStorage.getItem('weatherApiKey');
    if (geminiKey) document.getElementById('gemini-api-key').value = geminiKey;
    if (weatherKey) document.getElementById('weather-api-key').value = weatherKey;
}

// File Input Logic
document.getElementById('sales-file-input').addEventListener('change', (event) => {
    salesFile = event.target.files[0];
    if (salesFile) {
        console.log(`File selected: ${salesFile.name}`);
    }
});

// Run Analysis Logic
document.getElementById('run-analysis-button').addEventListener('click', async () => {
    if (!salesFile) {
        alert('Please upload a sales data file first.');
        return;
    }
    
    const geminiApiKey = localStorage.getItem('geminiApiKey');
    const weatherApiKey = localStorage.getItem('weatherApiKey');

    if (!geminiApiKey || !weatherApiKey) {
        alert('Please set your API keys in the settings.');
        return;
    }
    
    document.getElementById('welcome-message').classList.add('hidden');
    showLoading('Fetching weather data...');
    try {
        // 1. Fetch weather data (using a mock for now)
        const weatherData = await fetchWeather(weatherApiKey, 'New York', '2023-01-01', '2023-01-31');
        
        // 2. Prepare payload for Gemini
        showLoading('Analyzing data with AI...');
        const payload = preparePayload({ fileName: salesFile.name }, weatherData);

        // 3. Call Gemini API
        const geminiRawResponse = await callGemini(geminiApiKey, payload);

        // 4. Parse response and store results
        analysisResults = parseGeminiResponse(geminiRawResponse);
        
        // 5. Render results to the UI
        renderResults(analysisResults);

    } catch (error) {
        console.error('Analysis failed:', error);
        alert(`An error occurred during analysis: ${error.message}`);
    } finally {
        hideLoading();
    }
});

// Export Logic
document.getElementById('export-pdf-button').addEventListener('click', () => {
    if (!analysisResults) {
        alert('Please run an analysis first.');
        return;
    }
    exportToPDF(analysisResults);
});

document.getElementById('export-excel-button').addEventListener('click', () => {
    if (!analysisResults) {
        alert('Please run an analysis first.');
        return;
    }
    exportToExcel(analysisResults);
});


// --- UI Rendering ---

function showLoading(message) {
    loadingText.textContent = message;
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

function renderResults(results) {
    document.getElementById('results-container').classList.remove('hidden');
    
    // Render metric cards (mock data)
    document.getElementById('metric-revenue').textContent = '$1.25M';
    document.getElementById('metric-sales').textContent = '8,450';
    document.getElementById('metric-correlations').textContent = results.length;
    
    const topInsight = results.sort((a,b) => b.stars - a.stars)[0];
    if(topInsight){
         document.getElementById('metric-confidence').innerHTML = renderStarRating(topInsight.stars);
    } else {
         document.getElementById('metric-confidence').textContent = '-';
    }

    // Render insight cards
    const insightsContainer = document.getElementById('insights-output');
    insightsContainer.innerHTML = ''; // Clear previous results
    results.forEach(insight => {
        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded-lg shadow-sm border border-gray-200';
        
        card.innerHTML = `
            <p class="text-gray-700">${insight.text}</p>
            <div class="mt-2 text-yellow-500">${renderStarRating(insight.stars)}</div>
        `;
        insightsContainer.appendChild(card);
    });

    // Render charts (mock data)
    renderCharts();
}

function renderStarRating(rating) {
    let stars = '';
    for(let i = 0; i < 5; i++) {
        stars += i < rating ? '★' : '☆';
    }
    return `<span>${stars}</span>`;
}


function renderCharts() {
    // Destroy existing charts if they exist to prevent duplicates
    if (salesTempChart) salesTempChart.destroy();
    if (salesWeatherChart) salesWeatherChart.destroy();

    // Chart 1: Sales vs. Temperature
    const tempCtx = document.getElementById('sales-temp-chart').getContext('2d');
    salesTempChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: ['-5°C', '0°C', '5°C', '10°C', '15°C', '20°C'],
            datasets: [{
                label: 'Sales Volume',
                data: [200, 350, 450, 800, 1200, 1500],
                borderColor: 'rgb(79, 70, 229)',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Chart 2: Sales by Weather Condition
    const weatherCtx = document.getElementById('sales-weather-chart').getContext('2d');
    salesWeatherChart = new Chart(weatherCtx, {
        type: 'bar',
        data: {
            labels: ['Sunny', 'Cloudy', 'Rain', 'Snow'],
            datasets: [{
                label: 'Total Sales',
                data: [5200, 3100, 2500, 4100],
                backgroundColor: ['#60a5fa', '#9ca3af', '#3b82f6', '#e5e7eb'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

