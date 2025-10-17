import * as Assortment from './modules/assortment.js';
import * as Communications from './modules/communications.js';
import * as Accounting from './modules/accounting.js';
import * as Logistics from './modules/logistics.js';
import * as HR from './modules/hr.js';
import * as Operations from './modules/operations.js';

// --- DOM ELEMENTS ---
const mainContentArea = document.getElementById('main-content-area');
const sidebarIcons = document.getElementById('sidebar-icons');
const moduleTitle = document.getElementById('module-title');
const userInitials = document.getElementById('user-initials');

// --- MODULE DEFINITIONS ---
const modules = [
    { id: 'assortment-planning', title: 'Assortment Planning', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`, module: Assortment },
    { id: 'accounting', title: 'Accounting', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`, module: Accounting },
    { id: 'logistics', title: 'Logistics', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>`, module: Logistics },
    { id: 'hr', title: 'HR', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`, module: HR },
    { id: 'operations', title: 'Operations', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>`, module: Operations }
];

// --- FUNCTIONS ---
function renderSidebar() {
    sidebarIcons.innerHTML = modules.map(m => `
        <button data-module-id="${m.id}" title="${m.title}" class="sidebar-icon p-3 rounded-lg hover:bg-blue-600 focus:outline-none">
            ${m.icon}
        </button>
    `).join('');
}

async function loadModule(moduleId) {
    const selectedModule = modules.find(m => m.id === moduleId);
    if (!selectedModule) {
        console.error("Module not found:", moduleId);
        return;
    }

    // Update UI elements
    moduleTitle.textContent = selectedModule.title;
    document.querySelectorAll('.sidebar-icon').forEach(icon => {
        icon.classList.toggle('active', icon.dataset.moduleId === moduleId);
    });
    
    // Clear content area and load module
    mainContentArea.innerHTML = '<div class="flex justify-center items-center h-full"><div class="spinner"></div></div>';
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 200)); 

    selectedModule.module.init(mainContentArea);
}

function handleSidebarClick(e) {
    const iconButton = e.target.closest('.sidebar-icon');
    if (iconButton) {
        const moduleId = iconButton.dataset.moduleId;
        // Update URL hash for state management
        window.location.hash = moduleId;
    }
}

function handleHashChange() {
    // Load module based on URL hash or default to first module
    const moduleId = window.location.hash.substring(1) || modules[0].id;
    loadModule(moduleId);
}

function initializeUser() {
    const user = sessionStorage.getItem('loggedInUser');
    if (user && userInitials) {
        userInitials.textContent = user.substring(0, 2).toUpperCase();
    } else if (userInitials) {
        // Default if no user is in session
        userInitials.textContent = "SM";
    }
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!sessionStorage.getItem('loggedInUser')) {
        window.location.href = 'index.html';
        return;
    }
    
    initializeUser();
    renderSidebar();
    
    // Set up event listeners
    sidebarIcons.addEventListener('click', handleSidebarClick);
    window.addEventListener('hashchange', handleHashChange);
    
    // Initial module load
    handleHashChange();

    // Initialize communications widget
    Communications.init();
});

