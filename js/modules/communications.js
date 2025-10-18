import { callGeminiAPI } from '../api.js';

// --- STATE MANAGEMENT ---
const conversationHistories = {};
const unreadStatus = {}; // Tracks unread messages for each persona
let currentPersona = 'AI Assistant';

// --- DOM ELEMENTS ---
let chatPopup, openChatBtn, chatWindow, chatInput, chatSendBtn, userPillsContainer, modeToggle;

function init() {
    // Query for DOM elements once
    chatPopup = document.getElementById('chat-popup');
    openChatBtn = document.getElementById('open-chat-btn');
    chatWindow = document.getElementById('chat-window');
    chatInput = document.getElementById('chat-input');
    chatSendBtn = document.getElementById('chat-send-btn');
    userPillsContainer = document.getElementById('chat-user-selection');
    modeToggle = document.getElementById('chat-mode-toggle');

    if (!openChatBtn || !userPillsContainer) {
        console.error("Chat UI elements not found. Aborting initialization.");
        return;
    }

    // Attach event listeners
    openChatBtn.addEventListener('click', toggleChatPopup);
    chatSendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });
    userPillsContainer.addEventListener('click', handlePersonaChange);
    
    // Defer initialization until the next paint cycle to ensure all styles are applied
    requestAnimationFrame(() => {
        // Initialize the mode toggle functionality
        initModeToggle();
    
        // Set the initial active persona based on the DOM to ensure JS state is in sync
        const initialActivePill = userPillsContainer.querySelector('.user-pill.active');
        if (initialActivePill) {
            currentPersona = initialActivePill.dataset.persona;
        }
        
        // Pre-populate all conversations and mark them as unread
        initializeAllConversations();
    });
}

function initializeAllConversations() {
    const allPills = userPillsContainer.querySelectorAll('.user-pill');
    allPills.forEach(pill => {
        const persona = pill.dataset.persona;
        const isActive = pill.classList.contains('active');

        if (!conversationHistories[persona]) {
            conversationHistories[persona] = [{
                role: "assistant",
                parts: [{ text: `Hello! I'm the ${persona}. How can I assist you today?` }]
            }];
        }
        
        // A conversation is only unread if it's not the currently active one
        if (!isActive) {
            unreadStatus[persona] = true;
            pill.classList.add('has-unread');
        } else {
            unreadStatus[persona] = false; // The active conversation is considered "read"
        }
    });
    updateMainNotificationDot();
}


function toggleChatPopup() {
    const isOpen = chatPopup.classList.toggle('show');
    openChatBtn.classList.toggle('is-open');

    // If we are opening the chat, render the current conversation and mark it as read
    if (isOpen) {
        renderConversation();
        markConversationAsRead(currentPersona);
    }
}

function initModeToggle() {
    if (!modeToggle) return;
    
    const slider = document.getElementById('chat-mode-slider');
    const buttons = modeToggle.querySelectorAll('.chat-mode-btn');

    function setActiveButton(buttonEl) {
        if (!buttonEl) return;
        buttons.forEach(btn => btn.classList.remove('active'));
        buttonEl.classList.add('active');
        slider.style.width = `${buttonEl.offsetWidth}px`;
        slider.style.transform = `translateX(${buttonEl.offsetLeft - slider.offsetLeft}px)`;
        chatInput.placeholder = `Type your ${buttonEl.dataset.mode}...`;
    }

    const firstButton = buttons[0];
    // Use a small timeout to ensure the element has dimensions before calculating
    setTimeout(() => setActiveButton(firstButton), 50);

    modeToggle.addEventListener('click', (e) => {
        const clickedButton = e.target.closest('.chat-mode-btn');
        if (clickedButton) {
            setActiveButton(clickedButton);
        }
    });
}


function handlePersonaChange(e) {
    const pill = e.target.closest('.user-pill');
    if (pill && !pill.classList.contains('active')) {
        switchPersona(pill.dataset.persona, pill);
    }
}

function switchPersona(persona, pillElement) {
    currentPersona = persona;

    // Update active pill
    const currentActivePill = userPillsContainer.querySelector('.user-pill.active');
    if(currentActivePill) currentActivePill.classList.remove('active');
    pillElement.classList.add('active');
    
    markConversationAsRead(persona);
    renderConversation();
}

function renderConversation() {
    chatWindow.innerHTML = '';
    const history = conversationHistories[currentPersona] || [];
    history.forEach(message => {
        const messageType = message.role === 'user' ? 'sent' : 'received';
        addMessageToChat(message.parts[0].text, messageType);
    });
    scrollToBottom();
}

// --- UNREAD MESSAGE LOGIC ---
function markConversationAsRead(persona) {
    unreadStatus[persona] = false;
    const pill = userPillsContainer.querySelector(`.user-pill[data-persona="${persona}"]`);
    if (pill) {
        pill.classList.remove('has-unread');
    }
    updateMainNotificationDot();
}

function setConversationAsUnread(persona) {
    // Only set as unread if the chat popup is currently hidden OR the user is in a different conversation
    if (!chatPopup.classList.contains('show') || currentPersona !== persona) {
        unreadStatus[persona] = true;
        const pill = userPillsContainer.querySelector(`.user-pill[data-persona="${persona}"]`);
        if (pill) {
            pill.classList.add('has-unread');
        }
        updateMainNotificationDot();
    }
}

function updateMainNotificationDot() {
    const hasAnyUnread = Object.values(unreadStatus).some(status => status);
    if (hasAnyUnread) {
        openChatBtn.classList.add('has-unread-main');
    } else {
        openChatBtn.classList.remove('has-unread-main');
    }
}
// --- END UNREAD LOGIC ---


async function handleSendMessage() {
    const messageText = chatInput.value.trim();
    if (messageText === '') return;

    // Add user message to history and UI
    if (!conversationHistories[currentPersona]) {
        conversationHistories[currentPersona] = [];
    }
    conversationHistories[currentPersona].push({ role: 'user', parts: [{ text: messageText }] });
    addMessageToChat(messageText, 'sent');
    chatInput.value = '';
    scrollToBottom();

    const receivingPersona = currentPersona; // Capture the persona at the time of sending
    const loadingBubble = addMessageToChat('', 'received-loading');

    try {
        const responseText = await callGeminiAPI(receivingPersona, conversationHistories[receivingPersona]);
        
        conversationHistories[receivingPersona].push({ role: 'assistant', parts: [{ text: responseText }] });
        
        // Only update the bubble if the user is still in the same conversation
        if (receivingPersona === currentPersona) {
             loadingBubble.classList.remove('received-loading');
             loadingBubble.innerHTML = responseText;
        }
       
        setConversationAsUnread(receivingPersona);

    } catch (error) {
        console.error("API call failed:", error);
        if (receivingPersona === currentPersona) {
            loadingBubble.classList.remove('received-loading');
            loadingBubble.textContent = "Sorry, I encountered an error. Please try again.";
        }
    }
    
    scrollToBottom();
}

function addMessageToChat(text, type) {
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${type}`;
    
    if (type === 'received-loading') {
        bubble.innerHTML = `<div class="spinner-dots"><div></div><div></div><div></div></div>`;
    } else {
        bubble.innerHTML = text; // Use innerHTML to allow for formatting like lists
    }
    
    chatWindow.appendChild(bubble);
    return bubble;
}

function scrollToBottom() {
    chatWindow.scrollTop = chatWindow.scrollHeight;
}


// --- EXPORT ---
export { init };

