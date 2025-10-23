import * as Assortment from './modules/assortment.js';
import * as Communications from './modules/communications.js';
import * as Accounting from './modules/accounting.js';
import * as Logistics from './modules/logistics.js';
import * as HR from './modules/hr.js';
import * as Operations from './modules/operations.js';
import { showModal, hideModal, showToast } from './utils.js';

// --- DOM ELEMENTS CACHE ---
const mainContentArea = document.getElementById('main-content-area');
const sidebarIcons = document.getElementById('sidebar-icons');
const moduleTitle = document.getElementById('module-title');
const userProfilePicture = document.getElementById('user-profile-picture');
const accountMenuContainer = document.getElementById('account-menu-container');
const accountMenuButton = document.getElementById('account-menu-button');
const accountMenu = document.getElementById('account-menu');
const menuUsername = document.getElementById('menu-username');
const menuUserRole = document.getElementById('menu-user-role');
const logoutBtn = document.getElementById('logout-btn');
const uploadBtn = document.getElementById('upload-file-btn');

// Menu Views
const accountMenuMainView = document.getElementById('account-menu-main-view');
const accountMenuSettingsView = document.getElementById('account-menu-settings-view');
const accountMenuProfileView = document.getElementById('account-menu-profile-view');

// Profile View Elements
const profileMenuBtn = document.getElementById('profile-menu-btn');
const profileBackBtn = document.getElementById('profile-back-btn');
const userRoleSelect = document.getElementById('user-role-select');
const menuProfilePicture = document.getElementById('menu-profile-picture');
const menuProfileUsername = document.getElementById('menu-profile-username');

// Settings View Elements
const settingsMenuBtn = document.getElementById('settings-menu-btn');
const settingsBackBtn = document.getElementById('settings-back-btn');
const themeToggle = document.getElementById('theme-toggle');
const notificationsToggle = document.getElementById('notifications-toggle');


// --- MODULE DEFINITIONS ---
const modules = [
    { id: 'assortment-planning', title: 'Assortment Planning', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`, module: Assortment },
    { id: 'accounting', title: 'Accounting', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`, module: Accounting },
    { id: 'logistics', title: 'Logistics', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>`, module: Logistics },
    { id: 'hr', title: 'HR & Scheduling', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`, module: HR },
    { id: 'operations', title: 'Operation Tasks', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>`, module: Operations }
];

// --- ROLE-BASED ACCESS CONTROL (RBAC) ---
const ROLE_PERMISSIONS = {
    'CS Admin': ['assortment-planning', 'accounting', 'logistics', 'hr', 'operations'],
    'CEO': ['assortment-planning', 'accounting', 'logistics', 'hr', 'operations'],
    'Assortment Planner': ['assortment-planning', 'operations'],
    'Accounting': ['accounting', 'operations'],
    'Logistics Manager': ['logistics', 'operations'],
    'HR Manager': ['hr', 'operations'],
    'CS Manager': ['logistics', 'operations'],
    'IT Manager': ['operations']
};


// --- FUNCTIONS ---

/**
 * Gets the current user role from sessionStorage.
 * @returns {string} The current user role.
 */
function getUserRole() {
    return sessionStorage.getItem('userRole') || 'CS Admin'; // Default role
}

/**
 * Saves the user role to sessionStorage.
 * @param {string} role - The role to save.
 */
function saveUserRole(role) {
    sessionStorage.setItem('userRole', role);
}

/**
 * Gets the list of module IDs allowed for the current role.
 * @returns {string[]} Array of allowed module IDs.
 */
function getAllowedModules() {
    const role = getUserRole();
    return ROLE_PERMISSIONS[role] || [];
}

/**
 * Renders the sidebar icons based on the user's role permissions.
 */
function renderSidebar() {
    if (!sidebarIcons) return;
    
    const allowedModuleIds = getAllowedModules();
    const visibleModules = modules.filter(m => allowedModuleIds.includes(m.id));

    sidebarIcons.innerHTML = visibleModules.map(m => `
        <button data-module-id="${m.id}" title="${m.title}" class="sidebar-icon p-4 w-full flex justify-center items-center focus:outline-none">
            ${m.icon}
        </button>
    `).join('');
    
    const currentModuleId = window.location.hash.substring(1);
    const isCurrentModuleVisible = visibleModules.some(m => m.id === currentModuleId);

    if (currentModuleId && !isCurrentModuleVisible && visibleModules.length > 0) {
        // If current module is no longer allowed, go to the first allowed one
        window.location.hash = visibleModules[0].id;
    } else if (visibleModules.length === 0) {
        mainContentArea.innerHTML = `<div class="text-center p-8 text-gray-600">Your role does not have access to any modules. Please contact an administrator.</div>`;
        moduleTitle.textContent = "No Access";
        document.querySelectorAll('.sidebar-icon').forEach(icon => icon.classList.remove('active'));
    } else {
        // Highlight the active icon
        document.querySelectorAll('.sidebar-icon').forEach(icon => {
            icon.classList.toggle('active', icon.dataset.moduleId === currentModuleId);
        });
    }
}


/**
 * Loads the specified module into the main content area, checking permissions.
 * @param {string} moduleId - The ID of the module to load.
 */
async function loadModule(moduleId) {
    const allowedModuleIds = getAllowedModules();
    
    // Default to first allowed module if none is specified or if current is disallowed
    if (!moduleId || !allowedModuleIds.includes(moduleId)) {
         if (allowedModuleIds.length > 0) {
             window.location.hash = allowedModuleIds[0];
         } else {
             renderSidebar(); // This will show the "No Access" message
         }
         return;
    }

    const selectedModule = modules.find(m => m.id === moduleId);
    if (!selectedModule) {
        console.error("Module not found:", moduleId);
        mainContentArea.innerHTML = `<div class="text-center text-red-500">Error: Module not found.</div>`;
        return;
    }

    moduleTitle.textContent = selectedModule.title;
    document.querySelectorAll('.sidebar-icon').forEach(icon => {
        icon.classList.toggle('active', icon.dataset.moduleId === moduleId);
    });
    
    mainContentArea.innerHTML = '<div class="flex justify-center items-center h-full"><div class="spinner"></div></div>';
    
    await new Promise(resolve => setTimeout(resolve, 150)); 

    try {
        selectedModule.module.init(mainContentArea);

        // Proactive Chat Trigger Logic
        if (moduleId === 'operations') {
            setTimeout(() => {
                Communications.triggerProactiveMessage("Hi Jane. I see the task to review yesterday's inventory is incomplete. I've moved it to today's planner for you.", 'AI Assistant');
            }, 2500);
        }

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
        window.location.hash = iconButton.dataset.moduleId;
    }
}

/**
 * Handles the URL hash change event to load the correct module.
 */
function handleHashChange() {
    const allowedModuleIds = getAllowedModules();
    let moduleId = window.location.hash.substring(1);

    if (!moduleId || !allowedModuleIds.includes(moduleId)) {
        moduleId = allowedModuleIds.length > 0 ? allowedModuleIds[0] : null;
    }
    
    loadModule(moduleId);
}


/**
 * Initializes the user display (profile picture, menu username, role).
 */
function initializeUser() {
    const user = sessionStorage.getItem('loggedInUser') || "manager@softmoc.com";
    const role = getUserRole();
    
    let initials = 'SM';
    if (user) {
        const parts = user.split('@')[0].replace(/[^a-zA-Z]/g, ' ').split(' ');
        initials = parts.length > 1 
            ? parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
            : parts[0].substring(0, 2);
        initials = initials.toUpperCase();
    }
    
    const profilePicSrc = `https://placehold.co/100x100/3B82F6/FFFFFF?text=${initials}`;
    
    // Main header icon
    if (userProfilePicture) {
        userProfilePicture.src = profilePicSrc;
    }
    
    // Main menu view
    if (menuUsername) {
        menuUsername.textContent = user;
    }
    if (menuUserRole) {
        menuUserRole.textContent = role;
    }
    
    // Profile menu view
    if (menuProfilePicture) {
        menuProfilePicture.src = profilePicSrc;
    }
    if (menuProfileUsername) {
        menuProfileUsername.textContent = user;
    }
    
    // Set dropdown to correct role
    if (userRoleSelect) {
        userRoleSelect.value = role;
    }
}

/**
 * Toggles the visibility of the account dropdown menu.
 */
function toggleAccountMenu() {
    const isHidden = accountMenu.classList.toggle('hidden');
    // Reset to main view when opening
    if (!isHidden) {
        accountMenuMainView.classList.remove('hidden');
        accountMenuSettingsView.classList.add('hidden');
        accountMenuProfileView.classList.add('hidden');
    }
}

/**
 * Shows the file upload modal and handles its interactions.
 */
function showUploadModal() {
    const modalContent = `
        <div id="upload-drop-zone" class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors">
            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            <p class="mt-2 text-sm text-gray-600">Drag & drop files here, or</p>
            <button id="modal-select-files-btn" class="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-500">select files</button>
            <p class="text-xs text-gray-500 mt-1">PNG, JPG, CSV, XLS up to 10MB</p>
            <div id="file-list" class="mt-4 text-left text-sm"></div>
        </div>
        <div class="mt-4 text-right">
             <button id="modal-upload-confirm-btn" class="bg-blue-600 text-white py-2 px-5 rounded-lg hover:bg-blue-700 disabled:opacity-50" disabled>Upload</button>
        </div>
    `;
    showModal('Upload Files', modalContent);

    // Add event listeners for modal content
    const dropZone = document.getElementById('upload-drop-zone');
    const selectFilesBtn = document.getElementById('modal-select-files-btn');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    
    let selectedFiles = [];

    const updateFileList = () => {
        const fileListContainer = document.getElementById('file-list');
        const uploadConfirmBtn = document.getElementById('modal-upload-confirm-btn');
        if (!fileListContainer || !uploadConfirmBtn) return;

        if (selectedFiles.length > 0) {
            fileListContainer.innerHTML = '<strong>Selected files:</strong><ul>' + 
                selectedFiles.map(f => `<li class="truncate p-1">${f.name} (${(f.size/1024).toFixed(1)} KB)</li>`).join('') + 
                '</ul>';
            uploadConfirmBtn.disabled = false;
        } else {
            fileListContainer.innerHTML = '';
            uploadConfirmBtn.disabled = true;
        }
    };
    
    selectFilesBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        selectedFiles = Array.from(fileInput.files);
        updateFileList();
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('bg-blue-50', 'border-blue-500'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('bg-blue-50', 'border-blue-500'), false);
    });

    dropZone.addEventListener('drop', (e) => {
        selectedFiles = Array.from(e.dataTransfer.files);
        updateFileList();
    }, false);
    
    document.getElementById('modal-upload-confirm-btn').addEventListener('click', () => {
        // Dummy upload simulation
        showToast(`Uploading ${selectedFiles.length} file(s)...`);
        setTimeout(() => {
            showToast('Upload successful!');
            hideModal();
        }, 1500);
    });

    dropZone.appendChild(fileInput);
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('loggedInUser')) {
        // Set default user and role if none is logged in (for demo purposes)
        sessionStorage.setItem('loggedInUser', 'manager@softmoc.com');
        sessionStorage.setItem('userRole', 'CS Admin');
    }
    
    initializeUser();
    renderSidebar();
    
    // --- EVENT LISTENERS ---
    sidebarIcons.addEventListener('click', handleSidebarClick);
    window.addEventListener('hashchange', handleHashChange);
    uploadBtn.addEventListener('click', showUploadModal);
    
    // Account Menu Listeners
    accountMenuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAccountMenu();
    });

    document.addEventListener('click', (e) => {
        if (!accountMenuContainer.contains(e.target) && !accountMenu.classList.contains('hidden')) {
            toggleAccountMenu();
        }
    });
    
    // Profile View Listeners
    profileMenuBtn.addEventListener('click', () => {
        accountMenuMainView.classList.add('hidden');
        accountMenuProfileView.classList.remove('hidden');
    });

    profileBackBtn.addEventListener('click', () => {
        accountMenuProfileView.classList.add('hidden');
        accountMenuMainView.classList.remove('hidden');
    });
    
    userRoleSelect.addEventListener('change', (e) => {
        const newRole = e.target.value;
        saveUserRole(newRole);
        initializeUser(); // Update menu text
        renderSidebar();    // Update visible icons
        handleHashChange(); // Reload module or redirect
        showToast(`Role changed to ${newRole}.`);
    });

    // Settings View Listeners
    settingsMenuBtn.addEventListener('click', () => {
        accountMenuMainView.classList.add('hidden');
        accountMenuSettingsView.classList.remove('hidden');
    });

    settingsBackBtn.addEventListener('click', () => {
        accountMenuSettingsView.classList.add('hidden');
        accountMenuMainView.classList.remove('hidden');
    });
    
    themeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('dark');
            showToast('Dark Mode enabled.');
        } else {
            document.body.classList.remove('dark');
            showToast('Light Mode enabled.');
        }
    });
    
    notificationsToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            showToast('Notifications enabled.');
        } else {
            showToast('Notifications disabled.');
        }
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('loggedInUser');
        sessionStorage.removeItem('userRole'); // Clear role on logout
        window.location.href = 'index.html';
    });
    
    handleHashChange(); // Load initial module based on hash or role
    Communications.init();
});