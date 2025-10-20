// --- AI SUGGESTION BALLOON ---
// FIXED: ID now matches 'dashboard.html'
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

    balloonContainer.innerHTML = content;
    balloonContainer.style.display = 'block';

    // Position the balloon.
    const top = targetRect.top + window.scrollY - 10; // 10px offset
    const left = targetRect.left + window.scrollX + (targetRect.width / 2);
    
    balloonContainer.style.top = `${top}px`;
    balloonContainer.style.left = `${left}px`;
    
    // Add listener to balloon to keep it open when mouse enters
    balloonContainer.onmouseleave = () => {
        hideBalloon();
    };
    
    // Animate it in
    requestAnimationFrame(() => {
        balloonContainer.classList.add('visible');
    });

    // Set a timeout to hide after a delay
    hideBalloonTimeout = setTimeout(hideBalloon, 5000); // 5 seconds
}

/**
 * Hides the AI suggestion balloon.
 */
function hideBalloon() {
    if (!balloonContainer) return;

    // If already hidden, do nothing
    if (!balloonContainer.classList.contains('visible')) {
        return;
    }
    
    balloonContainer.classList.remove('visible');
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


export { showToast, showBalloon, hideBalloon };