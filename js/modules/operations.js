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
                        <button class="text-sm bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Report New Issue</button>
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
}

export { render as init };
