import { showModal, showToast } from '../utils.js';

// --- STATE MANAGEMENT ---
// This simulates a dynamic list of tasks.
let tasks = [
    { id: 1, task: "Follow up with Logistics on delayed TrekWise boots (Order #89339).", assignedTo: "Jane D.", status: "In Progress", dueDate: "2025-10-20", source: "AI-flagged from Logistics chat", priority: "High" },
    { id: 2, task: "Prepare end-of-day sales report for Accounting.", assignedTo: "John S.", status: "To Do", dueDate: "2025-10-20", source: "Recurring daily task", priority: "Medium" },
    { id: 3, task: "Finalize and publish the weekly staff schedule.", assignedTo: "Jane D.", status: "To Do", dueDate: "2025-10-21", source: "AI-generated from HR module", priority: "High" },
    { id: 4, task: "Confirm receipt of marketing materials for 'Velocity' promo.", assignedTo: "John S.", status: "To Do", dueDate: "2025-10-22", source: "AI-flagged from HQ Buyer chat", priority: "Medium" },
    { id: 5, task: "Stockroom light flickering reported.", assignedTo: "System", status: "Completed", dueDate: "2025-10-19", source: "Maintenance Log", priority: "Low" },
    { id: 6, task: "Process return for defective Milano Loafer (RMA-0122).", assignedTo: "Alice B.", status: "To Do", dueDate: "2025-10-21", source: "AI-flagged from Logistics module", priority: "Medium" }
];

// Stores tasks that are dragged onto the planner. Key is YYYY-MM-DD date string.
let plannerTasks = {
    "2025-10-20": [tasks[0]] // Pre-populate with one task for demo
};

let currentFilters = {
    assignedTo: 'all',
    priority: 'all'
};

// --- RENDER FUNCTIONS ---

function render(container) {
    container.innerHTML = `
        <div class="space-y-6 operations-module">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Operation Tasks</h2>
                <p class="text-sm text-gray-500">AI-powered task management to streamline store operations.</p>
            </div>
            
            <div class="bg-white p-4 rounded-lg shadow">
                 <h3 class="font-semibold mb-3 text-gray-800 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5C12.41 2.5 12.75 2.84 12.75 3.25V4.75C12.75 5.16 12.41 5.5 12 5.5C11.59 5.5 11.25 5.16 11.25 4.75V3.25C11.25 2.84 11.59 2.5 12 2.5Z" fill="currentColor"/><path d="M18.04 5.96C18.33 5.67 18.8 5.67 19.09 5.96C19.38 6.25 19.38 6.72 19.09 7.01L17.99 8.11C17.7 8.4 17.23 8.4 16.94 8.11C16.65 7.82 16.65 7.35 16.94 7.06L18.04 5.96Z" fill="currentColor"/><path d="M5.96 5.96C6.25 5.67 6.72 5.67 7.01 5.96L8.11 7.06C8.4 7.35 8.4 7.82 8.11 8.11C7.82 8.4 7.35 8.4 7.06 8.11L5.96 7.01C5.67 6.72 5.67 6.25 5.96 5.96Z" fill="currentColor"/><path d="M21.5 12C21.5 11.59 21.16 11.25 20.75 11.25L19.25 11.25C18.84 11.25 18.5 11.59 18.5 12C18.5 12.41 18.84 12.75 19.25 12.75L20.75 12.75C21.16 12.75 21.5 12.41 21.5 12Z" fill="currentColor"/><path d="M4.75 11.25C5.16 11.25 5.5 11.59 5.5 12C5.5 12.41 5.16 12.75 4.75 12.75L3.25 12.75C2.84 12.75 2.5 12.41 2.5 12C2.5 11.59 2.84 11.25 3.25 11.25L4.75 11.25Z" fill="currentColor"/><path d="M12 10.5C14.49 10.5 16.5 12.51 16.5 15V17.5C16.5 18.05 16.05 18.5 15.5 18.5H8.5C7.95 18.5 7.5 18.05 7.5 17.5V15C7.5 12.51 9.51 10.5 12 10.5ZM12 9C8.69 9 6 11.69 6 15V17.5C6 18.88 7.12 20 8.5 20H15.5C16.88 20 18 18.88 18 17.5V15C18 11.69 15.31 9 12 9Z" fill="currentColor"/></svg>
                    AI Priority Briefing for ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                 </h3>
                 <p class="text-sm text-gray-700">Good morning, Jane. Your high-priority focus today should be resolving the <strong>delayed shipment</strong> with Logistics to prevent stockouts. Also, the <strong>weekly schedule</strong> needs to be published by tomorrow.</p>
            </div>

            <!-- Weekly Planner -->
            <div id="weekly-planner-container">
                <h3 class="text-xl font-bold text-gray-800 mb-4">Weekly Planner</h3>
                ${renderWeeklyPlanner()}
            </div>

            <!-- Task Board Controls -->
            <div class="flex flex-wrap justify-between items-center gap-4 mt-8">
                <div class="flex items-center gap-4">
                    ${renderFilters()}
                    ${renderPriorityLegend()}
                </div>
                <button id="add-task-btn" class="text-sm bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 flex-shrink-0">Add Manual Task</button>
            </div>
            
            <!-- Task Board -->
            <div id="task-board" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                ${renderTaskColumns()}
            </div>
        </div>
    `;
    addOperationsEventListeners();
}

function renderFilters() {
    const assignees = [...new Set(tasks.map(t => t.assignedTo))];
    return `
        <div class="flex items-center gap-2">
            <label for="assignee-filter" class="text-sm font-medium text-gray-700">Assignee:</label>
            <select id="assignee-filter" data-filter="assignedTo" class="filter-select bg-white border-gray-300 rounded-md py-1 px-2 text-sm">
                <option value="all">All</option>
                ${assignees.map(a => `<option value="${a}">${a}</option>`).join('')}
            </select>
        </div>
        <div class="flex items-center gap-2">
            <label for="priority-filter" class="text-sm font-medium text-gray-700">Priority:</label>
            <select id="priority-filter" data-filter="priority" class="filter-select bg-white border-gray-300 rounded-md py-1 px-2 text-sm">
                <option value="all">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
            </select>
        </div>
    `;
}

function renderPriorityLegend() {
    return `
        <div class="flex items-center space-x-4 text-xs text-gray-600">
            <span class="flex items-center"><span class="w-3 h-3 rounded-full bg-red-500 mr-1.5"></span>High</span>
            <span class="flex items-center"><span class="w-3 h-3 rounded-full bg-yellow-500 mr-1.5"></span>Medium</span>
            <span class="flex items-center"><span class="w-3 h-3 rounded-full bg-blue-500 mr-1.5"></span>Low</span>
        </div>
    `;
}

function renderTaskColumns() {
    const statuses = ['To Do', 'In Progress', 'Completed'];
    return statuses.map(status => {
        const filteredTasks = tasks.filter(t => {
            const statusMatch = t.status === status;
            const assigneeMatch = currentFilters.assignedTo === 'all' || t.assignedTo === currentFilters.assignedTo;
            const priorityMatch = currentFilters.priority === 'all' || t.priority === currentFilters.priority;
            return statusMatch && assigneeMatch && priorityMatch;
        });

        return `
            <div class="task-column bg-gray-50 rounded-lg p-4" data-status="${status}">
                <h4 class="font-semibold mb-4 text-center text-gray-700">${status} (${filteredTasks.length})</h4>
                <div class="space-y-4 task-list">
                    ${filteredTasks.length > 0 ? filteredTasks.map(renderTaskCard).join('') : '<p class="text-center text-sm text-gray-400 pt-4">No tasks</p>'}
                </div>
            </div>
        `;
    }).join('');
}

function getPriorityClass(priority) {
    switch (priority) {
        case 'High': return { border: 'border-l-red-500', bg: 'bg-red-500' };
        case 'Medium': return { border: 'border-l-yellow-500', bg: 'bg-yellow-500' };
        case 'Low': return { border: 'border-l-blue-500', bg: 'bg-blue-500' };
        default: return { border: 'border-l-gray-300', bg: 'bg-gray-300' };
    }
}

function renderTaskCard(task) {
    const isCompleted = task.status === 'Completed';
    const priorityClasses = getPriorityClass(task.priority);
    return `
        <div class="task-card bg-white p-3 rounded-md shadow-sm border-l-4 ${priorityClasses.border} ${isCompleted ? 'opacity-60' : ''}" draggable="true" data-task-id="${task.id}">
            <p class="font-medium text-sm mb-2 ${isCompleted ? 'line-through' : ''}">${task.task}</p>
            <div class="text-xs text-gray-500 space-y-1">
                <div class="flex items-center justify-between">
                    <span class="flex items-center">
                        <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        <strong>${task.assignedTo}</strong>
                    </span>
                     <span class="font-semibold">${task.dueDate}</span>
                </div>
                 <div class="flex items-center text-gray-400 italic">
                    <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>${task.source}</span>
                </div>
            </div>
        </div>
    `;
}

// --- PLANNER RENDER FUNCTIONS ---
function getWeekDays() {
    // For this demo, the date is fixed to the week of Oct 20, 2025
    const startOfWeek = new Date('2025-10-20T12:00:00Z');
    const week = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(day.getDate() + i);
        week.push(day);
    }
    return week;
}

function renderWeeklyPlanner() {
    const weekDays = getWeekDays();
    const today = new Date('2025-10-20T12:00:00Z'); // Fixed for demo

    return `
        <div class="grid grid-cols-7 gap-2 text-center text-sm">
            ${weekDays.map(day => {
                const dateString = day.toISOString().slice(0, 10);
                const isToday = day.toDateString() === today.toDateString();
                const dayTasks = plannerTasks[dateString] || [];

                return `
                    <div class="planner-day bg-gray-50 rounded-lg p-2" data-date="${dateString}">
                        <div class="planner-day-header font-semibold ${isToday ? 'text-blue-600' : 'text-gray-600'}">
                            <p>${day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                            <p class="${isToday ? 'bg-blue-600 text-white' : 'bg-gray-200'} rounded-full w-6 h-6 flex items-center justify-center mx-auto">${day.getDate()}</p>
                        </div>
                        <div class="planner-task-list mt-2 space-y-2">
                            ${dayTasks.map(renderPlannerTask).join('')}
                        </div>
                    </div>
                `
            }).join('')}
        </div>
    `;
}

function renderPlannerTask(task) {
    const originalTask = tasks.find(t => t.id === task.id);
    const isCompleted = originalTask && originalTask.status === 'Completed';
    const priorityClasses = getPriorityClass(task.priority);

    return `
        <div class="planner-task text-left p-1.5 rounded-md text-xs ${isCompleted ? 'completed' : ''}" style="background-color: ${priorityClasses.bg.replace('bg-', '#')}20; border-left: 3px solid ${priorityClasses.bg.replace('bg-', '#')}80;">
            ${isCompleted ? '<span class="completed-check">✓</span>' : ''}
            <p class="font-semibold truncate">${task.task}</p>
            <p class="text-gray-600">${task.assignedTo}</p>
        </div>
    `;
}


// --- EVENT LISTENERS & HANDLERS ---

function addOperationsEventListeners() {
    const moduleContainer = document.querySelector('.operations-module');
    if (!moduleContainer) return;

    moduleContainer.addEventListener('click', (e) => {
        if (e.target.closest('#add-task-btn')) {
            showAddTaskModal();
        }
    });
    
    moduleContainer.addEventListener('change', (e) => {
        if (e.target.matches('.filter-select')) {
            handleFilterChange(e);
        }
    });

    // Drag and Drop listeners
    let draggedItemId = null;
    
    moduleContainer.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('task-card')) {
            draggedItemId = e.target.dataset.taskId;
            setTimeout(() => e.target.classList.add('dragging'), 0);
        }
    });
    
    moduleContainer.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('task-card')) {
            e.target.classList.remove('dragging');
            draggedItemId = null;
        }
    });

    moduleContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const column = e.target.closest('.task-column, .planner-day');
        if (column) {
            column.classList.add('drag-over');
        }
    });
    
     moduleContainer.addEventListener('dragleave', (e) => {
        const column = e.target.closest('.task-column, .planner-day');
        if (column) {
           column.classList.remove('drag-over');
        }
    });

    moduleContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        const dropTarget = e.target.closest('.task-column, .planner-day');
        if (!dropTarget || !draggedItemId) return;

        dropTarget.classList.remove('drag-over');
        const task = tasks.find(t => t.id == draggedItemId);
        if (!task) return;

        // Dropped on a task column
        if (dropTarget.classList.contains('task-column')) {
            const newStatus = dropTarget.dataset.status;
            if (task.status !== newStatus) {
                task.status = newStatus;
                showToast(`Task moved to "${newStatus}"`);
                reRenderTaskBoard();
                reRenderPlanner(); // Re-render planner to show completed status
            }
        }
        // Dropped on a planner day
        else if (dropTarget.classList.contains('planner-day')) {
            const dateString = dropTarget.dataset.date;
            if (!plannerTasks[dateString]) {
                plannerTasks[dateString] = [];
            }
            // Avoid adding duplicates
            if (!plannerTasks[dateString].some(t => t.id === task.id)) {
                plannerTasks[dateString].push(task);
                showToast(`Task added to planner for ${dateString}`);
                reRenderPlanner();
            } else {
                 showToast(`Task is already on the planner for this day.`);
            }
        }
    });
}

function handleFilterChange(e) {
    const filterType = e.target.dataset.filter;
    currentFilters[filterType] = e.target.value;
    reRenderTaskBoard();
}

function handleAddTaskSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTask = {
        id: Date.now(),
        task: formData.get('task-description') || "New Task",
        assignedTo: formData.get('task-assigned'),
        status: 'To Do',
        dueDate: formData.get('task-due-date') || new Date().toISOString().slice(0, 10),
        source: 'Manual Entry',
        priority: formData.get('task-priority')
    };
    tasks.unshift(newTask); // Add to the beginning of the array
    reRenderTaskBoard(newTask.id);
    showToast(`Task "${newTask.task.substring(0, 20)}..." was added.`);
    document.querySelector('#modal-close-btn').click(); // Close modal
}

function reRenderTaskBoard(newItemId = null) {
    const board = document.getElementById('task-board');
    if (board) {
        board.innerHTML = renderTaskColumns();
        if (newItemId) {
            const newTaskCard = board.querySelector(`[data-task-id="${newItemId}"]`);
            if (newTaskCard) {
                newTaskCard.classList.add('task-card-new');
            }
        }
    }
}

function reRenderPlanner() {
    const plannerContainer = document.getElementById('weekly-planner-container');
    if(plannerContainer) {
        plannerContainer.innerHTML = `
            <h3 class="text-xl font-bold text-gray-800 mb-4">Weekly Planner</h3>
            ${renderWeeklyPlanner()}
        `;
    }
}

function showAddTaskModal() {
    const modalBody = `
        <form id="add-task-form" class="space-y-4">
            <div>
                <label for="task-description" class="block text-sm font-medium text-gray-700">Task Description</label>
                <textarea id="task-description" name="task-description" rows="3" required class="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <div>
                <label for="task-assigned" class="block text-sm font-medium text-gray-700">Assign To</label>
                <select id="task-assigned" name="task-assigned" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option>Jane D.</option>
                    <option>John S.</option>
                    <option>Alice B.</option>
                    <option>Unassigned</option>
                </select>
            </div>
             <div>
                <label for="task-priority" class="block text-sm font-medium text-gray-700">Priority</label>
                <select id="task-priority" name="task-priority" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option>High</option>
                    <option selected>Medium</option>
                    <option>Low</option>
                </select>
            </div>
            <div>
                <label for="task-due-date" class="block text-sm font-medium text-gray-700">Due Date</label>
                <input type="date" id="task-due-date" name="task-due-date" required value="${new Date().toISOString().slice(0,10)}" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
            </div>
             <div class="text-right">
                <button type="submit" class="bg-blue-600 text-white py-2 px-5 rounded-lg hover:bg-blue-700">Add Task</button>
            </div>
        </form>
    `;
    showModal('Add Manual Task', modalBody);
    document.getElementById('add-task-form').addEventListener('submit', handleAddTaskSubmit);
}

export { render as init };

