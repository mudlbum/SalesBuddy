import { showModal } from '../utils.js';

function render(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Daily Tasks Checklist -->
            <div>
                <h2 class="text-xl font-bold mb-2">Store Operations</h2>
                <div class="bg-white p-4 rounded-lg shadow">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-semibold">Daily Tasks Checklist</h3>
                        <span class="text-sm font-medium text-gray-500">75% Complete</span>
                    </div>
                     <div class="w-full bg-gray-200 rounded-full h-2.5 mb-4"><div class="bg-green-600 h-2.5 rounded-full" style="width: 75%"></div></div>
                    <ul class="space-y-3">
                        <li class="flex items-center">
                            <input id="task1" type="checkbox" checked class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                            <label for="task1" class="ml-3 block text-sm font-medium text-gray-700 line-through">Morning cash count and float verification</label>
                        </li>
                        <li class="flex items-center">
                            <input id="task2" type="checkbox" checked class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                            <label for="task2" class="ml-3 block text-sm font-medium text-gray-700 line-through">Check and respond to overnight emails</label>
                        </li>
                         <li class="flex items-center">
                            <input id="task3" type="checkbox" checked class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                            <label for="task3" class="ml-3 block text-sm font-medium text-gray-700 line-through">Storefront cleanliness check</label>
                        </li>
                        <li class="flex items-center">
                            <input id="task4" type="checkbox" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                            <label for="task4" class="ml-3 block text-sm font-medium text-gray-700">End of day sales report</label>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Maintenance Log -->
            <div>
                 <div class="bg-white p-4 rounded-lg shadow">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-semibold">Maintenance Log</h3>
                        <button id="report-issue-btn" class="text-sm bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Report New Issue</button>
                    </div>
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th class="px-4 py-3">Ticket ID</th>
                                <th class="px-4 py-3">Issue</th>
                                <th class="px-4 py-3">Date Reported</th>
                                <th class="px-4 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                             <tr class="bg-white border-b">
                                <td class="px-4 py-4 font-medium">#7852</td>
                                <td class="px-4 py-4">Stockroom light flickering</td>
                                <td class="px-4 py-4">Oct 15, 2025</td>
                                <td class="px-4 py-4 text-center">
                                    <span class="px-2 py-1 font-semibold text-xs rounded-full bg-green-200 text-green-800">Completed</span>
                                </td>
                            </tr>
                             <tr class="bg-white border-b">
                                <td class="px-4 py-4 font-medium">#7853</td>
                                <td class="px-4 py-4">Loose floor tile near entrance</td>
                                <td class="px-4 py-4">Oct 16, 2025</td>
                                <td class="px-4 py-4 text-center">
                                    <span class="px-2 py-1 font-semibold text-xs rounded-full bg-yellow-200 text-yellow-800">In Progress</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    addOperationsEventListeners();
}

function addOperationsEventListeners() {
    document.getElementById('report-issue-btn')?.addEventListener('click', showReportIssueModal);
}

function showReportIssueModal() {
    const modalBody = `
        <form id="report-issue-form" class="space-y-4">
            <div>
                <label for="issue-title" class="block text-sm font-medium text-gray-700">Issue Title</label>
                <input type="text" id="issue-title" name="issue-title" placeholder="e.g., POS terminal 2 not responding" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
            </div>
            <div>
                <label for="issue-location" class="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" id="issue-location" name="issue-location" placeholder="e.g., Front cash desk" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
            </div>
             <div>
                <label for="issue-urgency" class="block text-sm font-medium text-gray-700">Urgency</label>
                <select id="issue-urgency" name="issue-urgency" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                </select>
            </div>
            <div>
                <label for="issue-description" class="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="issue-description" name="issue-description" rows="4" class="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
            </div>
             <div class="text-right">
                <button type="submit" class="bg-blue-600 text-white py-2 px-5 rounded-lg hover:bg-blue-700">Submit Ticket</button>
            </div>
        </form>
    `;
    showModal('Report Maintenance Issue', modalBody);
}

export { render as init };
