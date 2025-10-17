import { callGeminiAPI } from '../api.js';

export function getHTML() {
    return `
        <div class="bg-white h-full flex flex-col rounded-lg shadow">
            <h2 class="text-2xl font-bold p-4 border-b">AI Assistant Chat</h2>
            <div id="chat-window" class="flex-1 p-4 space-y-4 overflow-y-auto">
                <div class="p-3 bg-gray-200 rounded-lg self-start max-w-lg">Hello! How can I help you analyze your assortment plan today? Ask me anything about your current selections.</div>
            </div>
            <div class="p-4 border-t flex space-x-2">
                <input id="chat-input" type="text" placeholder="Ask about your plan..." class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button id="chat-send-btn" class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">Send</button>
            </div>
        </div>
    `;
}

export function init() {
    const chatInput = document.getElementById('chat-input');
    document.getElementById('chat-send-btn').addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
}

async function handleSendMessage() {
    const input = document.getElementById('chat-input');
    const chatWindow = document.getElementById('chat-window');
    const message = input.value.trim();
    if (message === '') return;

    // Add user message to window
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'p-3 bg-blue-500 text-white rounded-lg self-end max-w-lg ml-auto';
    userMessageDiv.textContent = message;
    chatWindow.appendChild(userMessageDiv);

    chatWindow.scrollTop = chatWindow.scrollHeight;
    input.value = '';
    
    // Add loading spinner for AI response
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'p-3 bg-gray-200 rounded-lg self-start max-w-lg';
    loadingDiv.innerHTML = `<div class="spinner"></div>`;
    chatWindow.appendChild(loadingDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    const response = await callGeminiAPI("CHAT_QUERY", { itemCount: window.state.planningCart.length, query: message });
    
    // Replace spinner with actual response
    loadingDiv.innerHTML = response;
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
