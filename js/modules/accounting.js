/**
 * Renders the Accounting module with enhanced features for a realistic demo.
 */
function render(container) {
    container.innerHTML = `
        <div class="space-y-8">
            <!-- 1. Financial KPI Dashboard -->
            <div>
                <h2 class="text-xl font-bold mb-3 text-gray-800">Accounting Dashboard</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-sm text-gray-500">Gross Profit (YTD)</div>
                        <div class="text-3xl font-bold text-green-600">$480,592</div>
                        <div class="text-xs text-green-500 flex items-center mt-1">+5.2% vs last year</div>
                    </div>
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-sm text-gray-500">Overdue Invoices</div>
                        <div class="text-3xl font-bold text-red-600">$25,310</div>
                         <div class="text-xs text-gray-400 mt-1">3 invoices overdue</div>
                    </div>
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-sm text-gray-500">Operating Expenses</div>
                        <div class="text-3xl font-bold text-yellow-600">$88,140</div>
                        <div class="text-xs text-red-500 flex items-center mt-1">+2.1% vs last month</div>
                    </div>
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-sm text-gray-500">Cash Flow</div>
                        <div class="text-3xl font-bold text-blue-600">$52,180</div>
                        <div class="text-xs text-green-500 flex items-center mt-1">Positive trend</div>
                    </div>
                </div>
                <div class="mt-6 bg-white p-4 rounded-lg shadow">
                     <h3 class="font-semibold mb-4">Financial Performance (6 Months)</h3>
                     <div class="h-[300px]">
                        <canvas id="financialChart"></canvas>
                     </div>
                </div>
            </div>

            <!-- 2. Accounts Receivable -->
            <div class="bg-white p-4 rounded-lg shadow">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h3 class="font-semibold">Accounts Receivable</h3>
                        <p class="text-xs text-gray-500">Aging Summary: 0-30: $15,250 | 31-60: $0 | 60+: $25,310</p>
                    </div>
                    <button class="text-sm bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Create New Invoice</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th class="px-4 py-3">Invoice #</th>
                                <th class="px-4 py-3">Customer</th>
                                <th class="px-4 py-3">Due Date</th>
                                <th class="px-4 py-3 text-right">Amount</th>
                                <th class="px-4 py-3 text-center">Status</th>
                                <th class="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-white border-b hover:bg-gray-50">
                                <td class="px-4 py-3 font-medium">INV-2025-015</td>
                                <td class="px-4 py-3">Store 5 (Toronto)</td>
                                <td class="px-4 py-3">11/14/2025</td>
                                <td class="px-4 py-3 text-right">$15,250.00</td>
                                <td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-blue-200 text-blue-800">Sent</span></td>
                                <td class="px-4 py-3 text-center"><button class="text-xs text-blue-600 hover:underline">Send Reminder</button></td>
                            </tr>
                             <tr class="bg-white border-b hover:bg-gray-50">
                                <td class="px-4 py-3 font-medium">INV-2025-014</td>
                                <td class="px-4 py-3">Store 2 (Vancouver)</td>
                                <td class="px-4 py-3">10/28/2025</td>
                                <td class="px-4 py-3 text-right">$8,940.50</td>
                                <td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-green-200 text-green-800">Paid</span></td>
                                 <td class="px-4 py-3 text-center"><button class="text-xs text-gray-500">View</button></td>
                            </tr>
                            <tr class="bg-red-50 border-b hover:bg-red-100">
                                <td class="px-4 py-3 font-medium">INV-2025-012</td>
                                <td class="px-4 py-3">Store 8 (Calgary)</td>
                                <td class="px-4 py-3">10/01/2025</td>
                                <td class="px-4 py-3 text-right">$25,310.00</td>
                                <td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs rounded-full bg-red-200 text-red-800">17 Days Overdue</span></td>
                                <td class="px-4 py-3 text-center"><button class="text-xs text-red-600 hover:underline font-semibold">Start Collection</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- 3. Expense Reports & Payroll -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div class="bg-white p-4 rounded-lg shadow">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-semibold">Expense Reports</h3>
                        <button class="text-sm bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">Submit Expense</button>
                    </div>
                    <div class="space-y-3">
                        <div class="p-3 border rounded-lg hover:bg-gray-50">
                            <div class="flex justify-between text-xs"><span>Jane D. - Travel</span><span class="font-medium">$450.00</span></div>
                            <p class="text-sm">Status: <span class="text-green-600 font-semibold">Approved</span></p>
                        </div>
                         <div class="p-3 border rounded-lg hover:bg-gray-50">
                            <div class="flex justify-between text-xs"><span>John S. - Office Supplies</span><span class="font-medium">$85.50</span></div>
                            <p class="text-sm">Status: <span class="text-yellow-600 font-semibold">Pending Approval</span></p>
                        </div>
                    </div>
                </div>
                 <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="font-semibold mb-4">Payroll</h3>
                    <div class="text-center py-4">
                        <p class="text-gray-500">Next Payroll Run:</p>
                        <p class="text-3xl font-bold">October 31, 2025</p>
                        <p class="text-gray-500 mt-1">Total Estimated Payroll: ~$12,500.00</p>
                        <button class="mt-4 text-sm bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600">Review & Approve</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize Chart.js with a combo bar/line chart
    const ctx = document.getElementById('financialChart').getContext('2d');
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
                },
                {
                    label: 'Profit Margin',
                    data: [33.3, 38.1, 42.0, 39.1, 42.9, 45.2],
                    type: 'line',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    yAxisID: 'y1',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: { callback: value => '$' + value / 1000 + 'K' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { callback: value => value + '%' }
                }
            }
        }
    });
}

export { render as init };
