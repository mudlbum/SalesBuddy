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

    balloonContainer.innerHTML = content;
    balloonContainer.style.display = 'block';

    // Position the balloon.
    // We position it above the target icon.
    const top = targetRect.top + window.scrollY - 10; // 10px offset
    const left = targetRect.left + window.scrollX + (targetRect.width / 2);
    
    balloonContainer.style.top = `${top}px`;
    balloonContainer.style.left = `${left}px`;
    
    // Clear any old listener
    balloonContainer.onmouseleave = null;
    // Add new listener to hide when mouse leaves balloon
    balloonContainer.onmouseleave = () => {
        const activeIcon = document.querySelector('.is-showing-balloon');
        if (activeIcon) {
            activeIcon.classList.remove('is-showing-balloon');
        }
        hideBalloon();
    };
    
    // Animate it in
    requestAnimationFrame(() => {
        balloonContainer.classList.add('visible');
    });

    // Automatically hide after a delay to prevent it from staying open.
    hideBalloonTimeout = setTimeout(hideBalloon, 8000); // Hide after 8 seconds
}

/**
 * Hides the AI suggestion balloon.
 */
function hideBalloon() {
    if (!balloonContainer) return;
    
    // Check if it's already hidden to avoid redundant calls
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