import { showModal, showToast } from '../utils.js';

function render(container) {
    container.innerHTML = `
        <div class="space-y-8">
            <!-- 1. HR Dashboard KPIs -->
            <div>
                <h2 class="text-xl font-bold mb-3 text-gray-800">HR Dashboard</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-sm text-gray-500">Active Headcount</div>
                        <div class="text-3xl font-bold text-blue-600">12</div>
                    </div>
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-sm text-gray-500">Labor Cost %</div>
                        <div class="text-3xl font-bold text-green-600">14.2%</div>
                    </div>
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-sm text-gray-500">Turnover Rate (YTD)</div>
                        <div class="text-3xl font-bold text-yellow-600">8.5%</div>
                    </div>
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-sm text-gray-500">Open Positions</div>
                        <div class="text-3xl font-bold text-red-600">1</div>
                    </div>
                </div>
            </div>

            <!-- 2. Employee Directory -->
            <div class="bg-white p-4 rounded-lg shadow">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-semibold">Employee Directory</h3>
                    <button id="add-employee-btn" class="text-sm bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Add New Employee</button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <!-- Sample Employee Cards -->
                    <div class="flex items-center space-x-3 p-3 border rounded-lg">
                        <img class="w-12 h-12 rounded-full" src="https://placehold.co/100x100/d1d5db/4b5563?text=JD" alt="Jane Doe">
                        <div>
                            <p class="font-medium text-sm">Jane Doe</p>
                            <p class="text-xs text-gray-500">Store Manager</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3 p-3 border rounded-lg">
                        <img class="w-12 h-12 rounded-full" src="https://placehold.co/100x100/d1d5db/4b5563?text=JS" alt="John Smith">
                        <div>
                            <p class="font-medium text-sm">John Smith</p>
                            <p class="text-xs text-gray-500">Assistant Manager</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3 p-3 border rounded-lg">
                        <img class="w-12 h-12 rounded-full" src="https://placehold.co/100x100/d1d5db/4b5563?text=AB" alt="Alice Brown">
                        <div>
                            <p class="font-medium text-sm">Alice Brown</p>
                            <p class="text-xs text-gray-500">Sales Associate</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3 p-3 border rounded-lg">
                        <img class="w-12 h-12 rounded-full" src="https://placehold.co/100x100/d1d5db/4b5563?text=CW" alt="Chris White">
                        <div>
                            <p class="font-medium text-sm">Chris White</p>
                            <p class="text-xs text-gray-500">Sales Associate</p>
                        </div>
                    </div>
                     <div class="flex items-center space-x-3 p-3 border rounded-lg">
                        <img class="w-12 h-12 rounded-full" src="https://placehold.co/100x100/d1d5db/4b5563?text=EG" alt="Emily Green">
                        <div>
                            <p class="font-medium text-sm">Emily Green</p>
                            <p class="text-xs text-gray-500">Sales Associate</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. Weekly Schedule -->
            <div class="bg-white p-4 rounded-lg shadow">
                <div class="flex justify-between items-center mb-4">
                     <h3 class="font-semibold">Weekly Schedule: Oct 13 - Oct 19</h3>
                     <div>
                        <button id="time-off-requests-btn" class="text-sm bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">Time Off Requests (2)</button>
                        <button id="publish-schedule-btn" class="text-sm bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Request Schedule Approval</button>
                     </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left border-collapse">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 border">Employee</th>
                                <th class="px-4 py-3 border text-center">Mon, Oct 13</th>
                                <th class="px-4 py-3 border text-center">Tue, Oct 14</th>
                                <th class="px-4 py-3 border text-center">Wed, Oct 15</th>
                                <th class="px-4 py-3 border text-center">Thu, Oct 16</th>
                                <th class="px-4 py-3 border text-center">Fri, Oct 17</th>
                                <th class="px-4 py-3 border text-center">Sat, Oct 18</th>
                                <th class="px-4 py-3 border text-center">Sun, Oct 19</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-white border-b">
                                <td class="px-4 py-3 border font-medium">Jane Doe</td>
                                <td class="px-4 py-3 border"><div class="bg-purple-200 text-purple-800 text-xs text-center rounded p-1">9am - 5pm</div></td>
                                <td class="px-4 py-3 border"><div class="bg-purple-200 text-purple-800 text-xs text-center rounded p-1">9am - 5pm</div></td>
                                <td class="px-4 py-3 border"><div class="bg-purple-200 text-purple-800 text-xs text-center rounded p-1">9am - 5pm</div></td>
                                <td class="px-4 py-3 border"><div class="bg-purple-200 text-purple-800 text-xs text-center rounded p-1">9am - 5pm</div></td>
                                <td class="px-4 py-3 border"><div class="bg-purple-200 text-purple-800 text-xs text-center rounded p-1">9am - 5pm</div></td>
                                <td class="px-4 py-3 border"></td>
                                <td class="px-4 py-3 border"></td>
                            </tr>
                            <tr class="bg-white border-b">
                                <td class="px-4 py-3 border font-medium">John Smith</td>
                                <td class="px-4 py-3 border"><div class="bg-blue-200 text-blue-800 text-xs text-center rounded p-1">12pm - 8pm</div></td>
                                <td class="px-4 py-3 border"><div class="bg-blue-200 text-blue-800 text-xs text-center rounded p-1">12pm - 8pm</div></td>
                                <td class="px-4 py-3 border"></td>
                                <td class="px-4 py-3 border"></td>
                                <td class="px-4 py-3 border"><div class="bg-blue-200 text-blue-800 text-xs text-center rounded p-1">12pm - 8pm</div></td>
                                <td class="px-4 py-3 border"><div class="bg-blue-200 text-blue-800 text-xs text-center rounded p-1">12pm - 8pm</div></td>
                                <td class="px-4 py-3 border"><div class="bg-blue-200 text-blue-800 text-xs text-center rounded p-1">12pm - 8pm</div></td>
                            </tr>
                             <tr class="bg-white border-b">
                                <td class="px-4 py-3 border font-medium">Alice Brown</td>
                                <td class="px-4 py-3 border"><div class="bg-green-200 text-green-800 text-xs text-center rounded p-1">10am - 6pm</div></td>
                                <td class="px-4 py-3 border"><div class="bg-green-200 text-green-800 text-xs text-center rounded p-1">10am - 6pm</div></td>
                                <td class="px-4 py-3 border"><div class="bg-green-200 text-green-800 text-xs text-center rounded p-1">10am - 6pm</div></td>
                                <td class="px-4 py-3 border"></td>
                                <td class="px-4 py-3 border"></td>
                                <td class="px-4 py-3 border"><div class="bg-green-200 text-green-800 text-xs text-center rounded p-1">11am - 7pm</div></td>
                                <td class="px-4 py-3 border"><div class="bg-green-200 text-green-800 text-xs text-center rounded p-1">11am - 7pm</div></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- 4. Performance & Payroll -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="font-semibold mb-4">Upcoming Performance Reviews</h3>
                     <ul class="space-y-3">
                        <li class="flex justify-between items-center p-2 rounded-md hover:bg-gray-50">
                            <p class="text-sm font-medium">Chris White</p>
                            <span class="text-xs text-gray-500">Due: Oct 25, 2025</span>
                        </li>
                         <li class="flex justify-between items-center p-2 rounded-md hover:bg-gray-50">
                            <p class="text-sm font-medium">Emily Green</p>
                            <span class="text-xs text-gray-500">Due: Nov 10, 2025</span>
                        </li>
                    </ul>
                </div>
                 <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="font-semibold mb-4">Payroll</h3>
                    <div class="text-center py-4">
                        <p class="text-gray-500">Next Payroll Run:</p>
                        <p class="text-2xl font-bold">Oct 31, 2025</p>
                        <button class="mt-4 text-sm bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300">View Payroll Details</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    addHrEventListeners();
}

function addHrEventListeners() {
    document.getElementById('add-employee-btn')?.addEventListener('click', showAddEmployeeModal);
    document.getElementById('time-off-requests-btn')?.addEventListener('click', showTimeOffRequestsModal);
    document.getElementById('publish-schedule-btn')?.addEventListener('click', () => {
        showToast('Schedule sent to regional manager for approval.');
    });
}

function showAddEmployeeModal() {
    const modalBody = `
        <form id="add-employee-form" class="space-y-4">
            <div>
                <label for="employee-name" class="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" id="employee-name" name="employee-name" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
            </div>
            <div>
                <label for="employee-position" class="block text-sm font-medium text-gray-700">Position</label>
                <select id="employee-position" name="employee-position" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option>Sales Associate</option>
                    <option>Assistant Manager</option>
                    <option>Stocker</option>
                </select>
            </div>
            <div>
                <label for="employee-rate" class="block text-sm font-medium text-gray-700">Pay Rate ($/hr)</label>
                <input type="number" id="employee-rate" name="employee-rate" placeholder="18.50" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
            </div>
             <div class="text-right">
                <button type="submit" class="bg-blue-600 text-white py-2 px-5 rounded-lg hover:bg-blue-700">Add Employee</button>
            </div>
        </form>
    `;
    showModal('Add New Employee', modalBody);
}

function showTimeOffRequestsModal() {
    const modalBody = `
        <div class="space-y-3">
            <div class="p-3 border rounded-lg">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-semibold">Chris White</p>
                        <p class="text-sm text-gray-600">Request: Unpaid Leave</p>
                        <p class="text-xs text-gray-500">Dates: Nov 5 - Nov 7, 2025</p>
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-xs bg-green-100 text-green-800 py-1 px-3 rounded-full hover:bg-green-200">Approve</button>
                        <button class="text-xs bg-red-100 text-red-800 py-1 px-3 rounded-full hover:bg-red-200">Deny</button>
                    </div>
                </div>
            </div>
             <div class="p-3 border rounded-lg">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-semibold">Alice Brown</p>
                        <p class="text-sm text-gray-600">Request: Sick Day</p>
                        <p class="text-xs text-gray-500">Date: Oct 20, 2025</p>
                    </div>
                     <div class="flex space-x-2">
                        <button class="text-xs bg-green-100 text-green-800 py-1 px-3 rounded-full hover:bg-green-200">Approve</button>
                        <button class="text-xs bg-red-100 text-red-800 py-1 px-3 rounded-full hover:bg-red-200">Deny</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    showModal('Pending Time Off Requests', modalBody);
}

export { render as init };
