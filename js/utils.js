// --- MODAL ---
const modalContainer = document.getElementById('modal-container');

/**
 * Shows a modal with the specified title and content.
 * @param {string} title - The title to display in the modal header.
 * @param {string} contentHTML - The HTML content to display in the modal body.
 * @param {boolean} [isLarge=false] - If true, the modal will have a larger max-width.
 */
function showModal(title, contentHTML, isLarge = false) {
    if (!modalContainer) return;

    modalContainer.innerHTML = `
        <div class="modal-content ${isLarge ? 'max-w-4xl' : 'max-w-lg'} w-full">
            <div class="modal-header">
                <h2 class="modal-title">${title}</h2>
                <button class="modal-close-btn" id="modal-close-btn">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div class="modal-body">
                ${contentHTML}
            </div>
        </div>
    `;

    // Add visible class to trigger transition
    requestAnimationFrame(() => {
        modalContainer.classList.add('visible');
    });

    // Add event listeners
    modalContainer.querySelector('#modal-close-btn').addEventListener('click', hideModal);
    modalContainer.addEventListener('click', (e) => {
        // Close if clicking on the overlay itself, not the content
        if (e.target === modalContainer) {
            hideModal();
        }
    });
}

/**
 * Hides the currently visible modal.
 */
function hideModal() {
    if (!modalContainer) return;
    modalContainer.classList.remove('visible');
    // Clear content after transition to prevent flashes of old content
    setTimeout(() => {
        modalContainer.innerHTML = '';
    }, 300); // Should match CSS transition duration
}


// --- AI SUGGESTION BALLOON ---
const balloonContainer = document.getElementById('ai-balloon-container'); 
let hideBalloonTimeout;

/**
 * Displays the AI suggestion balloon next to a target element.
 * @param {string} content - The HTML content to display in the balloon.
 * @param {DOMRect} targetRect - The bounding rectangle of the element to position the balloon next to.
 */
function showBalloon(content, targetRect) {
    if (!balloonContainer) return;

    // Clear any pending hide timeouts
    if (hideBalloonTimeout) {
        clearTimeout(hideBalloonTimeout);
    }

    const balloonContent = document.createElement('div');
    balloonContent.id = 'ai-balloon-content';
    balloonContent.innerHTML = content;

    // Clear previous content and add new
    balloonContainer.innerHTML = '';
    balloonContainer.appendChild(balloonContent);
    
    // Position the balloon.
    const top = targetRect.top + window.scrollY - 10;
    const left = targetRect.left + window.scrollX + (targetRect.width / 2);
    
    balloonContainer.style.top = `${top}px`;
    balloonContainer.style.left = `${left}px`;
    
    // Add listener to balloon to keep it open when mouse enters
    balloonContainer.onmouseleave = () => {
        hideBalloon();
    };
    
    // Make it visible
    balloonContainer.style.opacity = '1';
    balloonContainer.style.pointerEvents = 'auto';

    // Set a timeout to hide after a delay
    hideBalloonTimeout = setTimeout(hideBalloon, 5000); // 5 seconds
}

/**
 * Hides the AI suggestion balloon.
 */
function hideBalloon() {
    if (!balloonContainer) return;
    
    balloonContainer.style.opacity = '0';
    balloonContainer.style.pointerEvents = 'none';
    balloonContainer.onmouseleave = null; // Clean up listener

    if (hideBalloonTimeout) {
        clearTimeout(hideBalloonTimeout);
    }
    
    // Also remove the active class from any icon
    const activeIcon = document.querySelector('.is-showing-balloon');
    if (activeIcon) {
        activeIcon.classList.remove('is-showing-balloon');
    }
}


// --- TOAST NOTIFICATIONS ---
const toastContainer = document.getElementById('toast-container');

/**
 * Shows a toast notification message.
 * @param {string} message - The message to display.
 */
function showToast(message) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // After a delay, add the fade-out class, then remove the element.
    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000); // Toast is visible for 3 seconds.
}


export { showToast, showBalloon, hideBalloon, showModal, hideModal };
