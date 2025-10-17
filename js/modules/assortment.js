import { callGeminiAPI } from '../api.js';
import { showModal, showLoadingInModal } from '../utils.js';

// --- DEMO DATA & STATE ---
const products = [
    { id: 1, name: 'Urban Hiker Boot', price: 85.50, img: 'https://placehold.co/200x200/a3e635/44403c?text=Boot' },
    { id: 2, name: 'Classic Leather Loafer', price: 62.00, img: 'https://placehold.co/200x200/f87171/44403c?text=Loafer' },
    { id: 3, name: 'Canvas Slip-On', price: 35.75, img: 'https://placehold.co/200x200/60a5fa/44403c?text=Slip-On' },
    { id: 4, name: 'Running Sneaker', price: 78.20, img: 'https://placehold.co/200x200/facc15/44403c?text=Sneaker' },
    { id: 5, name: 'Summer Sandal', price: 29.99, img: 'https://placehold.co/200x200/fb923c/44403c?text=Sandal' },
    { id: 6, name: 'Winter Snow Boot', price: 110.00, img: 'https://placehold.co/200x200/7dd3fc/44403c?text=Snow+Boot' }
];

let planningCart = [];
const budget = 500000;

// --- RENDER FUNCTIONS ---

function render(container) {
    loadState();

    container.innerHTML = `
        <div class="space-y-6">
            <!-- Phase 1: Analysis & Strategy -->
            <div>
                <h2 class="text-xl font-bold mb-2">Phase 1: Analysis & Strategy</h2>
                <div class="bg-white p-4 rounded-lg shadow">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-semibold">Seasonal Performance Review</h3>
                        <div class="flex space-x-2">
                            <select class="p-2 border rounded-lg bg-gray-50">
                                <option>Fall/Winter 2024</option>
                                <option>Spring/Summer 2024</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div class="p-4 bg-blue-50 rounded-lg"><div class="text-gray-500">Total Sales</div><div class="text-2xl font-bold">$1,250,000</div></div>
                        <div class="p-4 bg-green-50 rounded-lg"><div class="text-gray-500">Gross Margin</div><div class="text-2xl font-bold">48.5%</div></div>
                        <div class="p-4 bg-yellow-50 rounded-lg"><div class="text-gray-500">Sell-Through %</div><div class="text-2xl font-bold">82%</div></div>
                    </div>
                    <div class="mt-4 border-t pt-4">
                         <h4 class="font-semibold mb-2">AI Trend Insights</h4>
                         <div id="ai-insights-container" class="text-sm text-gray-600 space-y-2">Click the button to get the latest market trends.</div>
                         <button id="get-ai-insights-btn" class="mt-2 text-sm bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600">✨ Get AI Trend Insights</button>
                    </div>
                </div>
            </div>

            <!-- Phase 2: Building the Assortment -->
            <div>
                <h2 class="text-xl font-bold mb-2">Phase 2: Building the Assortment</h2>
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="font-semibold mb-2">Vendor Marketplace</h3>
                    <div id="vendor-marketplace" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        ${renderMarketplace()}
                    </div>
                </div>
            </div>
            
            <!-- Phase 3: Optimization & Finalization -->
            <div>
                <h2 class="text-xl font-bold mb-2">Phase 3: Optimization & Finalization</h2>
                <div class="sticky top-0 bg-white p-4 rounded-lg shadow z-10">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-semibold">Planning Grid & Budget</h3>
                        <button id="analyze-plan-btn" class="text-sm bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600">✨ Analyze My Plan</button>
                    </div>
                    <div class="mb-2">
                        <div class="flex justify-between text-sm font-medium text-gray-600">
                            <span>Total Order Cost: <span id="total-cost">$0</span></span>
                            <span>Budget: $${budget.toLocaleString()}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5"><div id="budget-bar" class="bg-blue-600 h-2.5 rounded-full" style="width: 0%"></div></div>
                    </div>
                    <div id="planning-grid-container" class="mt-4"></div>
                </div>
            </div>
        </div>
    `;

    addEventListeners();
    renderPlanningGrid(); // Render grid after elements are in DOM
    updateBudgetTracker();
}

function renderMarketplace() {
    return products.map(p => `
        <div class="border rounded-lg p-2 text-center shadow-sm">
            <img src="${p.img}" alt="${p.name}" class="w-full h-auto rounded-md mb-2">
            <h4 class="text-sm font-medium h-10">${p.name}</h4>
            <p class="text-xs text-gray-500">$${p.price.toFixed(2)}</p>
            <button data-product-id="${p.id}" class="add-to-plan-btn mt-2 w-full bg-blue-500 text-white text-sm py-1 rounded-md hover:bg-blue-600">Add</button>
        </div>
    `).join('');
}

function renderPlanningGrid() {
    const gridContainer = document.getElementById('planning-grid-container');
    if (!gridContainer) return;

    if (planningCart.length === 0) {
        gridContainer.innerHTML = `<p class="text-gray-500 text-center py-4">Add items from the marketplace to your plan.</p>`;
        return;
    }
    
    gridContainer.innerHTML = `
        <table class="w-full text-sm text-left">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th class="px-4 py-3">Product</th>
                    <th class="px-4 py-3">Cost</th>
                    <th class="px-4 py-3">Units</th>
                    <th class="px-4 py-3">Total</th>
                    <th class="px-4 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${planningCart.map(item => `
                    <tr class="bg-white border-b">
                        <td class="px-4 py-4 font-medium">${item.product.name}</td>
                        <td class="px-4 py-4">$${item.product.price.toFixed(2)}</td>
                        <td class="px-4 py-4">
                            <input type="number" value="${item.units}" data-item-id="${item.product.id}" class="plan-units-input w-20 p-1 border rounded-md">
                        </td>
                        <td class="px-4 py-4">$${(item.product.price * item.units).toFixed(2)}</td>
                        <td class="px-4 py-4">
                            <button data-item-id="${item.product.id}" class="remove-from-plan-btn text-red-500 hover:text-red-700">Remove</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function updateBudgetTracker() {
    const totalCost = planningCart.reduce((sum, item) => sum + (item.product.price * item.units), 0);
    const percentage = Math.min((totalCost / budget) * 100, 100);
    
    const totalCostEl = document.getElementById('total-cost');
    const budgetBarEl = document.getElementById('budget-bar');

    if (totalCostEl) {
        totalCostEl.textContent = `$${totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
    if (budgetBarEl) {
        budgetBarEl.style.width = `${percentage}%`;
        budgetBarEl.classList.toggle('bg-red-600', percentage >= 100);
        budgetBarEl.classList.toggle('bg-blue-600', percentage < 100);
    }
}

// --- STATE MANAGEMENT ---

function saveState() {
    sessionStorage.setItem('planningCart', JSON.stringify(planningCart));
}

function loadState() {
    try {
        const savedCart = sessionStorage.getItem('planningCart');
        planningCart = savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
        console.error("Could not parse planning cart from sessionStorage", e);
        planningCart = [];
    }
}

// --- EVENT LISTENERS ---

function addEventListeners() {
    const marketplace = document.getElementById('vendor-marketplace');
    const planningGrid = document.getElementById('planning-grid-container');
    const insightsBtn = document.getElementById('get-ai-insights-btn');
    const analyzeBtn = document.getElementById('analyze-plan-btn');

    if (marketplace) {
        marketplace.addEventListener('click', handleAddToPlan);
    }
    if (planningGrid) {
        planningGrid.addEventListener('click', handleRemoveFromPlan);
        planningGrid.addEventListener('change', handleUpdatePlanUnits);
    }
    if (insightsBtn) {
        insightsBtn.addEventListener('click', handleGetInsights);
    }
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', handleAnalyzePlan);
    }
}

function handleAddToPlan(e) {
    if (!e.target.classList.contains('add-to-plan-btn')) return;
    const productId = parseInt(e.target.dataset.productId, 10);
    const existingItem = planningCart.find(item => item.product.id === productId);

    if (existingItem) {
        existingItem.units += 10;
    } else {
        const product = products.find(p => p.id === productId);
        if (product) {
            planningCart.push({ product, units: 10 });
        }
    }
    
    saveState();
    renderPlanningGrid();
    updateBudgetTracker();
}

function handleRemoveFromPlan(e) {
    if (!e.target.classList.contains('remove-from-plan-btn')) return;
    const itemId = parseInt(e.target.dataset.itemId, 10);
    planningCart = planningCart.filter(item => item.product.id !== itemId);
    
    saveState();
    renderPlanningGrid();
    updateBudgetTracker();
}

function handleUpdatePlanUnits(e) {
    if (!e.target.classList.contains('plan-units-input')) return;
    const itemId = parseInt(e.target.dataset.itemId, 10);
    const newUnits = parseInt(e.target.value, 10);
    const item = planningCart.find(i => i.product.id === itemId);

    if (item && newUnits >= 0) {
        item.units = newUnits;
        saveState();
        renderPlanningGrid();
        updateBudgetTracker();
    }
}

async function handleGetInsights() {
    const container = document.getElementById('ai-insights-container');
    if (!container) return;
    
    container.innerHTML = `<div class="flex items-center"><div class="spinner mr-2"></div><span>Getting latest trends...</span></div>`;
    const response = await callGeminiAPI("GET_TRENDS");
    container.innerHTML = response;
}

async function handleAnalyzePlan() {
    showLoadingInModal("Analyzing Your Plan...");
    const context = {
        itemCount: planningCart.length,
        hasBoots: planningCart.some(i => i.product.name.includes('Boot')),
        hasSandals: planningCart.some(i => i.product.name.includes('Sandal'))
    };
    const response = await callGeminiAPI("ANALYZE_PLAN", context);
    showModal("AI Plan Analysis", response);
}

// --- EXPORT ---

export { render as init };

