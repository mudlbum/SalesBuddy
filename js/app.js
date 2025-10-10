import { firebaseConfig } from './firebase-config.js';
import { fetchWeatherForLocations, callGemini } from './api.js';
import {
    parseSalesFile,
    joinSalesAndWeather,
    runLocalAnalysis,
    preparePayload,
    processGeminiResponse
} from './analysis.js';
import { exportPlannerToPDF, exportPlannerToExcel } from './exports.js';
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

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// --- DOM Elements ---
const authContainer = document.getElementById('auth-container');
const forecastingInterface = document.getElementById('forecasting-interface');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.getElementById('loading-text');
const notificationBanner = document.getElementById('notification-banner');
const notificationText = document.getElementById('notification-text');
const closeNotificationButton = document.getElementById('close-notification-button');

// --- Application State ---
let plannerItems = new Map();
let currentRecommendations = [];
let totalBudget = 0;

// --- Event Listeners Setup ---
document.addEventListener('DOMContentLoaded', () => {
    Logger.info('App Initializing');
    setupEventListeners();
    monitorAuthState();
    loadApiKeys();
});

function setupEventListeners() {
    // Auth
    document.getElementById('show-create-account').addEventListener('click', () => switchAuthScreen(false));
    document.getElementById('show-login').addEventListener('click', () => switchAuthScreen(true));
    document.getElementById('create-account-form').addEventListener('submit', handleCreateAccount);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('google-signin-button').addEventListener('click', handleGoogleSignIn);
    document.getElementById('logout-button').addEventListener('click', handleLogout);
    
    // Main Controls
    document.getElementById('run-analysis-button').addEventListener('click', runAnalysis);
    document.getElementById('reset-button').addEventListener('click', resetInterface);
    
    // Planner & Exports
    document.getElementById('export-planner-pdf-button').addEventListener('click', handlePdfExport);
    document.getElementById('export-planner-excel-button').addEventListener('click', handleExcelExport);

    // Settings
    document.getElementById('settings-button').addEventListener('click', () => document.getElementById('settings-modal').classList.remove('hidden'));
    document.getElementById('close-settings-button').addEventListener('click', () => document.getElementById('settings-modal').classList.add('hidden'));
    document.getElementById('settings-form').addEventListener('submit', saveApiKeys);
    
    // Misc
    document.getElementById('download-log-button').addEventListener('click', handleLogDownload);
    closeNotificationButton.addEventListener('click', () => notificationBanner.classList.add('hidden'));
}


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
            resetInterface();
        }
    });
}

function handleAuthAction(promise, successMessage, errorMessage) {
    const errorEl = document.getElementById('auth-error');
    errorEl.textContent = '';
    promise
        .then(userCredential => {
            Logger.info(successMessage, { email: userCredential.user.email });
        })
        .catch(error => {
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

function switchAuthScreen(showLogin) {
    document.getElementById('login-screen').classList.toggle('hidden', !showLogin);
    document.getElementById('create-account-screen').classList.toggle('hidden', showLogin);
    document.getElementById('auth-error').textContent = '';
}


// --- Core Application Logic ---
async function runAnalysis() {
    const salesFileInput = document.getElementById('sales-file-input');
    const budgetInput = document.getElementById('budget-input');

    if (!salesFileInput.files[0]) {
        return showNotification('Please upload your Assortment Plan Excel file.', 'warn');
    }
    if (!budgetInput.value) {
        return showNotification('Please set a total budget.', 'warn');
    }
    
    totalBudget = parseFloat(budgetInput.value);
    Logger.info(`Starting analysis with budget: $${totalBudget}`);
    showLoading('Parsing Assortment Plan...');
    resetInterface(false); // Soft reset, keeps inputs

    try {
        const parsedSales = await parseSalesFile(salesFileInput.files[0]);
        Logger.info(`Parsed ${parsedSales.length} monthly sales records.`);

        const uniqueLocations = [...new Set(parsedSales.map(r => r.location))];
        const year = new Date(parsedSales[0].date).getFullYear();
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        showLoading(`Fetching historical weather for ${uniqueLocations.length} locations...`);
        const weatherApiKey = localStorage.getItem('weatherApiKey');
        const { weatherData, failedLocations } = await fetchWeatherForLocations(weatherApiKey, uniqueLocations, startDate, endDate);
        if (failedLocations.length > 0) {
            showNotification(`Warning: Could not fetch weather for ${failedLocations.join(', ')}.`, 'warn');
        }
        
        showLoading('Running advanced performance analysis...');
        const joinedData = joinSalesAndWeather(parsedSales, weatherData);
        const localAnalysis = runLocalAnalysis(joinedData);
        Logger.info('Local analysis complete.', localAnalysis);

        showLoading('Querying AI for opportunity scores & planning...');
        const geminiApiKey = localStorage.getItem('geminiApiKey');
        const payload = preparePayload(localAnalysis, totalBudget);
        const geminiResponseText = await callGemini(geminiApiKey, payload.systemPrompt, payload.userPrompt, payload.responseSchema);
        
        currentRecommendations = processGeminiResponse(geminiResponseText);
        Logger.info('Parsed AI recommendations.', currentRecommendations);
        
        renderRecommendations(currentRecommendations);
        updatePlannerSummary();
        document.getElementById('results-container').classList.remove('hidden');
        showNotification('Analysis complete! Review your recommendations below.', 'success');

    } catch (error) {
        Logger.error('Analysis failed', error);
        showNotification(`A critical error occurred: ${error.message}`, 'error');
        document.getElementById('welcome-message').classList.remove('hidden');
    } finally {
        hideLoading();
    }
}

function resetInterface(fullReset = true) {
    document.getElementById('welcome-message').classList.remove('hidden');
    document.getElementById('results-container').classList.add('hidden');
    document.getElementById('recommendations-container').innerHTML = '';
    
    plannerItems.clear();
    currentRecommendations = [];
    
    if(fullReset) {
        document.getElementById('sales-file-input').value = '';
        document.getElementById('budget-input').value = '';
        totalBudget = 0;
    }

    updatePlannerSummary();
    Logger.info('Interface has been reset.');
}

// --- UI Rendering ---
function renderRecommendations(recommendations) {
    const container = document.getElementById('recommendations-container');
    container.innerHTML = '';

    if (recommendations.length === 0) {
        container.innerHTML = `<div class="text-center py-16 text-gray-500 col-span-full">No recommendations were generated by the AI. Check the log for details.</div>`;
        return;
    }

    recommendations.forEach((rec, index) => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        card.style.setProperty('--stagger-delay', `${index * 50}ms`);
        
        const scoreColor = getScoreColor(rec.opportunityScore);
        const circumference = 2 * Math.PI * 18; // 2 * pi * r
        const strokeDashoffset = circumference - (rec.opportunityScore / 100) * circumference;

        card.innerHTML = `
            <div class="p-4 flex justify-between items-start">
                <div>
                    <div class="font-bold text-lg text-gray-800">${rec.sku}</div>
                    <div class="text-sm text-gray-500">${rec.recommendation}</div>
                </div>
                <div class="score-gauge" style="--score-color: ${scoreColor}; --stroke-dashoffset: ${strokeDashoffset}; --circumference: ${circumference};">
                    <svg class="w-12 h-12" viewBox="0 0 40 40">
                        <circle class="stroke-current text-gray-200" cx="20" cy="20" r="18" fill="none" stroke-width="4"></circle>
                        <circle class="gauge-ring stroke-current" cx="20" cy="20" r="18" fill="none" stroke-width="4" stroke-linecap="round"></circle>
                    </svg>
                    <div class="score-text">${rec.opportunityScore}</div>
                </div>
            </div>
            <div class="px-4 pb-4 border-b border-gray-200 grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                    <div class="text-xs text-gray-500">Suggested Units</div>
                    <div class="font-semibold text-gray-800">${rec.suggestedUnits.toLocaleString()}</div>
                </div>
                <div>
                    <div class="text-xs text-gray-500">Est. Cost</div>
                    <div class="font-semibold text-gray-800">$${rec.estimatedCost.toLocaleString()}</div>
                </div>
            </div>
            <div class="px-4 pt-3 pb-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm border-b border-gray-200">
                <div class="flex items-center text-gray-700" title="${rec.salesTrendSummary}">
                    <i class="fas fa-chart-line w-4 text-center mr-2 text-gray-400"></i>
                    <span class="font-medium">Trend:</span>
                    <span class="ml-1 text-gray-900 truncate">${rec.salesTrendSummary}</span>
                </div>
                <div class="flex items-center text-gray-700" title="${rec.salesVolatilitySummary}">
                    <i class="fas fa-wave-square w-4 text-center mr-2 text-gray-400"></i>
                    <span class="font-medium">Volatility:</span>
                    <span class="ml-1 text-gray-900 truncate">${rec.salesVolatilitySummary}</span>
                </div>
            </div>
            <div class="p-4 bg-gray-50">
                <p class="text-xs text-gray-600 font-medium">AI Reasoning</p>
                <p class="text-sm text-gray-800 mt-1">${rec.reasoning}</p>
            </div>
            <div class="p-3 bg-gray-100 border-t border-gray-200">
                 <button data-sku="${rec.sku}" class="add-to-plan-button w-full text-center font-medium py-2 px-4 rounded-md text-sm transition bg-blue-50 text-blue-700 hover:bg-blue-100">
                     <i class="fas fa-plus-circle mr-2"></i>Add to Plan
                 </button>
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll('.add-to-plan-button').forEach(button => {
        button.addEventListener('click', handleItemSelection);
    });
}

function handleItemSelection(event) {
    const button = event.currentTarget;
    const sku = button.dataset.sku;
    
    if (plannerItems.has(sku)) {
        plannerItems.delete(sku);
        button.innerHTML = `<i class="fas fa-plus-circle mr-2"></i>Add to Plan`;
        button.classList.remove('bg-red-50', 'text-red-700', 'hover:bg-red-100');
        button.classList.add('bg-blue-50', 'text-blue-700', 'hover:bg-blue-100');
    } else {
        const item = currentRecommendations.find(r => r.sku === sku);
        plannerItems.set(sku, item);
        button.innerHTML = `<i class="fas fa-minus-circle mr-2"></i>Remove from Plan`;
        button.classList.remove('bg-blue-50', 'text-blue-700', 'hover:bg-blue-100');
        button.classList.add('bg-red-50', 'text-red-700', 'hover:bg-red-100');
    }
    
    updatePlannerSummary();
}

function updatePlannerSummary() {
    const selectedCost = Array.from(plannerItems.values()).reduce((sum, item) => sum + item.estimatedCost, 0);
    const budgetRemaining = totalBudget - selectedCost;
    const budgetPercentage = totalBudget > 0 ? (selectedCost / totalBudget) * 100 : 0;

    document.getElementById('selected-cost').textContent = `$${selectedCost.toLocaleString()}`;
    document.getElementById('budget-remaining').textContent = `$${budgetRemaining.toLocaleString()}`;
    document.getElementById('planner-item-count').textContent = plannerItems.size;

    const budgetBar = document.getElementById('budget-progress-bar');
    const budgetPercentText = document.getElementById('budget-percentage');
    
    budgetBar.style.width = `${Math.min(budgetPercentage, 100)}%`;
    budgetPercentText.textContent = `${budgetPercentage.toFixed(0)}%`;
    
    const budgetRemainingEl = document.getElementById('budget-remaining');
    budgetRemainingEl.classList.toggle('text-red-600', budgetRemaining < 0);
    budgetBar.classList.toggle('bg-red-500', budgetPercentage > 100);
    budgetBar.classList.toggle('bg-blue-600', budgetPercentage <= 100);
}


// --- Handlers for Buttons & Actions ---
function handlePdfExport() {
    if (plannerItems.size === 0) {
        return showNotification('Your planner is empty. Add items to export.', 'warn');
    }
    if (!exportPlannerToPDF(Array.from(plannerItems.values()))) {
        showNotification('Failed to export to PDF. jsPDF library may be missing.', 'error');
    }
}

function handleExcelExport() {
     if (plannerItems.size === 0) {
        return showNotification('Your planner is empty. Add items to export.', 'warn');
    }
    if (!exportPlannerToExcel(Array.from(plannerItems.values()))) {
        showNotification('Failed to export to Excel. SheetJS library may be missing.', 'error');
    }
}

function handleLogDownload() {
    if (!Logger.downloadLogFile()) {
        showNotification('There are no log entries to download.', 'info');
    }
}


// --- UI Utilities ---
function showLoading(text) {
    loadingText.textContent = text;
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

function showNotification(message, type = 'info') {
    notificationText.textContent = message;
    
    // Reset classes
    notificationBanner.classList.remove('bg-blue-100', 'text-blue-800', 'bg-green-100', 'text-green-800', 'bg-yellow-100', 'text-yellow-800', 'bg-red-100', 'text-red-800');

    switch (type) {
        case 'success':
            notificationBanner.classList.add('bg-green-100', 'text-green-800');
            break;
        case 'warn':
            notificationBanner.classList.add('bg-yellow-100', 'text-yellow-800');
            break;
        case 'error':
            notificationBanner.classList.add('bg-red-100', 'text-red-800');
            break;
        default: // info
             notificationBanner.classList.add('bg-blue-100', 'text-blue-800');
            break;
    }
    notificationBanner.classList.remove('hidden');
}

function getScoreColor(score) {
    if (score > 75) return '#16a34a'; // Green
    if (score > 50) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
}


// --- Settings & API Keys ---
function saveApiKeys(event) {
    event.preventDefault();
    const geminiKey = document.getElementById('gemini-api-key').value;
    const weatherKey = document.getElementById('weather-api-key').value;
    
    if (geminiKey) localStorage.setItem('geminiApiKey', geminiKey);
    if (weatherKey) localStorage.setItem('weatherApiKey', weatherKey);
    
    Logger.info('API keys saved.');
    document.getElementById('settings-modal').classList.add('hidden');
    showNotification('Settings saved successfully!', 'success');
}

function loadApiKeys() {
    const geminiKey = localStorage.getItem('geminiApiKey');
    const weatherKey = localStorage.getItem('weatherApiKey');
    if (geminiKey) document.getElementById('gemini-api-key').value = geminiKey;
    if (weatherKey) document.getElementById('weather-api-key').value = weatherKey;
    if (geminiKey || weatherKey) Logger.info('API keys loaded from local storage.');
}

