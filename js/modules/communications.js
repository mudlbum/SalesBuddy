import { callGeminiAPI } from '../api.js';
import { addTask, reRenderTaskBoard as reRenderOpsBoard } from './operations.js';
import { showToast } from '../utils.js';

// --- STATE MANAGEMENT ---
const conversationHistories = {};
const unreadStatus = {}; // Tracks unread messages for each persona
let currentPersona = 'AI Assistant';
let isToggleInitialized = false; // Flag to check if the toggle has been set up

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
    
    // Initialize the mode toggle functionality (event listeners only)
    initModeToggle();

    // Set the initial active persona based on the DOM
    const initialActivePill = userPillsContainer.querySelector('.user-pill.active');
    if (initialActivePill) {
        currentPersona = initialActivePill.dataset.persona;
    }
    
    // Pre-populate all conversations and mark them as unread to show notification dots on load
    initializeAllConversations();
}

function initializeAllConversations() {
    const allPills = userPillsContainer.querySelectorAll('.user-pill');
    allPills.forEach(pill => {
        const persona = pill.dataset.persona;
        const isActive = pill.classList.contains('active');

        if (!conversationHistories[persona]) {
            let welcomeMessage = `Hello! I'm the ${persona}. How can I assist you today?`;
            if (persona === 'AI Assistant') {
                welcomeMessage = "Hello! I'm SalesBuddy. I can help you manage tasks, get insights, and more. How can I help?";
            }
            conversationHistories[persona] = [{
                role: "assistant",
                parts: [{ text: welcomeMessage }]
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

    // If we are opening the chat...
    if (isOpen) {
        // ...render the current conversation...
        renderConversation();
        // ...mark it as read...
        markConversationAsRead(currentPersona);
        // ...and initialize the toggle slider's position for the first time.
        if (!isToggleInitialized) {
            const firstButton = modeToggle.querySelector('.chat-mode-btn');
            setActiveButton(firstButton);
            isToggleInitialized = true;
        }
    }
}

function initModeToggle() {
    if (!modeToggle) return;
    
    modeToggle.addEventListener('click', (e) => {
        const clickedButton = e.target.closest('.chat-mode-btn');
        if (clickedButton) {
            setActiveButton(clickedButton);
        }
    });
}

function setActiveButton(buttonEl) {
    if (!buttonEl || !modeToggle) return;
    
    const slider = document.getElementById('chat-mode-slider');
    const buttons = modeToggle.querySelectorAll('.chat-mode-btn');
    
    // Check for visibility. If not visible, we can't calculate position.
    if (buttonEl.offsetWidth === 0) return;

    buttons.forEach(btn => btn.classList.remove('active'));
    buttonEl.classList.add('active');
    
    // The slider is positioned relative to the toggle container.
    // We calculate the button's left position relative to the container and subtract the slider's own starting offset.
    const containerPadding = 4; // Corresponds to p-1 in Tailwind
    slider.style.width = `${buttonEl.offsetWidth}px`;
    slider.style.transform = `translateX(${buttonEl.offsetLeft - containerPadding}px)`;
    
    chatInput.placeholder = `Type your ${buttonEl.dataset.mode}...`;
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

    // Command Parsing for task creation
    const lowerCaseMessage = messageText.toLowerCase();
    if ((lowerCaseMessage.startsWith("create task") || lowerCaseMessage.startsWith("add task") || lowerCaseMessage.startsWith("new task")) && currentPersona === 'AI Assistant') {
        const taskDescription = messageText.replace(/^(create task|add task|new task)\s*(to)?\s*/i, '');

        if (taskDescription) {
            const newTask = addTask({
                task: taskDescription.charAt(0).toUpperCase() + taskDescription.slice(1),
                assignedTo: 'Jane D.', // Default for demo
                dueDate: new Date().toISOString().slice(0, 10),
                priority: 'Medium'
            });
            
            addMessageToChat(messageText, 'sent');
            const confirmation = `Okay, I've added the task: "${newTask.task}". You can see it in the Operations module.`;
            addMessageToChat(confirmation, 'received');
            
            if (window.location.hash.substring(1) === 'operations') {
                reRenderOpsBoard(newTask.id);
            } else {
                showToast("New task created in Operations module!");
            }
            
            conversationHistories[currentPersona].push({ role: 'user', parts: [{ text: messageText }]});
            conversationHistories[currentPersona].push({ role: 'assistant', parts: [{ text: confirmation }]});

            chatInput.value = '';
            scrollToBottom();
            return; 
        }
    }

    // Add user message to history and UI
    if (!conversationHistories[currentPersona]) {
        conversationHistories[currentPersona] = [];
    }
    conversationHistories[currentPersona].push({ role: 'user', parts: [{ text: messageText }] });
    addMessageToChat(messageText, 'sent');
    chatInput.value = '';
    scrollToBottom();

    const receivingPersona = currentPersona;
    const loadingBubble = addMessageToChat('', 'received-loading');
    
    // Get current module for contextual responses
    const currentModuleId = window.location.hash.substring(1) || 'assortment-planning';

    try {
        const responseText = await callGeminiAPI(receivingPersona, conversationHistories[receivingPersona], { moduleId: currentModuleId });
        
        conversationHistories[receivingPersona].push({ role: 'assistant', parts: [{ text: responseText }] });
        
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
        bubble.innerHTML = `<div class="spinner-dots-small"><div></div><div></div><div></div></div>`;
    } else {
        bubble.innerHTML = text;
    }
    
    chatWindow.appendChild(bubble);
    return bubble;
}

function scrollToBottom() {
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function triggerProactiveMessage(message, persona = 'AI Assistant') {
    if (!conversationHistories[persona]) {
        conversationHistories[persona] = [];
    }
    // Avoid adding duplicate proactive messages
    if (conversationHistories[persona].some(m => m.parts[0].text === message && m.role === 'assistant')) {
        return;
    }

    conversationHistories[persona].push({ role: 'assistant', parts: [{ text: message }] });
    setConversationAsUnread(persona);
}


// --- EXPORT ---
export { init, triggerProactiveMessage };
