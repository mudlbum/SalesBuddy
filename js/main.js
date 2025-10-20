import * as Assortment from './modules/assortment.js';
import * as Communications from './modules/communications.js';
import * as Accounting from './modules/accounting.js';
import * as Logistics from './modules/logistics.js';
import * as HR from './modules/hr.js';
import * as Operations from './modules/operations.js';

// --- DOM ELEMENTS CACHE ---
const mainContentArea = document.getElementById('main-content-area');
const sidebarIcons = document.getElementById('sidebar-icons');
const moduleTitle = document.getElementById('module-title');
const userInitials = document.getElementById('user-initials');
const accountDropdown = document.getElementById('account-dropdown'); // Added
const settingsMenuItem = document.getElementById('settings-menu-item'); // Added
const settingsModal = document.getElementById('settings-modal'); // Added
const closeSettingsModalBtn = document.getElementById('close-settings-modal'); // Added
const moduleToggleList = document.getElementById('module-toggle-list'); // Added
const logoutBtn = document.getElementById('logout-btn'); // Added

// --- MODULE DEFINITIONS ---
// Defines the modules available in the application, their properties, and associated JS module.
const modules = [
    { id: 'assortment-planning', title: 'Assortment Planning', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`, module: Assortment, enabled: true },
    { id: 'accounting', title: 'Accounting', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`, module: Accounting, enabled: true },
    { id: 'logistics', title: 'Logistics', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>`, module: Logistics, enabled: true },
    { id: 'hr', title: 'HR & Scheduling', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`, module: HR, enabled: true },
    { id: 'operations', title: 'Store Operations', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>`, module: Operations, enabled: true }
];

// --- FUNCTIONS ---

/**
 * Renders the sidebar icons based on the enabled modules.
 */
function renderSidebar() {
    if (!sidebarIcons) return;
    sidebarIcons.innerHTML = modules
        .filter(m => m.enabled) // Only render enabled modules
        .map(m => `
            <button data-module-id="${m.id}" title="${m.title}" class="sidebar-icon p-4 w-full flex justify-center items-center focus:outline-none">
                ${m.icon}
            </button>
        `).join('');
}

/**
 * Loads the specified module into the main content area.
 * @param {string} moduleId - The ID of the module to load.
 */
async function loadModule(moduleId) {
    const selectedModule = modules.find(m => m.id === moduleId && m.enabled); // Check if enabled
    if (!selectedModule) {
        // If module not found or disabled, load the first available enabled module
        const firstEnabledModule = modules.find(m => m.enabled);
        if (firstEnabledModule) {
            window.location.hash = firstEnabledModule.id; // Update hash and let handleHashChange load it
        } else {
             console.error("No enabled modules found.");
             mainContentArea.innerHTML = `<div class="text-center text-red-500">Error: No modules are enabled.</div>`;
             moduleTitle.textContent = "Error";
        }
        return;
    }

    // Update UI elements to reflect the current module
    moduleTitle.textContent = selectedModule.title;
    document.querySelectorAll('.sidebar-icon').forEach(icon => {
        icon.classList.toggle('active', icon.dataset.moduleId === moduleId);
    });
    
    // Show a loading spinner while the module content is being prepared
    mainContentArea.innerHTML = '<div class="flex justify-center items-center h-full"><div class="spinner"></div></div>';
    
    // Simulate a brief network delay for a better UX
    await new Promise(resolve => setTimeout(resolve, 150)); 

    // Initialize the module, which will render its content
    try {
        selectedModule.module.init(mainContentArea);
    } catch (error) {
        console.error(`Error loading module ${moduleId}:`, error);
        mainContentArea.innerHTML = `<div class="text-center text-red-500">Error loading module. Check the console for details.</div>`;
    }
}

/**
 * Handles clicks on sidebar icons to load modules.
 * @param {Event} e - The click event.
 */
function handleSidebarClick(e) {
    const iconButton = e.target.closest('.sidebar-icon');
    if (iconButton) {
        const moduleId = iconButton.dataset.moduleId;
        // Update URL hash to manage browser history and enable deep linking
        window.location.hash = moduleId;
    }
}

/**
 * Handles the URL hash change event to load the correct module.
 */
function handleHashChange() {
    // Determine which module to load from the URL hash, or default to the first enabled one.
    const requestedModuleId = window.location.hash.substring(1);
    const moduleToLoad = modules.find(m => m.id === requestedModuleId && m.enabled);
    
    const targetModuleId = moduleToLoad ? moduleToLoad.id : (modules.find(m => m.enabled)?.id || ''); 
    
    if (targetModuleId) {
        loadModule(targetModuleId);
    } else {
        // Handle case where no modules are enabled or hash is invalid
         console.error("No valid module to load based on hash:", requestedModuleId);
         mainContentArea.innerHTML = `<div class="text-center text-gray-500">Select a module from the sidebar.</div>`;
         moduleTitle.textContent = "Dashboard";
    }
}

/**
 * Initializes the user display (e.g., initials in the header).
 */
function initializeUser() {
    const user = sessionStorage.getItem('loggedInUser');
    if (user && userInitials) {
        // Create initials from the username/email
        const parts = user.split('@')[0].replace(/[^a-zA-Z]/g, ' ').split(' ');
        let initials = parts.length > 1 
            ? parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
            : parts[0].substring(0, 2);
        userInitials.textContent = initials.toUpperCase();
    } else if (userInitials) {
        // Fallback if no user is found in session storage
        userInitials.textContent = "SM";
    }
}

// --- Added Account Dropdown Logic ---
function toggleAccountDropdown() {
    accountDropdown.classList.toggle('show');
}

// --- Added Settings Modal Logic ---
function openSettingsModal() {
    populateModuleToggles();
    settingsModal.classList.remove('hidden');
    settingsModal.classList.add('flex'); // Use flex to center vertically
    accountDropdown.classList.remove('show'); // Close dropdown when opening modal
}

function closeSettingsModal() {
    settingsModal.classList.add('hidden');
    settingsModal.classList.remove('flex');
}

function populateModuleToggles() {
    if (!moduleToggleList) return;
    moduleToggleList.innerHTML = modules.map(m => `
        <div class="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
            <span class="text-sm font-medium text-gray-700">${m.title}</span>
            <label class="toggle-switch">
                <input type="checkbox" data-module-id="${m.id}" ${m.enabled ? 'checked' : ''}>
                <span class="slider round"></span>
            </label>
        </div>
    `).join('');

    // Add event listeners to the new toggles
    moduleToggleList.querySelectorAll('input[type="checkbox"]').forEach(toggle => {
        toggle.addEventListener('change', handleModuleToggle);
    });
}

function handleModuleToggle(e) {
    const moduleId = e.target.dataset.moduleId;
    const isEnabled = e.target.checked;
    const module = modules.find(m => m.id === moduleId);
    if (module) {
        module.enabled = isEnabled;
        renderSidebar(); // Re-render sidebar to reflect changes
        
        // If the currently viewed module is disabled, redirect to the first enabled one
        const currentHash = window.location.hash.substring(1);
        if (currentHash === moduleId && !isEnabled) {
             const firstEnabled = modules.find(m => m.enabled);
             window.location.hash = firstEnabled ? firstEnabled.id : ''; // Go to first enabled or clear hash
        }
    }
}

// --- Added Logout Logic ---
function handleLogout() {
    sessionStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Redirect to login page if no user is in the session
    if (!sessionStorage.getItem('loggedInUser')) {
        window.location.href = 'index.html';
        return; // Stop further execution
    }
    
    initializeUser();
    renderSidebar();
    
    // Set up event listeners for navigation
    if (sidebarIcons) sidebarIcons.addEventListener('click', handleSidebarClick);
    window.addEventListener('hashchange', handleHashChange);
    
    // --- Added Account Dropdown Listeners ---
    if (userInitials) userInitials.addEventListener('click', toggleAccountDropdown);
    if (settingsMenuItem) settingsMenuItem.addEventListener('click', openSettingsModal);
    if (closeSettingsModalBtn) closeSettingsModalBtn.addEventListener('click', closeSettingsModal);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // Close dropdown if clicking outside
    document.addEventListener('click', (e) => {
        if (!userInitials.contains(e.target) && !accountDropdown.contains(e.target)) {
            accountDropdown.classList.remove('show');
        }
        // Close modal if clicking outside the modal content
         if (settingsModal.classList.contains('flex') && !settingsModal.querySelector('div').contains(e.target) && e.target === settingsModal) {
             closeSettingsModal();
         }
    });
    
    // Perform the initial module load based on the current URL hash
    handleHashChange();

    // Initialize the persistent communications/chat widget
    Communications.init();
});