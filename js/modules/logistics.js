import { showModal, showToast } from '../utils.js';

// --- Sample Location Data ---
const locations = [
    { id: 'WH-GTA', name: 'GTA Distribution Center', type: 'Warehouse', lat: 43.8561, lng: -79.3370, // Approx. Richmond Hill
      details: { capacity: '85%', inbound: 5, outbound: 12, issues: 'Minor delay (Weather)' } },
    { id: 'S1001', name: 'Toronto Store #1 (Eaton Centre)', type: 'Store', lat: 43.6544, lng: -79.3807,
      details: { inventoryValue: '$250,580', stockAlerts: 2, nextDelivery: 'Oct 24, AM' } },
    { id: 'S1002', name: 'Vancouver Store #1 (Pacific Centre)', type: 'Store', lat: 49.2827, lng: -123.1207,
      details: { inventoryValue: '$310,210', stockAlerts: 0, nextDelivery: 'Oct 25, PM' } },
    { id: 'S1003', name: 'Montreal Store #1 (Centre Eaton)', type: 'Store', lat: 45.5039, lng: -73.5714,
      details: { inventoryValue: '$195,800', stockAlerts: 1, nextDelivery: 'Oct 24, AM' } },
    { id: 'S1004', name: 'Calgary Store #1 (CORE Shopping)', type: 'Store', lat: 51.0454, lng: -114.0631,
      details: { inventoryValue: '$220,150', stockAlerts: 0, nextDelivery: 'Oct 25, EOD' } },
    { id: 'S1005', name: 'Toronto Store #2 (Yorkdale)', type: 'Store', lat: 43.7256, lng: -79.4522,
      details: { inventoryValue: '$285,400', stockAlerts: 3, nextDelivery: 'Oct 24, AM' } },
];

let mapInstance = null; // To hold the map instance

function render(container) {
    container.innerHTML = `
        <div class="space-y-8">
            <!-- 1. Reporting and Analytics: KPI Dashboard -->
            <div>
                <h2 class="text-xl font-bold mb-3 text-gray-800">Logistics Dashboard</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-sm text-gray-500">On-Time Shipping</div>
                        <div class="text-3xl font-bold text-green-600">98.2%</div>
                    </div>
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-sm text-gray-500">Inventory Turnover</div>
                        <div class="text-3xl font-bold text-blue-600">4.7</div>
                    </div>
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-sm text-gray-500">Orders Processed Today</div>
                        <div class="text-3xl font-bold text-gray-800">1,204</div>
                    </div>
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-sm text-gray-500">Warehouse Capacity</div>
                        <div class="text-3xl font-bold text-yellow-600">78%</div>
                    </div>
                </div>
            </div>

            <!-- 5. Location Map (New Section) -->
            <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold mb-4">Network Overview Map</h3>
                <div id="logistics-map" class="h-96 rounded-lg"></div> <!-- Map container -->
            </div>


            <!-- 2. Inventory Management -->
            <div class="bg-white p-4 rounded-lg shadow">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-semibold">Warehouse Inventory</h3>
                    <div>
                        <input type="text" placeholder="Search by SKU or Product..." class="text-sm px-3 py-1 border rounded-lg">
                        <button id="log-adjustment-btn" class="ml-2 text-sm bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">Log Adjustment</button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th class="px-4 py-3">SKU</th>
                                <th class="px-4 py-3">Product</th>
                                <th class="px-4 py-3">Location</th>
                                <th class="px-4 py-3">Lot/Serial #</th>
                                <th class="px-4 py-3 text-right">Quantity</th>
                                <th class="px-4 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-white border-b hover:bg-gray-50">
                                <td class="px-4 py-3 font-medium">UH-BOOT-BR-9</td>
                                <td class="px-4 py-3">Urban Hiker Boot, Brown, Size 9</td>
                                <td class="px-4 py-3">Aisle 12, Bin 4C</td>
                                <td class="px-4 py-3">L202510A</td>
                                <td class="px-4 py-3 text-right">150</td>
                                <td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-green-200 text-green-800">Available</span></td>
                            </tr>
                            <tr class="bg-white border-b hover:bg-gray-50">
                                <td class="px-4 py-3 font-medium">CS-SLIP-BK-7</td>
                                <td class="px-4 py-3">Canvas Slip-On, Black, Size 7</td>
                                <td class="px-4 py-3">Aisle 4, Bin 2A</td>
                                <td class="px-4 py-3">L202510B</td>
                                <td class="px-4 py-3 text-right">8</td>
                                <td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-yellow-200 text-yellow-800">Low Stock</span></td>
                            </tr>
                            <tr class="bg-white border-b hover:bg-gray-50">
                                <td class="px-4 py-3 font-medium">RS-SNEAK-WH-10</td>
                                <td class="px-4 py-3">Running Sneaker, White, Size 10</td>
                                <td class="px-4 py-3">Aisle 8, Bin 1D</td>
                                <td class="px-4 py-3">L202510C</td>
                                <td class="px-4 py-3 text-right">200</td>
                                <td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-green-200 text-green-800">Available</span></td>
                            </tr>
                             <tr class="bg-white border-b hover:bg-gray-50">
                                <td class="px-4 py-3 font-medium">SS-SAND-TAN-8</td>
                                <td class="px-4 py-3">Summer Sandal, Tan, Size 8</td>
                                <td class="px-4 py-3">Cross-Dock 2</td>
                                <td class="px-4 py-3">L202510D</td>
                                <td class="px-4 py-3 text-right">35</td>
                                <td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-purple-200 text-purple-800">Cross-Docking</span></td>
                            </tr>
                              <tr class="bg-white border-b hover:bg-gray-50">
                                <td class="px-4 py-3 font-medium">CL-LOAF-BLK-9</td>
                                <td class="px-4 py-3">Classic Loafer, Black, Size 9</td>
                                <td class="px-4 py-3">Aisle 1, Bin 1A</td>
                                <td class="px-4 py-3">L202509E</td>
                                <td class="px-4 py-3 text-right">0</td>
                                <td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-red-200 text-red-800">Out of Stock</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 3. Order & Warehouse Management -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="font-semibold mb-4">Picking & Packing Queue</h3>
                    <div class="overflow-y-auto h-64">
                         <div class="p-3 border-b hover:bg-gray-50">
                            <div class="flex justify-between">
                                <span class="font-medium">Order #89341</span>
                                <span class="text-xs text-gray-500">Pick Route: A12 -> A4</span>
                            </div>
                            <p class="text-xs text-gray-600">3 items for Store 5 (Toronto)</p>
                        </div>
                         <div class="p-3 border-b hover:bg-gray-50">
                            <div class="flex justify-between">
                                <span class="font-medium">Order #89342</span>
                                <span class="text-xs text-gray-500">Pick Route: B2 -> C5</span>
                            </div>
                            <p class="text-xs text-gray-600">5 items for Store 2 (Vancouver)</p>
                        </div>
                        <div class="p-3 border-b hover:bg-gray-50">
                            <div class="flex justify-between">
                                <span class="font-medium">Order #89343</span>
                                <span class="text-xs text-gray-500">Pick Route: A8 -> A12</span>
                            </div>
                            <p class="text-xs text-gray-600">2 items for Store 8 (Calgary)</p>
                        </div>
                        <div class="p-3 border-b hover:bg-gray-50">
                            <div class="flex justify-between">
                                <span class="font-medium">Order #89344</span>
                                <span class="text-xs text-gray-500">Pick Route: CD2 -> Ship</span>
                            </div>
                            <p class="text-xs text-gray-600">1 item for Store 5 (Toronto)</p>
                        </div>
                    </div>
                </div>
                 <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="font-semibold mb-4">Customer Returns</h3>
                     <div class="overflow-y-auto h-64">
                         <div class="p-3 border-b hover:bg-gray-50">
                            <div class="flex justify-between">
                                <span class="font-medium">RMA-0122</span>
                                <span class="text-xs text-gray-500">Status: Pending Inspection</span>
                            </div>
                            <p class="text-xs text-gray-600">Classic Leather Loafer, Size 8</p>
                        </div>
                        <div class="p-3 border-b hover:bg-gray-50">
                            <div class="flex justify-between">
                                <span class="font-medium">RMA-0123</span>
                                <span class="text-xs text-gray-500">Status: Restock</span>
                            </div>
                            <p class="text-xs text-gray-600">Urban Hiker Boot, Brown, Size 10</p>
                        </div>
                        <div class="p-3 border-b hover:bg-gray-50">
                            <div class="flex justify-between">
                                <span class="font-medium">RMA-0124</span>
                                <span class="text-xs text-gray-500">Status: Pending Inspection</span>
                            </div>
                            <p class="text-xs text-gray-600">Running Sneaker, White, Size 9</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 4. Transportation Management -->
             <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold mb-4">Ready for Shipment</h3>
                 <table class="w-full text-sm text-left">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th class="px-4 py-3">Order #</th>
                            <th class="px-4 py-3">Destination</th>
                            <th class="px-4 py-3">Items</th>
                            <th class="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="bg-white border-b hover:bg-gray-50">
                            <td class="px-4 py-3 font-medium">#89339</td>
                            <td class="px-4 py-3">Store 8 (Calgary)</td>
                            <td class="px-4 py-3">7</td>
                            <td class="px-4 py-3">
                                <button class="action-btn text-xs bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600" data-action="compare-rates" data-order="#89339">Compare Rates</button>
                                <button class="action-btn ml-2 text-xs bg-gray-200 py-1 px-3 rounded hover:bg-gray-300" data-action="print-slip" data-order="#89339">Print Packing Slip</button>
                            </td>
                        </tr>
                        <tr class="bg-white border-b hover:bg-gray-50">
                            <td class="px-4 py-3 font-medium">#89340</td>
                            <td class="px-4 py-3">Store 3 (Montreal)</td>
                            <td class="px-4 py-3">12</td>
                            <td class="px-4 py-3">
                                <button class="action-btn text-xs bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600" data-action="compare-rates" data-order="#89340">Compare Rates</button>
                                <button class="action-btn ml-2 text-xs bg-gray-200 py-1 px-3 rounded hover:bg-gray-300" data-action="print-slip" data-order="#89340">Print Packing Slip</button>
                            </td>
                        </tr>
                         <tr class="bg-white border-b hover:bg-gray-50">
                            <td class="px-4 py-3 font-medium">#89341</td>
                            <td class="px-4 py-3">Store 5 (Toronto)</td>
                            <td class="px-4 py-3">4</td>
                            <td class="px-4 py-3">
                                <button class="action-btn text-xs bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600" data-action="compare-rates" data-order="#89341">Compare Rates</button>
                                <button class="action-btn ml-2 text-xs bg-gray-200 py-1 px-3 rounded hover:bg-gray-300" data-action="print-slip" data-order="#89341">Print Packing Slip</button>
                            </td>
                        </tr>
                    </tbody>
                 </table>
            </div>
        </div>
    `;
    addLogisticsEventListeners();
    // Initialize map after elements are in the DOM
    setTimeout(initMap, 0);
}

function initMap() {
    // Check if map container exists and Leaflet is loaded
    const mapElement = document.getElementById('logistics-map');
    if (!mapElement || typeof L === 'undefined') {
        console.error("Map container or Leaflet library not found.");
        if (mapElement) mapElement.innerHTML = '<p class="text-center text-red-500">Error loading map.</p>';
        return;
    }

    // Prevent re-initialization
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }

    // Initialize the map - Center around Southern Ontario
    mapInstance = L.map('logistics-map').setView([43.7, -79.4], 8);

    // Add a tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    // Add markers for each location
    locations.forEach(loc => {
        let iconUrl = loc.type === 'Warehouse' ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png' : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
        let shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png';

        let customIcon = L.icon({
            iconUrl: iconUrl,
            shadowUrl: shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        const marker = L.marker([loc.lat, loc.lng], {icon: customIcon}).addTo(mapInstance);

        // Create popup content
        let popupContent = `<div class="font-semibold text-base mb-2">${loc.name} <span class="text-xs font-normal text-gray-500">(${loc.type})</span></div>`;
        popupContent += '<ul class="space-y-1 text-sm">';
        if (loc.type === 'Warehouse') {
            popupContent += `<li><strong>Capacity:</strong> ${loc.details.capacity}</li>`;
            popupContent += `<li><strong>Inbound Today:</strong> ${loc.details.inbound} shipments</li>`;
            popupContent += `<li><strong>Outbound Today:</strong> ${loc.details.outbound} shipments</li>`;
            popupContent += `<li><strong>Alerts:</strong> <span class="text-yellow-600">${loc.details.issues}</span></li>`;
        } else { // Store
            popupContent += `<li><strong>Inventory Value:</strong> ${loc.details.inventoryValue}</li>`;
            popupContent += `<li><strong>Stock Alerts:</strong> <span class="${loc.details.stockAlerts > 0 ? 'text-red-600 font-semibold' : ''}">${loc.details.stockAlerts}</span></li>`;
            popupContent += `<li><strong>Next Delivery:</strong> ${loc.details.nextDelivery}</li>`;
        }
        popupContent += '</ul>';

        marker.bindPopup(popupContent);
    });

    // Fit map bounds to markers
    const group = L.featureGroup(locations.map(loc => L.marker([loc.lat, loc.lng])));
    mapInstance.fitBounds(group.getBounds().pad(0.1)); // Add padding
}


function addLogisticsEventListeners() {
    document.getElementById('log-adjustment-btn')?.addEventListener('click', showLogAdjustmentModal);

    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const order = e.target.dataset.order;
            if (action === 'compare-rates') {
                showCompareRatesModal(order);
            } else if (action === 'print-slip') {
                showToast(`Packing slip for order ${order} sent to printer.`);
            }
        });
    });
}

function showLogAdjustmentModal() {
    const modalBody = `
        <form id="log-adjustment-form" class="space-y-4">
            <div>
                <label for="adj-sku" class="block text-sm font-medium text-gray-700">SKU or Product Name</label>
                <input type="text" id="adj-sku" name="adj-sku" placeholder="e.g., UH-BOOT-BR-9" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
            </div>
            <div>
                <label for="adj-type" class="block text-sm font-medium text-gray-700">Adjustment Type</label>
                <select id="adj-type" name="adj-type" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option>Damaged Goods</option>
                    <option>Cycle Count</option>
                    <option>Stock Transfer</option>
                    <option>Return to Vendor</option>
                </select>
            </div>
            <div>
                <label for="adj-quantity" class="block text-sm font-medium text-gray-700">Quantity</label>
                <input type="number" id="adj-quantity" name="adj-quantity" placeholder="e.g., -5 or 10" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
            </div>
             <div>
                <label for="adj-notes" class="block text-sm font-medium text-gray-700">Notes</label>
                <textarea id="adj-notes" name="adj-notes" rows="3" class="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
            </div>
             <div class="text-right">
                <button type="submit" class="bg-blue-600 text-white py-2 px-5 rounded-lg hover:bg-blue-700">Submit Adjustment</button>
            </div>
        </form>
    `;
    showModal('Log Inventory Adjustment', modalBody);
    // Add submit handler if needed
    document.getElementById('log-adjustment-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Inventory adjustment logged.');
        hideModal(); // Use imported hideModal
    });
}

function showCompareRatesModal(orderId) {
    const modalBody = `
        <div class="space-y-3">
            <p class="text-sm">Showing best available rates for order <span class="font-semibold">${orderId}</span>.</p>
            <div class="border rounded-lg">
                <div class="p-3 grid grid-cols-3 gap-4 items-center bg-green-50 border-b-2 border-green-200">
                    <span class="font-semibold text-gray-800">Canpar Ground</span>
                    <span class="text-gray-600">1-2 Business Days</span>
                    <span class="text-lg font-bold text-right text-green-700">$15.50</span>
                </div>
                 <div class="p-3 grid grid-cols-3 gap-4 items-center hover:bg-gray-50 border-b">
                    <span class="font-semibold text-gray-800">Purolator Express</span>
                    <span class="text-gray-600">Next Business Day</span>
                    <span class="text-lg font-bold text-right">$22.75</span>
                </div>
                <div class="p-3 grid grid-cols-3 gap-4 items-center hover:bg-gray-50">
                    <span class="font-semibold text-gray-800">Canada Post Priority</span>
                    <span class="text-gray-600">Next Business Day by Noon</span>
                    <span class="text-lg font-bold text-right">$28.90</span>
                </div>
            </div>
             <div class="text-right pt-2">
                 <button id="select-carrier-btn" class="bg-green-600 text-white py-2 px-5 rounded-lg hover:bg-green-700">Select Canpar & Ship</button>
            </div>
        </div>
    `;
    showModal(`Compare Shipping Rates for ${orderId}`, modalBody);
    document.getElementById('select-carrier-btn')?.addEventListener('click', () => {
         showToast(`Order ${orderId} scheduled for shipment via Canpar.`);
         hideModal(); // Use imported hideModal
    });
}

export { render as init };
