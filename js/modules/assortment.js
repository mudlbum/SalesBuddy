import { callGeminiAPI } from '../api.js';
import { showBalloon, hideBalloon, showToast } from '../utils.js';

// --- DEMO DATA & STATE ---

const products = [
    { id: 1, name: 'TrekWise Alpine Boot', brand: 'TrekWise', style: 'Hiking Boots', gender: 'Unisex', price: 189.99, img: 'images/01.jpg', aiSuggestion: true, sku: 'TW-ALPB-U-9.5', cost: 95.50, materials: 'Leather, Gore-Tex, Rubber', sizes: [8, 8.5, 9, 9.5, 10, 10.5, 11, 12], colors: ['#5c4033', '#000000', '#808080'] },
    { id: 2, name: 'Velocity Sprint Runner', brand: 'Velocity', style: 'Retro Runners', gender: 'Mens', price: 145.50, img: 'images/02.jpg', aiSuggestion: true, sku: 'VL-SPRR-M-10', cost: 72.00, materials: 'Mesh, Synthetic, EVA', sizes: [9, 9.5, 10, 10.5, 11, 12, 13], colors: ['#0000ff', '#ffffff', '#ff0000'] },
    { id: 3, name: 'Milano Weave Loafer', brand: 'Milano', style: 'Woven Leather', gender: 'Womens', price: 210.00, img: 'images/03.jpg', aiSuggestion: true, sku: 'ML-WVLF-W-7', cost: 110.00, materials: 'Woven Leather, Rubber Sole', sizes: [6, 6.5, 7, 7.5, 8, 8.5, 9], colors: ['#a0522d', '#000000'] },
    { id: 4, name: 'SunStep Espadrille', brand: 'SunStep', style: 'Canvas Slip-On', gender: 'Womens', price: 89.99, img: 'images/04.jpg', sku: 'SS-ESPA-W-8', cost: 45.00, materials: 'Canvas, Jute Rope', sizes: [6, 7, 8, 9, 10], colors: ['#f5f5dc', '#000000'] },
    { id: 5, name: 'Velocity Charge XT', brand: 'Velocity', style: 'Retro Runners', gender: 'Womens', price: 155.00, img: 'images/05.jpg', sku: 'VL-CHGXT-W-7.5', cost: 78.00, materials: 'Suede, Mesh, Rubber', sizes: [6.5, 7, 7.5, 8, 8.5, 9], colors: ['#ffd700', '#000000'] },
    { id: 6, name: 'TrekWise Glacier Boot', brand: 'TrekWise', style: 'Hiking Boots', gender: 'Mens', price: 220.00, img: 'images/06.jpg', sku: 'TW-GLCB-M-10', cost: 115.00, materials: 'Leather, Insulation, Rubber', sizes: [9, 9.5, 10, 10.5, 11, 12], colors: ['#4a4a4a', '#000000'] },
    { id: 7, name: 'Milano Suede Driver', brand: 'Milano', style: 'Chunky Loafers', gender: 'Mens', price: 195.00, img: 'images/07.jpg', sku: 'ML-SDDR-M-9', cost: 105.00, materials: 'Suede, Rubber', sizes: [8, 8.5, 9, 9.5, 10, 11], colors: ['#000080', '#8B4513'] },
    { id: 8, name: 'SunStep Beachcomber', brand: 'SunStep', style: 'Sandals', gender: 'Unisex', price: 65.50, img: 'images/08.jpg', sku: 'SS-BCH-U-9', cost: 32.00, materials: 'Canvas, EVA', sizes: [7, 8, 9, 10, 11, 12], colors: ['#3cb371', '#5f9ea0'] },
    { id: 9, name: 'Velocity Pace Trainer', brand: 'Velocity', style: 'Retro Runners', gender: 'Unisex', price: 130.00, img: 'images/09.jpg', sku: 'VL-PCT-U-8.5', cost: 65.00, materials: 'Mesh, Synthetic', sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10], colors: ['#ffffff', '#0000ff'] },
    { id: 10, name: 'TrekWise Summit Pro', brand: 'TrekWise', style: 'Hiking Boots', gender: 'Mens', price: 250.00, img: 'images/10.jpg', sku: 'TW-SMPR-M-11', cost: 125.00, materials: 'Full-grain Leather, Vibram', sizes: [9, 10, 11, 12, 13], colors: ['#808080', '#00ff00'] },
    { id: 11, name: 'Milano Classic Pump', brand: 'Milano', style: 'Heels', gender: 'Womens', price: 180.00, img: 'images/11.jpg', sku: 'ML-CLSP-W-7', cost: 90.00, materials: 'Patent Leather', sizes: [6, 6.5, 7, 7.5, 8, 8.5, 9], colors: ['#ff0000', '#000000'] },
    { id: 12, name: 'SunStep Boardwalk Flip', brand: 'SunStep', style: 'Sandals', gender: 'Mens', price: 45.00, img: 'images/12.jpg', sku: 'SS-BWFP-M-10', cost: 22.00, materials: 'Rubber, Nylon', sizes: [8, 9, 10, 11, 12, 13], colors: ['#cd853f', '#000000'] },
    { id: 13, name: 'Velocity Echo Sneaker', brand: 'Velocity', style: 'Retro Runners', gender: 'Womens', price: 160.00, img: 'images/13.jpg', sku: 'VL-ECHO-W-8', cost: 80.00, materials: 'Suede, Mesh, Rubber', sizes: [6, 7, 8, 9, 10], colors: ['#ffff00', '#c0c0c0'] },
    { id: 14, name: 'TrekWise Trail Runner', brand: 'TrekWise', style: 'Hiking Boots', gender: 'Womens', price: 175.00, img: 'images/14.jpg', sku: 'TW-TRLR-W-7.5', cost: 88.00, materials: 'Synthetic, Mesh, Rubber', sizes: [6.5, 7, 7.5, 8, 8.5, 9], colors: ['#add8e6', '#808080'] },
    { id: 15, name: 'Milano Tassel Loafer', brand: 'Milano', style: 'Chunky Loafers', gender: 'Mens', price: 225.00, img: 'images/15.jpg', sku: 'ML-TSLF-M-9.5', cost: 112.00, materials: 'Calfskin Leather', sizes: [8, 9, 9.5, 10, 11], colors: ['#000000', '#800000'] },
    { id: 16, name: 'SunStep Reef Walker', brand: 'SunStep', style: 'Sandals', gender: 'Unisex', price: 75.00, img: 'images/16.jpg', sku: 'SS-RFWK-U-9', cost: 37.00, materials: 'Neoprene, Rubber', sizes: [7, 8, 9, 10, 11], colors: ['#008000', '#000000'] },
    { id: 17, name: 'Velocity Apex High-Top', brand: 'Velocity', style: 'Retro Runners', gender: 'Unisex', price: 170.00, img: 'images/17.jpg', aiSuggestion: true, sku: 'VL-APXH-U-10', cost: 85.00, materials: 'Leather, Mesh, Rubber', sizes: [8, 9, 10, 11, 12], colors: ['#ffffff', '#0000ff'] },
    { id: 18, name: 'TrekWise Canyon Sandal', brand: 'TrekWise', style: 'Sandals', gender: 'Mens', price: 110.00, img: 'images/18.jpg', sku: 'TW-CYNS-M-11', cost: 55.00, materials: 'Webbing, Rubber', sizes: [9, 10, 11, 12, 13], colors: ['#f5deb3', '#a0522d'] },
    { id: 19, name: 'Milano Ballet Flat', brand: 'Milano', style: 'Flats', gender: 'Womens', price: 165.00, img: 'images/19.jpg', sku: 'ML-BLTF-W-7', cost: 82.00, materials: 'Nappa Leather', sizes: [6, 7, 8, 9], colors: ['#ff0000', '#000000', '#f5f5dc'] },
    { id: 20, name: 'SunStep Cove Slipper', brand: 'SunStep', style: 'Canvas Slip-On', gender: 'Womens', price: 95.00, img: 'images/20.jpg', sku: 'SS-CVSL-W-8', cost: 47.00, materials: 'Canvas, Fleece Lining', sizes: [6, 7, 8, 9, 10], colors: ['#ffa500', '#d2b48c'] },
    { id: 21, name: 'Velocity Volt Runner', brand: 'Velocity', style: 'Retro Runners', gender: 'Mens', price: 150.00, img: 'images/21.jpg', sku: 'VL-VLTR-M-10.5', cost: 75.00, materials: 'Mesh, Synthetic', sizes: [9, 10, 10.5, 11, 12], colors: ['#000000', '#ffff00'] },
    { id: 22, name: 'TrekWise Tundra Boot', brand: 'TrekWise', style: 'Hiking Boots', gender: 'Unisex', price: 235.00, img: 'images/22.jpg', sku: 'TW-TNDB-U-9', cost: 118.00, materials: 'Leather, Waterproof Membrane', sizes: [8, 9, 10, 11], colors: ['#87ceeb', '#4682b4'] },
    { id: 23, name: 'Milano Velvet Loafer', brand: 'Milano', style: 'Chunky Loafers', gender: 'Womens', price: 240.00, img: 'images/23.jpg', aiSuggestion: true, sku: 'ML-VLVL-W-7.5', cost: 120.00, materials: 'Velvet, Leather', sizes: [6, 7, 7.5, 8, 9], colors: ['#800080', '#000000'] },
    { id: 24, name: 'SunStep Laguna Slide', brand: 'SunStep', style: 'Sandals', gender: 'Womens', price: 70.00, img: 'images/24.jpg', sku: 'SS-LGNS-W-8', cost: 35.00, materials: 'Synthetic, Cork', sizes: [6, 7, 8, 9, 10], colors: ['#90ee90', '#f0e68c'] },
    { id: 25, name: 'Aura Flex Trainer', brand: 'Aura', style: 'Performance', gender: 'Womens', price: 135.00, img: 'images/25.jpg', sku: 'AU-FLXT-W-8', cost: 67.00, materials: 'Knit, EVA', sizes: [6, 7, 8, 9], colors: ['#ffc0cb', '#ffffff'] },
    { id: 26, name: 'Apex Ascent Hiker', brand: 'Apex', style: 'Hiking Boots', gender: 'Mens', price: 195.00, img: 'images/26.jpg', sku: 'AP-ASCH-M-10', cost: 98.00, materials: 'Suede, Nylon, Rubber', sizes: [9, 10, 11, 12], colors: ['#00008b', '#ffa500'] },
    { id: 27, name: 'Aura Stratus Runner', brand: 'Aura', style: 'Retro Runners', gender: 'Womens', price: 155.00, img: 'images/27.jpg', aiSuggestion: true, sku: 'AU-STRR-W-7', cost: 78.00, materials: 'Mesh, Suede', sizes: [6, 7, 8, 9], colors: ['#ffc0cb', '#ffffff'] },
    { id: 28, name: 'Apex Urban Commuter', brand: 'Apex', style: 'Canvas Slip-On', gender: 'Unisex', price: 110.00, img: 'images/28.jpg', sku: 'AP-URBC-U-9', cost: 55.00, materials: 'Canvas, Rubber', sizes: [7, 8, 9, 10, 11], colors: ['#4682b4', '#ffffff'] },
    { id: 29, name: 'TrekWise Ridgeback', brand: 'TrekWise', style: 'Hiking Boots', gender: 'Mens', price: 210.00, img: 'images/29.jpg', sku: 'TW-RGBK-M-11', cost: 105.00, materials: 'Suede, Cordura', sizes: [9, 10, 11, 12], colors: ['#556b2f', '#000000'] },
    { id: 30, name: 'Velocity Nova Trainer', brand: 'Velocity', style: 'Performance', gender: 'Womens', price: 140.00, img: 'images/30.jpg', sku: 'VL-NVTR-W-8.5', cost: 70.00, materials: 'Mesh, TPU', sizes: [6, 7, 8, 8.5, 9], colors: ['#add8e6', '#ffffff'] },
    { id: 31, name: 'Milano Linen Espadrille', brand: 'Milano', style: 'Canvas Slip-On', gender: 'Womens', price: 185.00, img: 'images/31.jpg', sku: 'ML-LNSP-W-8', cost: 92.00, materials: 'Linen, Jute', sizes: [6, 7, 8, 9], colors: ['#ff0000', '#f5f5dc'] },
    { id: 32, name: 'SunStep Coastline Driver', brand: 'SunStep', style: 'Chunky Loafers', gender: 'Mens', price: 95.00, img: 'images/32.jpg', sku: 'SS-CSTD-M-10', cost: 48.00, materials: 'Leather, Rubber', sizes: [8, 9, 10, 11], colors: ['#d2b48c', '#a0522d'] },
    { id: 33, name: 'Aura Bloom Flat', brand: 'Aura', style: 'Flats', gender: 'Womens', price: 120.00, img: 'images/33.jpg', sku: 'AU-BLMF-W-7', cost: 60.00, materials: 'Fabric, Leather', sizes: [6, 7, 8, 9], colors: ['#ffc0cb', '#f5f5dc'] },
    { id: 34, name: 'Apex Terrain Sandal', brand: 'Apex', style: 'Sandals', gender: 'Unisex', price: 130.00, img: 'images/34.jpg', sku: 'AP-TRNS-U-10', cost: 65.00, materials: 'Nylon, Rubber', sizes: [8, 9, 10, 11, 12], colors: ['#000080', '#808080'] },
    { id: 35, name: 'TrekWise Sierra Low', brand: 'TrekWise', style: 'Hiking Boots', gender: 'Womens', price: 165.00, img: 'images/35.jpg', sku: 'TW-SRLW-W-7.5', cost: 83.00, materials: 'Suede, Mesh', sizes: [6, 7, 7.5, 8, 9], colors: ['#008000', '#808080'] },
    { id: 36, name: 'Velocity Comet Racer', brand: 'Velocity', style: 'Retro Runners', gender: 'Mens', price: 160.00, img: 'images/36.jpg', sku: 'VL-CMTR-M-10', cost: 80.00, materials: 'Synthetic, Mesh', sizes: [9, 10, 11, 12], colors: ['#0000ff', '#c0c0c0'] },
    { id: 37, name: 'Milano Stiletto Heel', brand: 'Milano', style: 'Heels', gender: 'Womens', price: 250.00, img: 'images/37.jpg', sku: 'ML-STLH-W-7', cost: 125.00, materials: 'Leather', sizes: [6, 7, 8, 9], colors: ['#ff0000', '#000000'] },
    { id: 38, name: 'SunStep Pier Sandal', brand: 'SunStep', style: 'Sandals', gender: 'Womens', price: 80.00, img: 'images/38.jpg', sku: 'SS-PRSD-W-8', cost: 40.00, materials: 'Leatherette', sizes: [6, 7, 8, 9, 10], colors: ['#ffa500', '#f5deb3'] },
    { id: 39, name: 'Aura Zenith Walker', brand: 'Aura', style: 'Performance', gender: 'Unisex', price: 145.00, img: 'images/39.jpg', sku: 'AU-ZNWK-U-9', cost: 72.00, materials: 'Knit, Foam', sizes: [7, 8, 9, 10, 11], colors: ['#ffc0cb', '#c0c0c0'] },
    { id: 40, name: 'Apex Trailblazer', brand: 'Apex', style: 'Hiking Boots', gender: 'Unisex', price: 220.00, img: 'images/40.jpg', aiSuggestion: true, sku: 'AP-TRBZ-U-10', cost: 110.00, materials: 'Leather, Ballistic Nylon', sizes: [8, 9, 10, 11, 12], colors: ['#00008b', '#ffa500'] },
    { id: 41, name: 'Milano Horsebit Loafer', brand: 'Milano', style: 'Chunky Loafers', gender: 'Mens', price: 280.00, img: 'images/41.jpg', sku: 'ML-HBLF-M-9.5', cost: 140.00, materials: 'Leather', sizes: [8, 9, 9.5, 10, 11], colors: ['#8b0000', '#000000'] },
    { id: 42, name: 'Velocity Phantom', brand: 'Velocity', style: 'Retro Runners', gender: 'Mens', price: 175.00, img: 'images/42.jpg', sku: 'VL-PHTM-M-10', cost: 88.00, materials: 'Leather, Mesh', sizes: [9, 10, 11, 12], colors: ['#000080', '#c0c0c0'] },
    { id: 43, name: 'TrekWise Vista Sandal', brand: 'TrekWise', style: 'Sandals', gender: 'Womens', price: 125.00, img: 'images/43.jpg', sku: 'TW-VSSD-W-8', cost: 62.00, materials: 'Webbing, EVA', sizes: [6, 7, 8, 9], colors: ['#556b2f', '#f5deb3'] },
    { id: 44, name: 'SunStep Marina Slip-On', brand: 'SunStep', style: 'Canvas Slip-On', gender: 'Unisex', price: 75.00, img: 'images/44.jpg', sku: 'SS-MRNA-U-9', cost: 38.00, materials: 'Canvas, Rubber', sizes: [7, 8, 9, 10, 11], colors: ['#ffa500', '#ffffff'] },
    { id: 45, name: 'Aura Solstice Runner', brand: 'Aura', style: 'Performance', gender: 'Womens', price: 160.00, img: 'images/45.jpg', sku: 'AU-SOLR-W-7.5', cost: 80.00, materials: 'Engineered Mesh', sizes: [6, 7, 7.5, 8, 9], colors: ['#ff69b4', '#ffffff'] },
    { id: 46, name: 'Apex Stealth Boot', brand: 'Apex', style: 'Hiking Boots', gender: 'Mens', price: 240.00, img: 'images/46.jpg', sku: 'AP-STLB-M-11', cost: 120.00, materials: 'Synthetic, Waterproof', sizes: [9, 10, 11, 12, 13], colors: ['#4682b4', '#000000'] },
    { id: 47, name: 'Milano Suede Pump', brand: 'Milano', style: 'Heels', gender: 'Womens', price: 220.00, img: 'images/47.jpg', sku: 'ML-SDPM-W-7', cost: 110.00, materials: 'Suede', sizes: [6, 7, 8, 9], colors: ['#ff0000', '#000000'] },
    { id: 48, name: 'Velocity Core Trainer', brand: 'Velocity', style: 'Performance', gender: 'Unisex', price: 125.00, img: 'images/48.jpg', sku: 'VL-CRTR-U-9', cost: 63.00, materials: 'Mesh, Synthetic', sizes: [7, 8, 9, 10, 11], colors: ['#ffffff', '#0000ff'] },
    { id: 49, name: 'SunStep Island Loafer', brand: 'SunStep', style: 'Woven Leather', gender: 'Mens', price: 115.00, img: 'images/49.jpg', sku: 'SS-ISLL-M-10', cost: 58.00, materials: 'Woven Leather', sizes: [8, 9, 10, 11], colors: ['#d2691e', '#a0522d'] },
    { id: 50, name: 'Aura Harmony Flat', brand: 'Aura', style: 'Flats', gender: 'Womens', price: 130.00, img: 'images/50.jpg', aiSuggestion: true, sku: 'AU-HMNF-W-8', cost: 65.00, materials: 'Leather', sizes: [6, 7, 8, 9], colors: ['#ffc0cb', '#000000'] },
    { id: 51, name: 'Apex Nomad Traveler', brand: 'Apex', style: 'Canvas Slip-On', gender: 'Mens', price: 105.00, img: 'images/51.jpg', sku: 'AP-NMD-M-10', cost: 53.00, materials: 'Canvas, Rubber', sizes: [8, 9, 10, 11], colors: ['#191970', '#ffffff'] },
    { id: 52, name: 'TrekWise Peak Seeker', brand: 'TrekWise', style: 'Hiking Boots', gender: 'Unisex', price: 260.00, img: 'images/52.jpg', sku: 'TW-PKSK-U-10', cost: 130.00, materials: 'Leather, Gore-Tex', sizes: [8, 9, 10, 11, 12], colors: ['#008000', '#000000'] }
];

const stores = Array.from({ length: 100 }, (_, i) => {
    const city = ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City'][i % 8];
    return { id: `S${1001 + i}`, name: `${city} Store #${Math.floor(i / 8) + 1}`, city };
});

let purchasePlan = [];
let trendData = null;
let currentFilters = {
    brand: 'all',
    style: 'all',
    gender: 'all',
    aiSuggestion: false
};

async function render(container) {
    container.innerHTML = `<div class="flex justify-center items-center h-full"><div class="spinner"></div><span class="ml-4">Loading Assortment Planner...</span></div>`;
    
    try {
        const rawTrendData = await callGeminiAPI('GET_ASSORTMENT_TRENDS');
        const cleanedTrendData = rawTrendData.replace(/```json\n?|```/g, '');
        trendData = JSON.parse(cleanedTrendData);
    } catch (e) {
        console.error("Failed to parse trend data:", e, "Raw data:", rawTrendData);
        container.innerHTML = `<p class="text-red-500">Error loading trend data. Please try again.</p>`;
        return;
    }

    container.innerHTML = `
        <div class="space-y-8 assortment-planner">
            <section id="trend-dashboard">
                <h2 class="text-2xl font-bold mb-4 text-gray-800">AI Seasonal Trend Dashboard</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    ${renderTrendInfographics()}
                </div>
            </section>
            
            <section id="product-catalog">
                <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">Product Catalog</h2>
                    ${renderFilters()}
                </div>
                <div id="product-list" class="product-grid-view">
                    ${filterAndRenderProducts()}
                </div>
            </section>
            
            <section id="purchase-plan-allocation">
                <div id="purchase-plan-header">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-800">Purchase Plan & Store Allocation</h2>
                        <button id="accept-ai-suggestions-btn" class="text-sm bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" disabled>✨ Accept AI Suggestions</button>
                    </div>
                </div>
                <div id="allocation-table-container">
                    ${renderAllocationTable()}
                </div>
                <div class="mt-6 text-center">
                    <button id="export-excel-btn" class="flex items-center space-x-2 text-sm bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 mx-auto">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                       <span>Export to Excel</span>
                    </button>
                </div>
            </section>
        </div>
    `;

    addEventListeners();
    animateInfographics();
}

function renderTrendInfographics() {
    if (!trendData) return '<p>Trend data not available.</p>';
    const renderChart = (title, data, color) => `
        <div class="trend-infographic bg-white p-4 rounded-lg shadow-md flex flex-col justify-between">
            <div class="flex justify-between items-center mb-2">
                <h3 class="font-semibold text-gray-600">${title}</h3>
                <button class="text-xs text-blue-500 hover:underline see-more-trends-btn" data-category="${title}">More</button>
            </div>
            <div class="space-y-2">
            ${data.sort((a,b) => b.trendPercentage - a.trendPercentage).slice(0, 3).map(item => `
                <div class="text-sm">
                    <div class="flex justify-between font-medium">
                        <span>${item.name}</span>
                        <span class="text-${color}-600">+${item.trendPercentage}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-1.5"><div class="bg-${color}-500 h-1.5 rounded-full" style="width: 0%" data-width="${item.trendPercentage * 1.5 > 100 ? 100 : item.trendPercentage * 1.5}%"></div></div>
                </div>
            `).join('')}
            </div>
        </div>
    `;
    return `
        ${renderChart('Brand Momentum', trendData.brands, 'blue')}
        ${renderChart('Top Styles', trendData.styles, 'green')}
        ${renderChart('Color Palette', trendData.colors, 'purple')}
        ${renderChart('Gender Focus', trendData.genders, 'pink')}
        ${renderChart('Price Point Sweet Spot', trendData.pricePoints, 'yellow')}
        <div class="trend-infographic bg-white p-4 rounded-lg shadow-md">
            <h3 class="font-semibold text-gray-600 mb-2">Seasonal Forecast</h3>
            <div class="text-center">
                <svg class="w-16 h-16 text-yellow-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                <p class="font-bold mt-2">Warm & Dry</p>
                <p class="text-xs text-gray-500">Focus on breathable materials.</p>
            </div>
        </div>
    `;
}

function renderFilters() {
    const brands = [...new Set(products.map(p => p.brand))];
    const styles = [...new Set(products.map(p => p.style))];
    const genders = [...new Set(products.map(p => p.gender))];

    return `
        <div id="catalog-filters" class="flex flex-wrap items-center gap-4">
            <select data-filter="brand" class="filter-select bg-white border border-gray-300 rounded-md py-2 px-3 text-sm">
                <option value="all">All Brands</option>
                ${brands.map(b => `<option value="${b}">${b}</option>`).join('')}
            </select>
            <select data-filter="style" class="filter-select bg-white border border-gray-300 rounded-md py-2 px-3 text-sm">
                <option value="all">All Styles</option>
                ${styles.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
            <select data-filter="gender" class="filter-select bg-white border border-gray-300 rounded-md py-2 px-3 text-sm">
                <option value="all">All Genders</option>
                ${genders.map(g => `<option value="${g}">${g}</option>`).join('')}
            </select>
            <label class="flex items-center text-sm cursor-pointer">
                <input type="checkbox" data-filter="aiSuggestion" class="filter-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                <span class="ml-2 text-gray-700">AI Suggestions Only</span>
            </label>
        </div>
    `;
}

function filterAndRenderProducts() {
    const filtered = products.filter(p => {
        return (currentFilters.brand === 'all' || p.brand === currentFilters.brand) &&
               (currentFilters.style === 'all' || p.style === currentFilters.style) &&
               (currentFilters.gender === 'all' || p.gender === currentFilters.gender) &&
               (!currentFilters.aiSuggestion || p.aiSuggestion);
    });
    return filtered.map(p => renderProductGridItem(p)).join('');
}

function renderProductGridItem(product) {
    const isAdded = purchasePlan.some(p => p.id === product.id);
    const aiIconSVG = `<div class="ai-suggestion-icon-wrapper">
        <svg class="ai-suggestion-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.5C12.41 2.5 12.75 2.84 12.75 3.25V4.75C12.75 5.16 12.41 5.5 12 5.5C11.59 5.5 11.25 5.16 11.25 4.75V3.25C11.25 2.84 11.59 2.5 12 2.5Z" fill="currentColor"/>
            <path d="M18.04 5.96C18.33 5.67 18.8 5.67 19.09 5.96C19.38 6.25 19.38 6.72 19.09 7.01L17.99 8.11C17.7 8.4 17.23 8.4 16.94 8.11C16.65 7.82 16.65 7.35 16.94 7.06L18.04 5.96Z" fill="currentColor"/>
            <path d="M5.96 5.96C6.25 5.67 6.72 5.67 7.01 5.96L8.11 7.06C8.4 7.35 8.4 7.82 8.11 8.11C7.82 8.4 7.35 8.4 7.06 8.11L5.96 7.01C5.67 6.72 5.67 6.25 5.96 5.96Z" fill="currentColor"/>
            <path d="M21.5 12C21.5 11.59 21.16 11.25 20.75 11.25L19.25 11.25C18.84 11.25 18.5 11.59 18.5 12C18.5 12.41 18.84 12.75 19.25 12.75L20.75 12.75C21.16 12.75 21.5 12.41 21.5 12Z" fill="currentColor"/>
            <path d="M4.75 11.25C5.16 11.25 5.5 11.59 5.5 12C5.5 12.41 5.16 12.75 4.75 12.75L3.25 12.75C2.84 12.75 2.5 12.41 2.5 12C2.5 11.59 2.84 11.25 3.25 11.25L4.75 11.25Z" fill="currentColor"/>
            <path d="M12 10.5C14.49 10.5 16.5 12.51 16.5 15V17.5C16.5 18.05 16.05 18.5 15.5 18.5H8.5C7.95 18.5 7.5 18.05 7.5 17.5V15C7.5 12.51 9.51 10.5 12 10.5ZM12 9C8.69 9 6 11.69 6 15V17.5C6 18.88 7.12 20 8.5 20H15.5C16.88 20 18 18.88 18 17.5V15C18 11.69 15.31 9 12 9Z" fill="currentColor"/>
        </svg>
    </div>`;

    return `
        <div class="product-grid-item" data-product-id="${product.id}">
            <div class="product-card-content">
                <div class="product-main-view">
                    <div class="product-thumbnail">
                        <img src="${product.img}" alt="${product.name}">
                    </div>
                    <div class="product-details">
                        <h4>${product.name}</h4>
                        <div class="specs">${product.brand}</div>
                        <div class="product-actions">
                            <span class="price">$${product.price.toFixed(2)}</span>
                            ${product.aiSuggestion ? aiIconSVG : ''}
                        </div>
                    </div>
                    <button class="add-to-plan-btn ${isAdded ? 'added' : ''}">
                        ${isAdded ? '✓ Remove' : '+ Add to Plan'}
                    </button>
                </div>
                <div class="product-expanded-details">
                    <div class="expanded-info">
                        <p><strong>SKU:</strong> ${product.sku || 'N/A'}</p>
                        <p><strong>Cost:</strong> $${product.cost ? product.cost.toFixed(2) : 'N/A'}</p>
                        <p><strong>Materials:</strong> ${product.materials || 'N/A'}</p>
                    </div>
                    <div class="expanded-options">
                        <div class="sizes">
                            <strong>Sizes:</strong>
                            <div class="size-options">
                                ${product.sizes ? product.sizes.map(s => `<span>${s}</span>`).join('') : 'Not Available'}
                            </div>
                        </div>
                        <div class="colors">
                            <strong>Colors:</strong>
                            <div class="color-options">
                                ${product.colors ? product.colors.map(c => `<span class="color-swatch" style="background-color:${c};"></span>`).join('') : 'Not Available'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}


function renderAllocationTable() {
    if (purchasePlan.length === 0) {
        return `<p class="text-center text-gray-500 py-8">Add products from the catalog to begin planning.</p>`;
    }
    const header = purchasePlan.map(p => `<th class="sticky top-0 z-20 px-2 py-3 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">${p.name}</th>`).join('');
    const rows = stores.map(store => `
        <tr class="hover:bg-gray-50">
            <td class="sticky left-0 bg-white hover:bg-gray-50 px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-800">${store.name}</td>
            ${purchasePlan.map(p => `
                <td class="p-1 text-center">
                    <div class="allocation-cell">
                         <span class="ai-quantity-suggestion">AI: ${Math.floor(Math.random() * 20) + 5}</span>
                        <input type="number" class="w-20 text-center border rounded-md p-1" placeholder="0" data-store-id="${store.id}" data-product-id="${p.id}">
                    </div>
                </td>
            `).join('')}
        </tr>
    `).join('');
    return `
        <div class="overflow-auto max-h-[600px] border rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="sticky left-0 top-0 z-30 px-4 py-3 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Store</th>
                        ${header}
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">${rows}</tbody>
            </table>
        </div>
    `;
}

function handleAcceptAISuggestionsClick() {
    const allocationTable = document.getElementById('allocation-table-container');
    if (!allocationTable) return;

    const inputs = allocationTable.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        const cell = input.closest('.allocation-cell');
        const suggestionSpan = cell.querySelector('.ai-quantity-suggestion');
        if (suggestionSpan) {
            const suggestionText = suggestionSpan.textContent;
            const suggestedValue = suggestionText.split(':')[1].trim();
            if (suggestedValue && !isNaN(suggestedValue)) {
                input.value = suggestedValue;
            }
        }
    });
    showToast('All AI suggestions have been applied.');
}

function handleExportExcelClick() {
    if (purchasePlan.length === 0) {
        showToast('Your purchase plan is empty.');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    const allocationTable = document.getElementById('allocation-table-container');
    const headers = ['Store', ...purchasePlan.map(p => `"${p.name}"`)];
    csvContent += headers.join(',') + '\r\n';

    const inputs = Array.from(allocationTable.querySelectorAll('input[type="number"]'));

    stores.slice(0, 10).forEach(store => {
        const row = [`"${store.name}"`];
        purchasePlan.forEach(product => {
            const input = inputs.find(i => i.dataset.storeId === store.id && i.dataset.productId == product.id);
            row.push(input && input.value ? input.value : '0');
        });
        csvContent += row.join(',') + '\r\n';
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "purchase_plan_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Purchase plan has been exported.');
}

function addEventListeners() {
    const moduleContainer = document.querySelector('.assortment-planner');
    if (!moduleContainer) return;
    
    moduleContainer.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.add-to-plan-btn');
        const acceptSugBtn = e.target.closest('#accept-ai-suggestions-btn');
        const exportBtn = e.target.closest('#export-excel-btn');
        const seeMoreBtn = e.target.closest('.see-more-trends-btn');
        const productItem = e.target.closest('.product-grid-item');
        const isActionableClick = e.target.closest('.add-to-plan-btn, .ai-suggestion-icon-wrapper, a, button');

        if (addBtn) {
            handleProductListClick(addBtn);
        } else if (acceptSugBtn) {
            handleAcceptAISuggestionsClick();
        } else if (exportBtn) {
            handleExportExcelClick();
        } else if (seeMoreBtn) {
            const category = seeMoreBtn.dataset.category;
            showToast(`Showing all data for ${category} (Demo)`);
        } else if (productItem && !isActionableClick) {
            handleProductExpand(productItem);
        } else {
            const balloon = document.getElementById('ai-balloon-container');
            if (balloon && !balloon.contains(e.target)) {
                 hideBalloon();
            }
        }
    });

    moduleContainer.addEventListener('mouseover', (e) => {
        const aiIcon = e.target.closest('.ai-suggestion-icon-wrapper');
        if (aiIcon) {
            handleAISuggestionHover(aiIcon);
        }
    });

    moduleContainer.addEventListener('mouseout', (e) => {
        const aiIcon = e.target.closest('.ai-suggestion-icon-wrapper');
        if (aiIcon) {
            const balloon = document.getElementById('ai-balloon-container');
            if (!balloon || !balloon.contains(e.relatedTarget)) {
                hideBalloon();
            }
        }
    });

    moduleContainer.addEventListener('change', handleFilterChange);
}

function handleProductExpand(clickedItem) {
    const currentlyExpanded = document.querySelector('.product-grid-item.expanded');
    if (currentlyExpanded && currentlyExpanded !== clickedItem) {
        currentlyExpanded.classList.remove('expanded');
    }
    clickedItem.classList.toggle('expanded');
}


function handleFilterChange(e) {
    const target = e.target;
    if (target.matches('.filter-select') || target.matches('.filter-checkbox')) {
        const filterType = target.dataset.filter;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        currentFilters[filterType] = value;
        document.getElementById('product-list').innerHTML = filterAndRenderProducts();
    }
}

function handleProductListClick(button) {
    const itemElement = button.closest('.product-grid-item');
    const productId = parseInt(itemElement.dataset.productId, 10);
    const productIndex = purchasePlan.findIndex(p => p.id === productId);

    if (productIndex > -1) {
        purchasePlan.splice(productIndex, 1);
        button.textContent = '+ Add to Plan';
        button.classList.remove('added');
        showToast('Product removed from plan.');
    } else {
        const product = products.find(p => p.id === productId);
        if (product) {
            purchasePlan.push(product);
            button.textContent = '✓ Remove';
            button.classList.add('added');
            showToast(`${product.name} added to plan.`);
        }
    }
    
    document.getElementById('allocation-table-container').innerHTML = renderAllocationTable();
    updateAcceptAISuggestionsButtonState();
}

function updateAcceptAISuggestionsButtonState() {
    const acceptBtn = document.getElementById('accept-ai-suggestions-btn');
    if (acceptBtn) {
        acceptBtn.disabled = purchasePlan.length === 0;
    }
}

async function handleAISuggestionHover(iconWrapper) {
    if (iconWrapper.classList.contains('is-showing-balloon')) {
        return;
    }
    hideBalloon(); 
    iconWrapper.classList.add('is-showing-balloon');

    const itemElement = iconWrapper.closest('.product-grid-item');
    const productId = parseInt(itemElement.dataset.productId, 10);
    const product = products.find(p => p.id === productId);
    const rect = iconWrapper.getBoundingClientRect();
    
    const content = `
        <div class="p-2">
            <h4 class="font-bold text-sm mb-2 flex items-center">
               <span class="mr-2 text-blue-500">
                   <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5C12.41 2.5 12.75 2.84 12.75 3.25V4.75C12.75 5.16 12.41 5.5 12 5.5C11.59 5.5 11.25 5.16 11.25 4.75V3.25C11.25 2.84 11.59 2.5 12 2.5Z" fill="currentColor"/><path d="M18.04 5.96C18.33 5.67 18.8 5.67 19.09 5.96C19.38 6.25 19.38 6.72 19.09 7.01L17.99 8.11C17.7 8.4 17.23 8.4 16.94 8.11C16.65 7.82 16.65 7.35 16.94 7.06L18.04 5.96Z" fill="currentColor"/><path d="M5.96 5.96C6.25 5.67 6.72 5.67 7.01 5.96L8.11 7.06C8.4 7.35 8.4 7.82 8.11 8.11C7.82 8.4 7.35 8.4 7.06 8.11L5.96 7.01C5.67 6.72 5.67 6.25 5.96 5.96Z" fill="currentColor"/><path d="M21.5 12C21.5 11.59 21.16 11.25 20.75 11.25L19.25 11.25C18.84 11.25 18.5 11.59 18.5 12C18.5 12.41 18.84 12.75 19.25 12.75L20.75 12.75C21.16 12.75 21.5 12.41 21.5 12Z" fill="currentColor"/><path d="M4.75 11.25C5.16 11.25 5.5 11.59 5.5 12C5.5 12.41 5.16 12.75 4.75 12.75L3.25 12.75C2.84 12.75 2.5 12.41 2.5 12C2.5 11.59 2.84 11.25 3.25 11.25L4.75 11.25Z" fill="currentColor"/><path d="M12 10.5C14.49 10.5 16.5 12.51 16.5 15V17.5C16.5 18.05 16.05 18.5 15.5 18.5H8.5C7.95 18.5 7.5 18.05 7.5 17.5V15C7.5 12.51 9.51 10.5 12 10.5ZM12 9C8.69 9 6 11.69 6 15V17.5C6 18.88 7.12 20 8.5 20H15.5C16.88 20 18 18.88 18 17.5V15C18 11.69 15.31 9 12 9Z" fill="currentColor"/></svg>
               </span> AI Recommendation</h4>
            <div id="ai-reasoning-content" class="text-sm space-y-2"><div class="spinner-dots-small"><div></div><div></div><div></div></div> Loading Analysis...</div>
        </div>`;
    showBalloon(content, rect); 

    const reasoning = await callGeminiAPI('ANALYZE_PRODUCT_SUGGESTION', { productName: product.name });
    const reasoningEl = document.getElementById('ai-reasoning-content');
    
    if (reasoningEl && iconWrapper.classList.contains('is-showing-balloon')) {
        reasoningEl.innerHTML = reasoning;
    }
}

function updateActionButtonsState() {
    const acceptBtn = document.getElementById('accept-ai-suggestions-btn');
    const exportBtn = document.getElementById('export-excel-btn');
    const hasItems = purchasePlan.length > 0;
    
    if (acceptBtn) acceptBtn.disabled = !hasItems;
    if (exportBtn) exportBtn.disabled = !hasItems;
}

function animateInfographics() {
    document.querySelectorAll('[data-width]').forEach(bar => {
        setTimeout(() => { bar.style.width = bar.dataset.width; }, 100);
    });
}

export { render as init };

