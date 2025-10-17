import { showModal } from '../utils.js';

function render(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Logistics Module Navigation -->
            <div class="bg-white rounded-lg shadow-sm">
                <div class="border-b border-gray-200">
                    <nav id="logistics-tabs" class="-mb-px flex space-x-6 px-4" aria-label="Tabs">
                        <button data-tab="dashboard" class="logistics-tab active-tab whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm">Dashboard</button>
                        <button data-tab="inventory" class="logistics-tab inactive-tab whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm">Inventory</button>
                        <button data-tab="orders" class="logistics-tab inactive-tab whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm">Orders & Returns</button>
                        <button data-tab="shipments" class="logistics-tab inactive-tab whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm">Transportation</button>
                    </nav>
                </div>
            </div>

            <!-- Tab Content -->
            <div id="logistics-dashboard-content" class="logistics-tab-content space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="p-4 bg-white rounded-lg shadow"><div class="text-sm text-gray-500">On-Time Shipping</div><div class="text-3xl font-bold text-green-600">98.2%</div></div>
                    <div class="p-4 bg-white rounded-lg shadow"><div class="text-sm text-gray-500">Inventory Turnover</div><div class="text-3xl font-bold text-blue-600">4.7</div></div>
                    <div class="p-4 bg-white rounded-lg shadow"><div class="text-sm text-gray-500">Orders Processed Today</div><div class="text-3xl font-bold text-gray-800">1,204</div></div>
                    <div class="p-4 bg-white rounded-lg shadow"><div class="text-sm text-gray-500">Warehouse Capacity</div><div class="text-3xl font-bold text-yellow-600">78%</div></div>
                </div>
                 <div class="bg-white p-4 rounded-lg shadow">
                     <h3 class="font-semibold mb-4">Live Shipment Tracking (Demo)</h3>
                     <p class="text-sm text-gray-600">This map would show the real-time GPS locations of all active shipments.</p>
                     <div class="mt-4 rounded-lg bg-gray-200 h-64 flex items-center justify-center">
                        <span class="text-gray-500">Map Placeholder</span>
                     </div>
                </div>
            </div>

            <div id="logistics-inventory-content" class="logistics-tab-content hidden">
                 <div class="bg-white p-4 rounded-lg shadow">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-semibold">Warehouse Inventory</h3>
                        <div>
                            <input type="text" placeholder="Search SKU..." class="text-sm px-3 py-2 border rounded-lg">
                            <button id="new-item-btn" class="ml-2 text-sm bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">New Item</button>
                            <button id="cycle-count-btn" class="ml-2 text-sm bg-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300">Start Cycle Count</button>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left"><thead class="text-xs text-gray-700 uppercase bg-gray-50"><tr><th class="px-4 py-3">SKU</th><th class="px-4 py-3">Product</th><th class="px-4 py-3">Location</th><th class="px-4 py-3">Lot #</th><th class="px-4 py-3 text-right">Quantity</th><th class="px-4 py-3 text-center">Status</th><th class="px-4 py-3">Actions</th></tr></thead>
                        <tbody>
                            <tr class="bg-white border-b hover:bg-gray-50"><td class="px-4 py-3 font-medium">UH-BOOT-BR-9</td><td class="px-4 py-3">Urban Hiker Boot, Brown, Size 9</td><td class="px-4 py-3">A12-4C</td><td class="px-4 py-3">L202510A</td><td class="px-4 py-3 text-right">150</td><td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-green-200 text-green-800">Available</span></td><td class="px-4 py-3"><button class="text-xs text-blue-600 hover:underline action-btn" data-action="adjust" data-sku="UH-BOOT-BR-9">Adjust</button></td></tr>
                            <tr class="bg-white border-b hover:bg-gray-50"><td class="px-4 py-3 font-medium">CS-SLIP-BK-7</td><td class="px-4 py-3">Canvas Slip-On, Black, Size 7</td><td class="px-4 py-3">A4-2A</td><td class="px-4 py-3">L202510B</td><td class="px-4 py-3 text-right">8</td><td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-yellow-200 text-yellow-800">Low Stock</span></td><td class="px-4 py-3"><button class="text-xs text-blue-600 hover:underline action-btn" data-action="adjust" data-sku="CS-SLIP-BK-7">Adjust</button></td></tr>
                            <tr class="bg-white border-b hover:bg-gray-50"><td class="px-4 py-3 font-medium">RS-SNEAK-WH-10</td><td class="px-4 py-3">Running Sneaker, White, Size 10</td><td class="px-4 py-3">A8-1D</td><td class="px-4 py-3">L202510C</td><td class="px-4 py-3 text-right">200</td><td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-green-200 text-green-800">Available</span></td><td class="px-4 py-3"><button class="text-xs text-blue-600 hover:underline action-btn" data-action="adjust" data-sku="RS-SNEAK-WH-10">Adjust</button></td></tr>
                            <tr class="bg-white border-b hover:bg-gray-50"><td class="px-4 py-3 font-medium">SS-SAND-TAN-8</td><td class="px-4 py-3">Summer Sandal, Tan, Size 8</td><td class="px-4 py-3">Cross-Dock 2</td><td class="px-4 py-3">L202510D</td><td class="px-4 py-3 text-right">35</td><td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-purple-200 text-purple-800">Cross-Docking</span></td><td class="px-4 py-3"><button class="text-xs text-blue-600 hover:underline action-btn" data-action="adjust" data-sku="SS-SAND-TAN-8">Adjust</button></td></tr>
                            <tr class="bg-white border-b hover:bg-gray-50"><td class="px-4 py-3 font-medium">CL-LOAF-BLK-9</td><td class="px-4 py-3">Classic Loafer, Black, Size 9</td><td class="px-4 py-3">A1-1A</td><td class="px-4 py-3">L202509E</td><td class="px-4 py-3 text-right">0</td><td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-red-200 text-red-800">Out of Stock</span></td><td class="px-4 py-3"><button class="text-xs text-blue-600 hover:underline action-btn" data-action="adjust" data-sku="CL-LOAF-BLK-9">Adjust</button></td></tr>
                        </tbody></table>
                    </div>
                </div>
            </div>

            <div id="logistics-orders-content" class="logistics-tab-content hidden">
                 <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="bg-white p-4 rounded-lg shadow">
                        <div class="flex justify-between items-center mb-4"><h3 class="font-semibold">Picking & Packing Queue</h3><button id="batch-pick-btn" class="text-sm bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Create Batch Pick</button></div>
                        <div class="overflow-y-auto h-64">
                            <div class="p-3 border-b hover:bg-gray-50"><div class="flex justify-between"><span class="font-medium">Order #89341</span><span class="text-xs text-gray-500">Pick Route: A12 -> A4</span></div><p class="text-xs text-gray-600">3 items for Store 5 (Toronto)</p></div>
                            <div class="p-3 border-b hover:bg-gray-50"><div class="flex justify-between"><span class="font-medium">Order #89342</span><span class="text-xs text-gray-500">Pick Route: B2 -> C5</span></div><p class="text-xs text-gray-600">5 items for Store 2 (Vancouver)</p></div>
                            <div class="p-3 border-b hover:bg-gray-50"><div class="flex justify-between"><span class="font-medium">Order #89343</span><span class="text-xs text-gray-500">Pick Route: A8 -> A12</span></div><p class="text-xs text-gray-600">2 items for Store 8 (Calgary)</p></div>
                            <div class="p-3 border-b hover:bg-gray-50"><div class="flex justify-between"><span class="font-medium">Order #89344</span><span class="text-xs text-gray-500">Pick Route: CD2 -> Ship</span></div><p class="text-xs text-gray-600">1 item for Store 5 (Toronto)</p></div>
                        </div>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow">
                         <div class="flex justify-between items-center mb-4"><h3 class="font-semibold">Customer Returns</h3><button id="log-return-btn" class="text-sm bg-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300">Log Return</button></div>
                         <div class="overflow-y-auto h-64">
                            <div class="p-3 border-b hover:bg-gray-50"><div class="flex justify-between"><span class="font-medium">RMA-0122</span><span class="text-xs text-gray-500">Status: Pending Inspection</span></div><p class="text-xs text-gray-600">Classic Leather Loafer, Size 8</p></div>
                            <div class="p-3 border-b hover:bg-gray-50"><div class="flex justify-between"><span class="font-medium">RMA-0123</span><span class="text-xs text-gray-500">Status: Restock</span></div><p class="text-xs text-gray-600">Urban Hiker Boot, Brown, Size 10</p></div>
                            <div class="p-3 border-b hover:bg-gray-50"><div class="flex justify-between"><span class="font-medium">RMA-0124</span><span class="text-xs text-gray-500">Status: Pending Inspection</span></div><p class="text-xs text-gray-600">Running Sneaker, White, Size 9</p></div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="logistics-shipments-content" class="logistics-tab-content hidden">
                <div class="bg-white p-4 rounded-lg shadow">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-semibold">Transportation Management</h3>
                         <button id="schedule-pickup-btn" class="text-sm bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Schedule Pickup</button>
                    </div>
                     <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left"><thead class="text-xs text-gray-700 uppercase bg-gray-50"><tr><th class="px-4 py-3">Shipment #</th><th class="px-4 py-3">Destination</th><th class="px-4 py-3">Carrier</th><th class="px-4 py-3">Tracking #</th><th class="px-4 py-3 text-center">Status</th><th class="px-4 py-3">Actions</th></tr></thead>
                        <tbody>
                           <tr class="bg-white border-b hover:bg-gray-50"><td class="px-4 py-3 font-medium">SHP-45521</td><td class="px-4 py-3">Store 8 (Calgary)</td><td class="px-4 py-3">FedEx</td><td class="px-4 py-3">785...</td><td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-blue-200 text-blue-800">In Transit</span></td><td class="px-4 py-3"><button class="text-xs text-blue-600 hover:underline">Track</button></td></tr>
                            <tr class="bg-white border-b hover:bg-gray-50"><td class="px-4 py-3 font-medium">SHP-45520</td><td class="px-4 py-3">Store 1 (Halifax)</td><td class="px-4 py-3">UPS</td><td class="px-4 py-3">1Z9...</td><td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-green-200 text-green-800">Delivered</span></td><td class="px-4 py-3"><button class="text-xs text-blue-600 hover:underline">Proof of Delivery</button></td></tr>
                            <tr class="bg-white border-b hover:bg-gray-50"><td class="px-4 py-3 font-medium">SHP-45522</td><td class="px-4 py-3">Store 3 (Montreal)</td><td class="px-4 py-3">Purolator</td><td class="px-4 py-3">PUR...</td><td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-yellow-200 text-yellow-800">Scheduled</span></td><td class="px-4 py-3"><button class="text-xs text-blue-600 hover:underline">View BOL</button></td></tr>
                        </tbody></table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    addEventListeners();
}

function addEventListeners() {
    addTabEventListeners();
    addActionModalListeners();
}


function addTabEventListeners() {
    const tabs = document.querySelectorAll('.logistics-tab');
    const tabContents = document.querySelectorAll('.logistics-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.replace('active-tab', 'inactive-tab'));
            tab.classList.replace('inactive-tab', 'active-tab');
            tabContents.forEach(content => content.classList.add('hidden'));
            const contentToShow = document.getElementById(`logistics-${tab.dataset.tab}-content`);
            if (contentToShow) contentToShow.classList.remove('hidden');
        });
    });
}

function addActionModalListeners() {
    document.getElementById('new-item-btn')?.addEventListener('click', () => {
        showModal('Add New Inventory Item', `
            <div class="space-y-4 text-sm">
                <div><label class="block">SKU</label><input type="text" class="w-full p-2 border rounded"></div>
                <div><label class="block">Product Name</label><input type="text" class="w-full p-2 border rounded"></div>
                <div><label class="block">Initial Quantity</label><input type="number" class="w-full p-2 border rounded"></div>
                <button class="w-full bg-blue-500 text-white py-2 rounded">Save Item</button>
            </div>
        `);
    });

    document.getElementById('cycle-count-btn')?.addEventListener('click', () => {
        showModal('Start Cycle Count', `
            <div class="space-y-4 text-sm">
                <p>Select a warehouse zone to begin a cycle count.</p>
                <div><label class="block">Zone</label><select class="w-full p-2 border rounded"><option>Aisle A</option><option>Aisle B</option><option>Aisle C</option></select></div>
                <button class="w-full bg-blue-500 text-white py-2 rounded">Start Count</button>
            </div>
        `);
    });

    document.getElementById('log-return-btn')?.addEventListener('click', () => {
        showModal('Log Customer Return', `
             <div class="space-y-4 text-sm">
                <div><label class="block">RMA Number</label><input type="text" class="w-full p-2 border rounded" value="RMA-0125"></div>
                <div><label class="block">Original Order #</label><input type="text" class="w-full p-2 border rounded"></div>
                 <div><label class="block">Reason for Return</label><select class="w-full p-2 border rounded"><option>Wrong Size</option><option>Damaged</option><option>Not as Described</option></select></div>
                <button class="w-full bg-blue-500 text-white py-2 rounded">Log Return</button>
            </div>
        `);
    });
    
    document.getElementById('schedule-pickup-btn')?.addEventListener('click', () => {
        showModal('Schedule Carrier Pickup', `
             <div class="space-y-4 text-sm">
                <div><label class="block">Select Carrier</label><select class="w-full p-2 border rounded"><option>FedEx</option><option>UPS</option><option>Purolator</option></select></div>
                <div><label class="block">Pickup Date</label><input type="date" class="w-full p-2 border rounded"></div>
                 <div><label class="block">Number of Pallets</label><input type="number" class="w-full p-2 border rounded" value="3"></div>
                <button class="w-full bg-blue-500 text-white py-2 rounded">Schedule</button>
            </div>
        `);
    });

    // Listener for all "Adjust" buttons
    document.querySelector('#logistics-inventory-content')?.addEventListener('click', (e) => {
        if (e.target && e.target.matches('button.action-btn[data-action="adjust"]')) {
            const sku = e.target.dataset.sku;
            showModal(`Adjust Inventory for ${sku}`, `
                <div class="space-y-4 text-sm">
                    <div><label class="block">SKU</label><input type="text" class="w-full p-2 border rounded bg-gray-100" value="${sku}" readonly></div>
                    <div><label class="block">New Quantity</label><input type="number" class="w-full p-2 border rounded"></div>
                    <div><label class="block">Reason</label><select class="w-full p-2 border rounded"><option>Cycle Count</option><option>Damaged Goods</option><option>Receiving Error</option></select></div>
                    <button class="w-full bg-blue-500 text-white py-2 rounded">Submit Adjustment</button>
                </div>
            `);
        }
    });
}

// Add CSS for tab styling in a more robust way if not already in style.css
// This avoids needing to edit another file.
const style = document.createElement('style');
style.textContent = `
    .active-tab {
        border-color: #3b82f6; /* blue-500 */
        color: #3b82f6;
    }
    .inactive-tab {
        border-color: transparent;
        color: #6b7280; /* gray-500 */
    }
    .inactive-tab:hover {
        border-color: #d1d5db; /* gray-300 */
        color: #4b5563; /* gray-600 */
    }
`;
document.head.append(style);


export { render as init };

