import { fetchWeatherForLocations, callGemini } from './api.js';
import { 
    parseSalesFile,
    joinSalesAndWeather,
    runLocalAnalysis,
    preparePayload, 
    parseGeminiResponse, 
    exportPlannerToPDF,
    exportPlannerToExcel
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
import { Logger } from './logger.js';
import './statistics.js';

const firebaseConfig = {
  apiKey: "AIzaSyAXEJ5wR32T-1-_MR_lCddFxYt30YFvsVw",
  authDomain: "salesprediction-6c0a7.firebaseapp.com",
  projectId: "salesprediction-6c0a7",
  storageBucket: "salesprediction-6c0a7.firebasestorage.app",
  messagingSenderId: "224138096845",
  appId: "1:224138096845:web:240e3a832d5c2a58077984",
  measurementId: "G-6Q843X8RGZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// --- DOM Element References ---
const authContainer = document.getElementById('auth-container');
const forecastingInterface = document.getElementById('forecasting-interface');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.getElementById('loading-text');

// --- App State ---
let activeCharts = {};
let plannerItems = [];
let currentAnalysisResults = null;
let currentAiInsights = null;

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    Logger.info('App Initializing');
    setupEventListeners();
    monitorAuthState();
    loadApiKeys();
});

// --- Authentication ---
function monitorAuthState() {
    onAuthStateChanged(auth, user => {
        if (user) {
            Logger.info(`User logged in: ${user.email}`);
            document.getElementById('user-email').textContent = user.email;
            forecastingInterface.classList.remove('hidden');
            authContainer.classList.add('hidden');
        } else {
            Logger.info('User logged out');
            forecastingInterface.classList.add('hidden');
            authContainer.classList.remove('hidden');
        }
    });
}

function handleAuthAction(promise, successMessage, errorMessage) {
    const errorEl = document.getElementById('auth-error');
    errorEl.textContent = '';
    promise.catch(error => {
        Logger.error(errorMessage, error);
        errorEl.textContent = error.message;
    });
}

function handleCreateAccount(e) {
    e.preventDefault();
    const email = document.getElementById('create-email').value;
    const password = document.getElementById('create-password').value;
    handleAuthAction(
        createUserWithEmailAndPassword(auth, email, password),
        `Account created for ${email}`,
        'Create account error'
    );
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    handleAuthAction(
        signInWithEmailAndPassword(auth, email, password),
        `Logged in as ${email}`,
        'Login error'
    );
}

function handleGoogleSignIn() {
    handleAuthAction(signInWithPopup(auth, googleProvider), 'Google Sign-In successful', 'Google Sign-In Error');
}

function handleLogout() {
    signOut(auth).catch(error => Logger.error('Logout error', error));
}


// --- UI & Event Listeners ---
function setupEventListeners() {
    // Auth
    document.getElementById('show-create-account').addEventListener('click', () => switchAuthScreen(false));
    document.getElementById('show-login').addEventListener('click', () => switchAuthScreen(true));
    document.getElementById('create-account-form').addEventListener('submit', handleCreateAccount);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('google-signin-button').addEventListener('click', handleGoogleSignIn);
    document.getElementById('logout-button').addEventListener('click', handleLogout);

    // Main App & Tabs
    document.getElementById('analysis-tab-button').addEventListener('click', () => switchTab('analysis'));
    document.getElementById('planner-tab-button').addEventListener('click', () => switchTab('planner'));
    document.getElementById('run-analysis-button').addEventListener('click', runAnalysis);
    
    // Planner Exports
    document.getElementById('export-planner-pdf-button').addEventListener('click', () => {
        if (plannerItems.length > 0) exportPlannerToPDF(plannerItems);
        else alert('Your planner is empty.');
    });
    document.getElementById('export-planner-excel-button').addEventListener('click', () => {
         if (plannerItems.length > 0) exportPlannerToExcel(plannerItems);
         else alert('Your planner is empty.');
    });

    // Settings
    document.getElementById('settings-button').addEventListener('click', () => document.getElementById('settings-modal').classList.remove('hidden'));
    document.getElementById('close-settings-button').addEventListener('click', () => document.getElementById('settings-modal').classList.add('hidden'));
    document.getElementById('settings-form').addEventListener('submit', saveApiKeys);
    
    // Logger
    document.getElementById('download-log-button').addEventListener('click', () => Logger.downloadLogFile());
}

function switchAuthScreen(showLogin) {
    document.getElementById('login-screen').classList.toggle('hidden', !showLogin);
    document.getElementById('create-account-screen').classList.toggle('hidden', showLogin);
    document.getElementById('auth-error').textContent = '';
}

function switchTab(activeTab) {
    document.getElementById('analysis-content').classList.toggle('hidden', activeTab !== 'analysis');
    document.getElementById('planner-content').classList.toggle('hidden', activeTab !== 'planner');
    document.getElementById('analysis-tab-button').classList.toggle('tab-active', activeTab === 'analysis');
    document.getElementById('planner-tab-button').classList.toggle('tab-active', activeTab === 'planner');
}

function showLoading(text) {
    loadingText.textContent = text;
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}


// --- Core Application Logic ---
async function runAnalysis() {
    const salesFileInput = document.getElementById('sales-file-input');
    const startDate = document.getElementById('start-date-picker').value;
    const endDate = document.getElementById('end-date-picker').value;

    if (!salesFileInput.files[0] || !startDate || !endDate) {
        return alert('Please upload a sales file and select both a start and end date.');
    }
    
    Logger.info(`Starting analysis for ${salesFileInput.files[0].name}`);
    showLoading('Parsing sales data...');
    document.getElementById('welcome-message').classList.add('hidden');
    document.getElementById('results-container').classList.add('hidden');

    try {
        const parsedSales = await parseSalesFile(salesFileInput.files[0]);
        const uniqueLocations = [...new Set(parsedSales.map(r => r.location))];
        Logger.info(`Parsed ${parsedSales.length} records for ${uniqueLocations.length} locations.`);

        showLoading(`Fetching weather for ${uniqueLocations.length} locations...`);
        const weatherApiKey = localStorage.getItem('weatherApiKey');
        const { weatherData, failedLocations } = await fetchWeatherForLocations(weatherApiKey, uniqueLocations, startDate, endDate);
        if (failedLocations.length > 0) {
            alert(`Warning: Could not fetch weather for ${failedLocations.join(', ')}. They will be excluded.`);
        }

        showLoading('Running statistical analysis...');
        const joinedData = joinSalesAndWeather(parsedSales, weatherData);
        if (joinedData.length === 0) throw new Error("No sales data matched the weather data for the selected date range.");
        
        currentAnalysisResults = runLocalAnalysis(joinedData);
        Logger.info('Local analysis complete.', currentAnalysisResults);

        showLoading('Querying AI for deep insights...');
        const geminiApiKey = localStorage.getItem('geminiApiKey');
        const prompt = preparePayload(currentAnalysisResults);
        const geminiResponse = await callGemini(geminiApiKey, prompt);
        
        currentAiInsights = parseGeminiResponse(geminiResponse);
        Logger.info('Parsed AI insights.', currentAiInsights);
        
        renderResults(currentAnalysisResults, currentAiInsights, joinedData);
        document.getElementById('results-container').classList.remove('hidden');

    } catch (error) {
        Logger.error('Analysis failed', error);
        alert(`An error occurred: ${error.message}`);
    } finally {
        hideLoading();
    }
}


// --- Results & Planner Rendering ---
function renderResults(analysis, insightsByLocation, joinedData) {
    // Render dashboard metrics
    document.getElementById('metric-revenue').textContent = `$${analysis.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    document.getElementById('metric-sales').textContent = analysis.totalSales.toLocaleString();
    const totalCorrelations = Object.values(analysis.locations).reduce((sum, loc) => sum + loc.correlations.length, 0);
    document.getElementById('metric-correlations').textContent = totalCorrelations;
    const topConfidence = Math.max(0, ...Object.values(insightsByLocation).flat().map(i => i.confidence));
    document.getElementById('metric-confidence').innerHTML = topConfidence > 0 ? renderStarRating(topConfidence, true) : 'N/A';
    
    renderMainCharts(joinedData, analysis);
    renderInsights(insightsByLocation);
}

function renderInsights(insightsByLocation) {
    const container = document.getElementById('insights-output');
    container.innerHTML = '';
    
    Object.entries(insightsByLocation).forEach(([location, insights]) => {
        if (insights.length === 0) return;

        const locationHeader = document.createElement('h4');
        locationHeader.className = 'text-lg font-semibold text-gray-700 mt-6 mb-2 first:mt-0';
        locationHeader.textContent = `Insights for ${location}`;
        container.appendChild(locationHeader);

        insights.forEach((insight, index) => {
            const cardId = `insight-${location.replace(/\s+/g, '-')}-${index}`;
            insight.id = cardId; // Assign a unique ID
            insight.location = location;
            
            const card = document.createElement('div');
            card.id = cardId;
            card.className = 'insight-card';
            card.innerHTML = createInsightCardHTML(insight);
            container.appendChild(card);
            
            // Add event listener to the "Add to Plan" button
            card.querySelector('.add-to-plan-btn').addEventListener('click', (e) => {
                addToPlanner(insight, e.currentTarget);
            });
        });
    });
}

function createInsightCardHTML(insight) {
    const confidenceHTML = renderStarRating(insight.confidence);
    return `
        <div class="card-header">
            <span class="sku-tag">SKU: ${insight.sku}</span>
        </div>
        <div class="card-content">
            <p class="finding">${insight.finding}</p>
            <p class="theory">${insight.theory}</p>
        </div>
        <div class="card-footer">
            <div class="confidence">${confidenceHTML}</div>
            <button class="add-to-plan-btn">
                <i class="fas fa-plus-circle"></i> Add to Plan
            </button>
        </div>
        <div class="recommendation-tooltip">
            <strong>Recommendation:</strong> ${insight.recommendation}
        </div>
    `;
}

function addToPlanner(insight, button) {
    if (plannerItems.some(item => item.id === insight.id)) {
        alert('This insight is already in your planner.');
        return;
    }
    plannerItems.push(insight);
    button.textContent = 'Added to Plan';
    button.disabled = true;
    button.classList.add('added');
    
    updatePlanner();
}

function updatePlanner() {
    const plannerContainer = document.getElementById('planner-items-container');
    const emptyState = document.getElementById('planner-empty-state');
    
    plannerContainer.innerHTML = '';
    
    if (plannerItems.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    plannerItems.forEach(item => {
        const plannerItem = document.createElement('div');
        plannerItem.className = 'planner-item';
        plannerItem.innerHTML = `
            <div class="planner-item-header">
                <span class="sku-tag">${item.sku} @ ${item.location}</span>
                <button class="remove-planner-item-btn" data-id="${item.id}">&times;</button>
            </div>
            <p><strong>Finding:</strong> ${item.finding}</p>
            <p><strong>Recommendation:</strong> ${item.recommendation}</p>
        `;
        plannerContainer.appendChild(plannerItem);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-planner-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idToRemove = e.currentTarget.getAttribute('data-id');
            plannerItems = plannerItems.filter(item => item.id !== idToRemove);
            
            // Re-enable the "Add to Plan" button on the analysis page
            const originalCardButton = document.querySelector(`#${idToRemove} .add-to-plan-btn`);
            if(originalCardButton){
                originalCardButton.textContent = 'Add to Plan';
                originalCardButton.disabled = false;
                originalCardButton.classList.remove('added');
            }

            updatePlanner();
        });
    });
    
    // Update planner count
    document.getElementById('planner-count').textContent = plannerItems.length;
}

// --- Charting & Visualizations ---
function renderMainCharts(joinedData, analysis) {
    destroyAllCharts();
    const salesTrendCtx = document.getElementById('sales-trend-chart').getContext('2d');
    const lagCtx = document.getElementById('lagged-correlation-chart').getContext('2d');
    
    const dataByDate = joinedData.reduce((acc, row) => {
        acc[row.date] = (acc[row.date] || 0) + row.revenue;
        return acc;
    }, {});
    const sortedDates = Object.keys(dataByDate).sort();

    activeCharts.salesTrend = new Chart(salesTrendCtx, { /* ... Chart config from previous versions ... */ });

    const topCorrelation = Object.values(analysis.locations).flatMap(l => l.correlations).sort((a,b) => Math.abs(b.correlation) - Math.abs(a.correlation))[0];
    if(topCorrelation){
        activeCharts.lagChart = new Chart(lagCtx, { /* ... Chart config from previous versions ... */ });
    }
}

function destroyAllCharts() {
    Object.values(activeCharts).forEach(chart => chart.destroy());
    activeCharts = {};
}

function renderStarRating(rating, isLarge = false) {
    const starClass = isLarge ? 'text-2xl' : '';
    return Array.from({ length: 5 }, (_, i) => 
        `<i class="fas fa-star ${i < rating ? 'text-amber-400' : 'text-gray-300'} ${starClass}"></i>`
    ).join('');
}


// --- Settings & API Keys ---
function saveApiKeys(event) {
    event.preventDefault();
    const geminiKey = document.getElementById('gemini-api-key').value;
    const weatherKey = document.getElementById('weather-api-key').value;

    if (geminiKey) localStorage.setItem('geminiApiKey', geminiKey);
    if (weatherKey) localStorage.setItem('weatherApiKey', weatherKey);
    
    Logger.info('API keys saved to local storage.');
    document.getElementById('settings-modal').classList.add('hidden');
    alert('Settings saved!');
}

function loadApiKeys() {
    const geminiKey = localStorage.getItem('geminiApiKey');
    const weatherKey = localStorage.getItem('weatherApiKey');

    if (geminiKey) document.getElementById('gemini-api-key').value = geminiKey;
    if (weatherKey) document.getElementById('weather-api-key').value = weatherKey;
    if (geminiKey || weatherKey) {
        Logger.info('API keys loaded from local storage.');
    }
}

