import { showModal, showToast } from '../utils.js';

// --- STATE MANAGEMENT ---
let tasks = [
    { id: 1, task: "Follow up with Logistics on delayed TrekWise boots (Order #89339).", assignedTo: "Jane D.", status: "In Progress", dueDate: "2025-10-20", source: "AI-flagged from Logistics chat", priority: "High" },
    { id: 2, task: "Prepare end-of-day sales report for Accounting.", assignedTo: "John S.", status: "To Do", dueDate: "2025-10-20", source: "Recurring daily task", priority: "Medium" },
    { id: 3, task: "Finalize and publish the weekly staff schedule.", assignedTo: "Jane D.", status: "To Do", dueDate: "2025-10-21", source: "AI-generated from HR module", priority: "High" },
    { id: 4, task: "Confirm receipt of marketing materials for 'Velocity' promo.", assignedTo: "John S.", status: "To Do", dueDate: "2025-10-22", source: "AI-flagged from HQ Buyer chat", priority: "Medium" },
    { id: 5, task: "Stockroom light flickering reported.", assignedTo: "System", status: "Completed", dueDate: "2025-10-19", source: "Maintenance Log", priority: "Low" },
    { id: 6, task: "Process return for defective Milano Loafer (RMA-0122).", assignedTo: "Alice B.", status: "To Do", dueDate: "2025-10-21", source: "AI-flagged from Logistics module", priority: "Medium" },
    { id: 7, task: "Review previous day's inventory discrepancies.", assignedTo: "John S.", status: "To Do", dueDate: "2025-10-19", source: "System", priority: "Medium" } // Task from yesterday to demonstrate rollover
];

// Key is YYYY-MM-DD. Value is an array of task objects with planner-specific properties.
let plannerTasks = {
    "2025-10-19": [ // Yesterday
        { ...tasks.find(t => t.id === 7), plannerId: "7-1", startTime: "15:00", duration: 1.5 }
    ],
    "2025-10-20": [
        { ...tasks.find(t => t.id === 1), plannerId: "1-1", startTime: "10:00", duration: 2 }, // 10am for 2 hours
        { ...tasks.find(t => t.id === 2), plannerId: "2-1", startTime: "16:00", duration: 1 }  // 4pm for 1 hour
    ],
    "2025-10-21": [
        { ...tasks.find(t => t.id === 3), plannerId: "3-1", startTime: "09:00", duration: 3 }, // 9am for 3 hours
        { ...tasks.find(t => t.id === 6), plannerId: "6-1", startTime: "14:00", duration: 2 } // 2pm for 2 hours
    ],
    "2025-10-22": [
        { ...tasks.find(t => t.id === 4), plannerId: "4-1", startTime: "11:00", duration: 1.5 } // 11am for 1.5 hours
    ]
};

let currentFilters = { assignedTo: 'all', priority: 'all' };
const DEMO_TODAY = new Date('2025-10-20T12:00:00Z');
const HOUR_HEIGHT = 50; // Corresponds to h-12 in Tailwind + borders

// --- RENDER FUNCTIONS ---

/**
 * Automatically moves incomplete tasks from past days to the current day in the planner.
 */
function rolloverIncompleteTasks() {
    const todayStr = DEMO_TODAY.toISOString().slice(0, 10);
    if (!plannerTasks[todayStr]) {
        plannerTasks[todayStr] = [];
    }
    let movedCount = 0;

    for (const dateStr in plannerTasks) {
        if (dateStr < todayStr) {
            const tasksToMove = [];
            const remainingTasks = [];

            plannerTasks[dateStr].forEach(pTask => {
                const mainTask = tasks.find(t => t.id === pTask.id);
                if (mainTask && mainTask.status !== 'Completed') {
                    tasksToMove.push({
                        ...pTask,
                        startTime: "09:00", // Move to start of day
                        duration: 1, // Reset duration
                        originalDate: dateStr
                    });
                } else {
                    remainingTasks.push(pTask);
                }
            });

            if (tasksToMove.length > 0) {
                plannerTasks[todayStr].unshift(...tasksToMove); // Add to the beginning of today's tasks
                plannerTasks[dateStr] = remainingTasks; // Keep completed tasks on their original day
                movedCount += tasksToMove.length;
            }
        }
    }
    if (movedCount > 0) {
        // Use a timeout to ensure the toast appears after the initial load animation
        setTimeout(() => showToast(`${movedCount} incomplete task(s) automatically moved to today.`), 100);
    }
}


function render(container) {
    rolloverIncompleteTasks();
    container.innerHTML = `
        <div class="space-y-6 operations-module">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Operation Tasks</h2>
                <p class="text-sm text-gray-500">AI-powered task management to streamline store operations.</p>
            </div>
            
            <div class="bg-white p-4 rounded-lg shadow">
                 <h3 class="font-semibold mb-3 text-gray-800 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5C12.41 2.5 12.75 2.84 12.75 3.25V4.75C12.75 5.16 12.41 5.5 12 5.5C11.59 5.5 11.25 5.16 11.25 4.75V3.25C11.25 2.84 11.59 2.5 12 2.5Z" fill="currentColor"/><path d="M18.04 5.96C18.33 5.67 18.8 5.67 19.09 5.96C19.38 6.25 19.38 6.72 19.09 7.01L17.99 8.11C17.7 8.4 17.23 8.4 16.94 8.11C16.65 7.82 16.65 7.35 16.94 7.06L18.04 5.96Z" fill="currentColor"/><path d="M5.96 5.96C6.25 5.67 6.72 5.67 7.01 5.96L8.11 7.06C8.4 7.35 8.4 7.82 8.11 8.11C7.82 8.4 7.35 8.4 7.06 8.11L5.96 7.01C5.67 6.72 5.67 6.25 5.96 5.96Z" fill="currentColor"/><path d="M21.5 12C21.5 11.59 21.16 11.25 20.75 11.25L19.25 11.25C18.84 11.25 18.5 11.59 18.5 12C18.5 12.41 18.84 12.75 19.25 12.75L20.75 12.75C21.16 12.75 21.5 12.41 21.5 12Z" fill="currentColor"/><path d="M4.75 11.25C5.16 11.25 5.5 11.59 5.5 12C5.5 12.41 5.16 12.75 4.75 12.75L3.25 12.75C2.84 12.75 2.5 12.41 2.5 12C2.5 11.59 2.84 11.25 3.25 11.25L4.75 11.25Z" fill="currentColor"/><path d="M12 10.5C14.49 10.5 16.5 12.51 16.5 15V17.5C16.5 18.05 16.05 18.5 15.5 18.5H8.5C7.95 18.5 7.5 18.05 7.5 17.5V15C7.5 12.51 9.51 10.5 12 10.5ZM12 9C8.69 9 6 11.69 6 15V17.5C6 18.88 7.12 20 8.5 20H15.5C16.88 20 18 18.88 18 17.5V15C18 11.69 15.31 9 12 9Z" fill="currentColor"/></svg>
                    AI Priority Briefing for ${DEMO_TODAY.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                 </h3>
                 <p class="text-sm text-gray-700">Good morning, Jane. Your high-priority focus today should be resolving the <strong>delayed shipment</strong> with Logistics to prevent stockouts. Also, the <strong>weekly schedule</strong> needs to be published by tomorrow.</p>
            </div>

            <!-- Weekly Planner -->
            <div id="weekly-planner-container" class="bg-white p-4 rounded-lg shadow">
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
        case 'High': return { cardBorder: 'border-l-red-500', hex: '#ef4444', hex_bg: '#fee2e2' };
        case 'Medium': return { cardBorder: 'border-l-yellow-500', hex: '#f59e0b', hex_bg: '#fef3c7' };
        case 'Low': return { cardBorder: 'border-l-blue-500', hex: '#3b82f6', hex_bg: '#dbeafe' };
        default: return { cardBorder: 'border-l-gray-300', hex: '#6b7280', hex_bg: '#f3f4f6' };
    }
}

function renderTaskCard(task) {
    const isCompleted = task.status === 'Completed';
    const priorityClasses = getPriorityClass(task.priority);
    return `
        <div class="task-card bg-white p-3 rounded-md shadow-sm border-l-4 ${priorityClasses.cardBorder} ${isCompleted ? 'opacity-60' : ''}" draggable="true" data-task-id="${task.id}">
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
    const startOfWeek = new Date('2025-10-20T12:00:00Z');
    return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(day.getDate() + i);
        return day;
    });
}

function renderWeeklyPlanner() {
    const weekDays = getWeekDays();
    const today = DEMO_TODAY;
    const hours = Array.from({ length: 10 }, (_, i) => 9 + i); // 9 AM to 6 PM

    return `
        <div class="planner-container">
            <div class="planner-header">
                <div class="header-offset"></div>
                ${weekDays.map(day => {
                    const isToday = day.toDateString() === today.toDateString();
                    return `
                    <div class="planner-day-header ${isToday ? 'is-today' : ''}">
                        <span>${day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span class="date-number">${day.getDate()}</span>
                    </div>
                    `
                }).join('')}
            </div>
            <div class="planner-body-container">
                <div class="time-labels">
                    ${hours.map(h => `<div class="time-label">${h}:00</div>`).join('')}
                </div>
                <div class="planner-days-grid">
                    ${weekDays.map(day => {
                        const dateString = day.toISOString().slice(0, 10);
                        const dayTasks = plannerTasks[dateString] || [];
                        return `
                        <div class="planner-day-body" data-date="${dateString}">
                            ${dayTasks.map(renderPlannerTask).join('')}
                        </div>
                        `
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderPlannerTask(task) {
    const originalTask = tasks.find(t => t.id === task.id);
    const isCompleted = originalTask && originalTask.status === 'Completed';
    const priorityColors = getPriorityClass(task.priority);
    
    const [startHour, startMinute] = task.startTime.split(':').map(Number);
    const top = ((startHour - 9) * 60 + startMinute) / 60 * HOUR_HEIGHT;
    const height = task.duration * HOUR_HEIGHT - 4; // -4 for padding/border
    
    const taskHtml = `
        <div class="planner-task ${isCompleted ? 'completed' : ''}" 
             draggable="true"
             data-planner-id="${task.plannerId}" 
             data-task-id="${task.id}"
             style="top: ${top}px; height: ${height}px; background-color: ${priorityColors.hex_bg}; border-left: 3px solid ${priorityColors.hex};">
            <div class="planner-task-content">
                <p class="font-semibold truncate">${task.task}</p>
                <p class="text-gray-600">${task.assignedTo}</p>
            </div>
            <div class="resize-handle"></div>
        </div>
    `;
    return taskHtml;
}

// --- EVENT LISTENERS & HANDLERS ---

function addOperationsEventListeners() {
    const moduleContainer = document.querySelector('.operations-module');
    if (!moduleContainer) return;

    moduleContainer.addEventListener('click', (e) => {
        if (e.target.closest('#add-task-btn')) showAddTaskModal();
    });
    
    moduleContainer.addEventListener('change', (e) => {
        if (e.target.matches('.filter-select')) handleFilterChange(e);
    });

    // Drag and Drop listeners
    let draggedInfo = null;
    
    moduleContainer.addEventListener('dragstart', (e) => {
        if (e.target.matches('.task-card, .planner-task')) {
            setTimeout(() => e.target.classList.add('dragging'), 0);
            
            const isPlannerTask = e.target.classList.contains('planner-task');
            draggedInfo = {
                taskId: e.target.dataset.taskId,
                isPlannerTask: isPlannerTask,
                plannerId: isPlannerTask ? e.target.dataset.plannerId : null,
                originalDate: isPlannerTask ? e.target.closest('.planner-day-body').dataset.date : null
            };
        }
    });
    
    moduleContainer.addEventListener('dragend', (e) => {
        if (draggedInfo) {
            const draggingElement = moduleContainer.querySelector('.dragging');
            if(draggingElement) draggingElement.classList.remove('dragging');
            draggedInfo = null;
        }
    });

    moduleContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const column = e.target.closest('.task-column, .planner-day-body');
        if (column) {
            // Clear previous drag-over states
            moduleContainer.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            column.classList.add('drag-over');
        }
    });
    
     moduleContainer.addEventListener('dragleave', (e) => {
        const column = e.target.closest('.task-column, .planner-day-body');
        if (column) {
            column.classList.remove('drag-over');
        }
    });

    moduleContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        const dropTarget = e.target.closest('.task-column, .planner-day-body');
        if (dropTarget) dropTarget.classList.remove('drag-over');
        if (!dropTarget || !draggedInfo) return;

        const task = tasks.find(t => t.id == draggedInfo.taskId);
        if (!task) return;

        // Handle moving task to a new status column
        if (dropTarget.classList.contains('task-column')) {
            const newStatus = dropTarget.closest('.task-column').dataset.status;
            if (task.status !== newStatus) {
                task.status = newStatus;
                showToast(`Task moved to "${newStatus}"`);
                reRenderTaskBoard();
                reRenderPlanner();
            }
        } 
        // Handle dropping on the planner
        else if (dropTarget.classList.contains('planner-day-body')) {
            const newDateString = dropTarget.dataset.date;
            let movedTaskData;
            
            // If it was a planner task, find it, remove it from the old array, and store its data
            if (draggedInfo.isPlannerTask) {
                const oldDate = draggedInfo.originalDate;
                if (plannerTasks[oldDate]) {
                    const taskIndex = plannerTasks[oldDate].findIndex(t => t.plannerId === draggedInfo.plannerId);
                    if (taskIndex > -1) {
                        movedTaskData = plannerTasks[oldDate][taskIndex];
                        plannerTasks[oldDate].splice(taskIndex, 1);
                    }
                }
            } else { // It's a new task from the board
                movedTaskData = { ...task, duration: 1 };
            }

            if (!movedTaskData) return;
            
            const dropY = e.offsetY;
            const hour = Math.floor(dropY / HOUR_HEIGHT) + 9;
            const minutes = Math.round((dropY % HOUR_HEIGHT) / HOUR_HEIGHT * 4) * 15;
            const newStartTime = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            
            movedTaskData.startTime = newStartTime;
            movedTaskData.plannerId = movedTaskData.plannerId || `${task.id}-${Date.now()}`;
            
            if (!plannerTasks[newDateString]) plannerTasks[newDateString] = [];
            plannerTasks[newDateString].push(movedTaskData);

            showToast(`Task scheduled for ${newDateString} at ${newStartTime}`);
            reRenderPlanner();
        }
    });

    // Planner task resizing
    let resizingTask = null;
    let startY = 0;
    let startHeight = 0;

    moduleContainer.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('resize-handle')) {
            e.preventDefault();
            e.stopPropagation();
            const taskElement = e.target.closest('.planner-task');
            const plannerId = taskElement.dataset.plannerId;
            const dateString = taskElement.closest('.planner-day-body').dataset.date;

            resizingTask = plannerTasks[dateString].find(t => t.plannerId === plannerId);
            startY = e.pageY;
            startHeight = taskElement.offsetHeight;
            document.body.classList.add('resizing');
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!resizingTask) return;
        const dy = e.pageY - startY;
        const newHeight = Math.max(HOUR_HEIGHT / 2, startHeight + dy);
        
        const newDuration = Math.round((newHeight / HOUR_HEIGHT) * 2) / 2; // Snap to 30 mins
        if (resizingTask.duration !== newDuration) {
            resizingTask.duration = newDuration;
            reRenderPlanner();
        }
    });

    document.addEventListener('mouseup', () => {
        if (resizingTask) {
            resizingTask = null;
            document.body.classList.remove('resizing');
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
    tasks.unshift(newTask);
    reRenderTaskBoard(newTask.id);
    showToast(`Task "${newTask.task.substring(0, 20)}..." was added.`);
    document.querySelector('#modal-close-btn').click();
}

function reRenderTaskBoard(newItemId = null) {
    const board = document.getElementById('task-board');
    if (board) {
        board.innerHTML = renderTaskColumns();
        if (newItemId) {
            const newTaskCard = board.querySelector(`[data-task-id="${newItemId}"]`);
            if (newTaskCard) newTaskCard.classList.add('task-card-new');
        }
    }
}

function reRenderPlanner() {
    const plannerContainer = document.getElementById('weekly-planner-container');
    if(plannerContainer) {
        const grid = plannerContainer.querySelector('.planner-container');
        if (grid) {
            grid.outerHTML = renderWeeklyPlanner();
        } else {
             plannerContainer.innerHTML = `
                <h3 class="text-xl font-bold text-gray-800 mb-4">Weekly Planner</h3>
                ${renderWeeklyPlanner()}
            `;
        }
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


function addTask(taskDetails) {
    const newTask = {
        id: Date.now(),
        status: 'To Do',
        source: 'AI Chat',
        ...taskDetails
    };
    tasks.unshift(newTask);
    return newTask;
}


export { render as init, addTask, reRenderTaskBoard };
