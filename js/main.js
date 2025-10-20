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
const userProfilePicture = document.getElementById('user-profile-picture');
const accountMenuContainer = document.getElementById('account-menu-container');
const accountMenuButton = document.getElementById('account-menu-button');
const accountMenu = document.getElementById('account-menu');
const menuUsername = document.getElementById('menu-username');
const settingsMenuBtn = document.getElementById('settings-menu-btn');
const settingsBackBtn = document.getElementById('settings-back-btn');
const accountMenuMainView = document.getElementById('account-menu-main-view');
const accountMenuSettingsView = document.getElementById('account-menu-settings-view');
const moduleSettingsContainer = document.getElementById('module-settings-container');
const logoutBtn = document.getElementById('logout-btn');

// --- MODULE DEFINITIONS ---
// Defines the modules available in the application, their properties, and associated JS module.
const modules = [
    { id: 'assortment-planning', title: 'Assortment Planning', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`, module: Assortment },
    { id: 'accounting', title: 'Accounting', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`, module: Accounting },
    { id: 'logistics', title: 'Logistics', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>`, module: Logistics },
    { id: 'hr', title: 'HR & Scheduling', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`, module: HR },
    { id: 'operations', title: 'Store Operations', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>`, module: Operations }
];

// --- FUNCTIONS ---

/**
 * Loads module activity settings from localStorage.
 * @returns {object} An object with module IDs as keys and boolean values.
 */
function loadModuleSettings() {
    try {
        const settings = localStorage.getItem('moduleSettings');
        if (settings) {
            return JSON.parse(settings);
        }
    } catch (e) {
        console.error("Could not parse module settings from localStorage", e);
    }
    // Default: all modules are on if no settings are found
    const defaultSettings = {};
    modules.forEach(m => {
        defaultSettings[m.id] = true;
    });
    return defaultSettings;
}

/**
 * Saves module activity settings to localStorage.
 * @param {object} settings - An object with module IDs as keys and boolean values.
 */
function saveModuleSettings(settings) {
    try {
        localStorage.setItem('moduleSettings', JSON.stringify(settings));
    } catch (e) {
        console.error("Could not save module settings to localStorage", e);
    }
}

/**
 * Renders the toggle switches for module settings inside the account menu.
 */
function renderModuleSettings() {
    if (!moduleSettingsContainer) return;
    const settings = loadModuleSettings();
    moduleSettingsContainer.innerHTML = modules.map(m => `
        <div class="flex items-center justify-between">
            <span class="text-sm text-gray-800">${m.title}</span>
            <label class="toggle-switch">
                <input type="checkbox" data-module-id="${m.id}" ${settings[m.id] ? 'checked' : ''}>
                <span class="toggle-slider"></span>
            </label>
        </div>
    `).join('');
}

/**
 * Renders the sidebar icons based on the modules array and saved settings.
 */
function renderSidebar() {
    if (!sidebarIcons) return;
    
    const settings = loadModuleSettings();
    const visibleModules = modules.filter(m => settings[m.id]);

    sidebarIcons.innerHTML = visibleModules.map(m => `
        <button data-module-id="${m.id}" title="${m.title}" class="sidebar-icon p-4 w-full flex justify-center items-center focus:outline-none">
            ${m.icon}
        </button>
    `).join('');
    
    // After re-rendering, check if the current hash is for a module that is now hidden.
    const currentModuleId = window.location.hash.substring(1);
    const isCurrentModuleVisible = visibleModules.some(m => m.id === currentModuleId);

    if (currentModuleId && !isCurrentModuleVisible && visibleModules.length > 0) {
        // If current module is hidden, navigate to the first available one.
        window.location.hash = visibleModules[0].id;
    } else if (visibleModules.length === 0) {
        // Handle the case where no modules are active
        mainContentArea.innerHTML = `<div class="text-center p-8 text-gray-600">No modules are active. You can enable them in the account settings menu.</div>`;
        moduleTitle.textContent = "No Active Modules";
        document.querySelectorAll('.sidebar-icon').forEach(icon => icon.classList.remove('active'));
    } else {
         // Re-apply active class to the current module icon
        document.querySelectorAll('.sidebar-icon').forEach(icon => {
            icon.classList.toggle('active', icon.dataset.moduleId === currentModuleId);
        });
    }
}


/**
 * Loads the specified module into the main content area.
 * @param {string} moduleId - The ID of the module to load.
 */
async function loadModule(moduleId) {
    const settings = loadModuleSettings();
    if (!moduleId || !settings[moduleId]) {
         const visibleModules = modules.filter(m => settings[m.id]);
         if (visibleModules.length > 0) {
             // If no module is selected or the selected one is disabled, load the first visible one
             window.location.hash = visibleModules[0].id;
         }
         return; // Stop if no modules are visible
    }

    const selectedModule = modules.find(m => m.id === moduleId);
    if (!selectedModule) {
        console.error("Module not found:", moduleId);
        mainContentArea.innerHTML = `<div class="text-center text-red-500">Error: Module not found.</div>`;
        return;
    }

    // Update UI elements to reflect the current module
    moduleTitle.textContent = selectedModule.title;
    document.querySelectorAll('.sidebar-icon').forEach(icon => {
        icon.classList.toggle('active', icon.dataset.moduleId === moduleId);
    });
    
    mainContentArea.innerHTML = '<div class="flex justify-center items-center h-full"><div class="spinner"></div></div>';
    
    await new Promise(resolve => setTimeout(resolve, 150)); 

    try {
        selectedModule.module.init(mainContentArea);
    } catch (error) {
        console.error(`Error loading module ${moduleId}:`, error);
        mainContentArea.innerHTML = `<div class="text-center text-red-500">Error loading module. Check console.</div>`;
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
        window.location.hash = moduleId;
    }
}

/**
 * Handles the URL hash change event to load the correct module.
 */
function handleHashChange() {
    const settings = loadModuleSettings();
    const visibleModules = modules.filter(m => settings[m.id]);
    let moduleId = window.location.hash.substring(1);

    // If no hash, or hash is for a disabled module, default to first visible module
    if (!moduleId || !settings[moduleId]) {
        moduleId = visibleModules.length > 0 ? visibleModules[0].id : null;
    }
    
    if (moduleId) {
        loadModule(moduleId);
    } else {
        // No visible modules to load
        renderSidebar(); // This will show the empty state
    }
}


/**
 * Initializes the user display (profile picture and menu username).
 */
function initializeUser() {
    const user = sessionStorage.getItem('loggedInUser');
    if (user && userProfilePicture) {
        const parts = user.split('@')[0].replace(/[^a-zA-Z]/g, ' ').split(' ');
        let initials = parts.length > 1 
            ? parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
            : parts[0].substring(0, 2);
        initials = initials.toUpperCase();
        
        userProfilePicture.src = `https://placehold.co/100x100/3B82F6/FFFFFF?text=${initials}`;
        if(menuUsername) {
            menuUsername.textContent = user;
        }
    } else if (userProfilePicture) {
        // Fallback if no user is found
        userProfilePicture.src = "https://placehold.co/100x100/3B82F6/FFFFFF?text=SM";
        if(menuUsername) {
            menuUsername.textContent = "manager@softmoc.com";
        }
    }
}

/**
 * Toggles the visibility of the account dropdown menu.
 */
function toggleAccountMenu() {
    const isHidden = accountMenu.classList.toggle('hidden');
    // Always reset to main view when opening/closing
    if (!isHidden) {
        accountMenuMainView.classList.remove('hidden');
        accountMenuSettingsView.classList.add('hidden');
    }
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('loggedInUser')) {
        window.location.href = 'index.html';
        return; 
    }
    
    initializeUser();
    renderSidebar();
    
    // --- EVENT LISTENERS ---
    sidebarIcons.addEventListener('click', handleSidebarClick);
    window.addEventListener('hashchange', handleHashChange);
    
    // Account Menu Listeners
    if (accountMenuButton) {
        accountMenuButton.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent document click listener from firing immediately
            toggleAccountMenu();
        });
    }

    document.addEventListener('click', (e) => {
        if (accountMenuContainer && !accountMenuContainer.contains(e.target) && !accountMenu.classList.contains('hidden')) {
            toggleAccountMenu();
        }
    });

    if (settingsMenuBtn) {
        settingsMenuBtn.addEventListener('click', () => {
            accountMenuMainView.classList.add('hidden');
            accountMenuSettingsView.classList.remove('hidden');
            renderModuleSettings();
        });
    }

    if (settingsBackBtn) {
        settingsBackBtn.addEventListener('click', () => {
            accountMenuSettingsView.classList.add('hidden');
            accountMenuMainView.classList.remove('hidden');
        });
    }

    if (moduleSettingsContainer) {
        moduleSettingsContainer.addEventListener('change', (e) => {
            if (e.target.matches('input[type="checkbox"]')) {
                const moduleId = e.target.dataset.moduleId;
                const isEnabled = e.target.checked;
                const settings = loadModuleSettings();
                settings[moduleId] = isEnabled;
                saveModuleSettings(settings);
                renderSidebar();
                handleHashChange(); // Re-evaluate current module
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('loggedInUser');
            localStorage.removeItem('moduleSettings'); // Clear settings on logout
            window.location.href = 'index.html';
        });
    }
    
    handleHashChange();
    Communications.init();
});
