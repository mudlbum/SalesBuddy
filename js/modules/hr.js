function render(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Team Overview -->
            <div>
                <h2 class="text-xl font-bold mb-2">Team & Scheduling</h2>
                 <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-gray-500">Total Staff</div>
                        <div class="text-2xl font-bold">8</div>
                    </div>
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-gray-500">Scheduled Hours (This Week)</div>
                        <div class="text-2xl font-bold">280</div>
                    </div>
                    <div class="p-4 bg-white rounded-lg shadow">
                        <div class="text-gray-500">Estimated Labor Cost</div>
                        <div class="text-2xl font-bold">$5,600.00</div>
                    </div>
                </div>
            </div>

            <!-- Weekly Schedule -->
            <div>
                <div class="bg-white p-4 rounded-lg shadow">
                    <div class="flex justify-between items-center mb-4">
                         <h3 class="font-semibold">Weekly Schedule: Oct 13 - Oct 19</h3>
                         <div>
                            <button class="text-sm bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">View Time Off Requests</button>
                            <button class="text-sm bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Publish Schedule</button>
                         </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left border-collapse">
                            <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 border">Employee</th>
                                    <th class="px-4 py-3 border text-center">Monday</th>
                                    <th class="px-4 py-3 border text-center">Tuesday</th>
                                    <th class="px-4 py-3 border text-center">Wednesday</th>
                                    <th class="px-4 py-3 border text-center">Thursday</th>
                                    <th class="px-4 py-3 border text-center">Friday</th>
                                    <th class="px-4 py-3 border text-center">Saturday</th>
                                    <th class="px-4 py-3 border text-center">Sunday</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="bg-white border-b">
                                    <td class="px-4 py-3 border font-medium">Jane Doe</td>
                                    <td class="px-4 py-3 border"><div class="bg-blue-200 text-blue-800 text-xs text-center rounded p-1">9am - 5pm</div></td>
                                    <td class="px-4 py-3 border"><div class="bg-blue-200 text-blue-800 text-xs text-center rounded p-1">9am - 5pm</div></td>
                                    <td class="px-4 py-3 border"><div class="bg-blue-200 text-blue-800 text-xs text-center rounded p-1">9am - 5pm</div></td>
                                    <td class="px-4 py-3 border"></td>
                                    <td class="px-4 py-3 border"></td>
                                    <td class="px-4 py-3 border"><div class="bg-green-200 text-green-800 text-xs text-center rounded p-1">10am - 6pm</div></td>
                                    <td class="px-4 py-3 border"><div class="bg-green-200 text-green-800 text-xs text-center rounded p-1">10am - 6pm</div></td>
                                </tr>
                                <tr class="bg-white border-b">
                                    <td class="px-4 py-3 border font-medium">John Smith</td>
                                    <td class="px-4 py-3 border"></td>
                                    <td class="px-4 py-3 border"></td>
                                    <td class="px-4 py-3 border"><div class="bg-blue-200 text-blue-800 text-xs text-center rounded p-1">12pm - 8pm</div></td>
                                    <td class="px-4 py-3 border"><div class="bg-blue-200 text-blue-800 text-xs text-center rounded p-1">12pm - 8pm</div></td>
                                    <td class="px-4 py-3 border"><div class="bg-blue-200 text-blue-800 text-xs text-center rounded p-1">12pm - 8pm</div></td>
                                    <td class="px-4 py-3 border"></td>
                                    <td class="px-4 py-3 border"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export { render as init };
