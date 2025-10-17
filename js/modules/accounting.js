function render(container) {
    container.innerHTML = `
        <div class="space-y-8">
            <!-- 1. Financial Reporting: Dashboard -->
            <div>
                <h2 class="text-xl font-bold mb-3 text-gray-800">Accounting Dashboard</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-sm text-gray-500">Profit & Loss (YTD)</div>
                        <div class="text-3xl font-bold text-green-600">$480,592</div>
                    </div>
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-sm text-gray-500">Overdue Invoices</div>
                        <div class="text-3xl font-bold text-red-600">$25,310</div>
                    </div>
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-sm text-gray-500">Accounts Payable</div>
                        <div class="text-3xl font-bold text-yellow-600">$88,140</div>
                    </div>
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-sm text-gray-500">Cash Balance</div>
                        <div class="text-3xl font-bold text-blue-600">$1,215,830</div>
                    </div>
                </div>
                <div class="mt-6 bg-white p-4 rounded-lg shadow">
                     <h3 class="font-semibold mb-4">Revenue vs. Expenses</h3>
                     <div class="chart-container" style="height:300px;">
                        <canvas id="revenueChart"></canvas>
                     </div>
                </div>
            </div>

            <!-- 2. Accounts Receivable -->
            <div class="bg-white p-4 rounded-lg shadow">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-semibold">Accounts Receivable</h3>
                    <button class="text-sm bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">New Invoice</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th class="px-4 py-3">Invoice #</th>
                                <th class="px-4 py-3">Customer</th>
                                <th class="px-4 py-3">Date</th>
                                <th class="px-4 py-3">Due Date</th>
                                <th class="px-4 py-3 text-right">Amount</th>
                                <th class="px-4 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-white border-b hover:bg-gray-50">
                                <td class="px-4 py-3 font-medium">INV-2025-015</td>
                                <td class="px-4 py-3">Store 5 (Toronto)</td>
                                <td class="px-4 py-3">10/15/2025</td>
                                <td class="px-4 py-3">11/14/2025</td>
                                <td class="px-4 py-3 text-right">$15,250.00</td>
                                <td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-blue-200 text-blue-800">Sent</span></td>
                            </tr>
                             <tr class="bg-white border-b hover:bg-gray-50">
                                <td class="px-4 py-3 font-medium">INV-2025-014</td>
                                <td class="px-4 py-3">Store 2 (Vancouver)</td>
                                <td class="px-4 py-3">09/28/2025</td>
                                <td class="px-4 py-3">10/28/2025</td>
                                <td class="px-4 py-3 text-right">$8,940.50</td>
                                <td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-green-200 text-green-800">Paid</span></td>
                            </tr>
                            <tr class="bg-white border-b hover:bg-gray-50">
                                <td class="px-4 py-3 font-medium">INV-2025-012</td>
                                <td class="px-4 py-3">Store 8 (Calgary)</td>
                                <td class="px-4 py-3">09/01/2025</td>
                                <td class="px-4 py-3">10/01/2025</td>
                                <td class="px-4 py-3 text-right">$25,310.00</td>
                                <td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-red-200 text-red-800">Overdue</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- 3. Accounts Payable -->
            <div class="bg-white p-4 rounded-lg shadow">
                 <div class="flex justify-between items-center mb-4">
                    <h3 class="font-semibold">Accounts Payable</h3>
                    <button class="text-sm bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">Enter Bill</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th class="px-4 py-3">Vendor</th>
                                <th class="px-4 py-3">Due Date</th>
                                <th class="px-4 py-3 text-right">Amount</th>
                                <th class="px-4 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-white border-b hover:bg-gray-50">
                                <td class="px-4 py-3 font-medium">Vendor A</td>
                                <td class="px-4 py-3">10/25/2025</td>
                                <td class="px-4 py-3 text-right">$45,000.00</td>
                                <td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-yellow-200 text-yellow-800">Scheduled</span></td>
                            </tr>
                             <tr class="bg-white border-b hover:bg-gray-50">
                                <td class="px-4 py-3 font-medium">Vendor B</td>
                                <td class="px-4 py-3">11/05/2025</td>
                                <td class="px-4 py-3 text-right">$32,000.00</td>
                                <td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-800">Open</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- 4. General Ledger & Payroll -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="font-semibold mb-4">Recent Journal Entries</h3>
                     <div class="overflow-y-auto h-48">
                         <div class="p-3 border-b">
                            <div class="flex justify-between text-xs"><span>10/15/2025</span><span>JE-00542</span></div>
                            <p class="text-sm">Debit: Accounts Receivable, Credit: Sales Revenue</p>
                        </div>
                         <div class="p-3 border-b">
                            <div class="flex justify-between text-xs"><span>10/14/2025</span><span>JE-00541</span></div>
                            <p class="text-sm">Debit: Rent Expense, Credit: Cash</p>
                        </div>
                    </div>
                </div>
                 <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="font-semibold mb-4">Payroll</h3>
                    <div class="text-center py-8">
                        <p class="text-gray-500">Next Payroll Run:</p>
                        <p class="text-2xl font-bold">10/31/2025</p>
                        <button class="mt-4 text-sm bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600">Run Payroll</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize Chart.js
    const ctx = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['May', 'June', 'July', 'Aug', 'Sep', 'Oct'],
            datasets: [
                {
                    label: 'Revenue',
                    data: [180000, 210000, 250000, 230000, 280000, 310000],
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: [120000, 130000, 145000, 140000, 160000, 170000],
                    backgroundColor: 'rgba(239, 68, 68, 0.5)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value / 1000 + 'K';
                        }
                    }
                }
            }
        }
    });
}

export { render as init };

