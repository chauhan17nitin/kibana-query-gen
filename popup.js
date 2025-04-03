document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup loaded'); // Debug log
  const chatContainer = document.getElementById('chatContainer');
  const userInput = document.getElementById('userInput');
  const sendButton = document.getElementById('sendButton');
  const modelSelect = document.getElementById('modelSelect');
  let conversationHistory = [];

  console.log('Initializing popup'); // Debug log
  // Load conversation history and selected model from storage
  chrome.storage.local.get(['conversationHistory', 'selectedModel'], (result) => {
    if (result.conversationHistory) {
      conversationHistory = result.conversationHistory;
      displayConversation();
    }
    if (result.selectedModel) {
      modelSelect.value = result.selectedModel;
    }
  });

  // Save selected model when changed
  modelSelect.addEventListener('change', () => {
    chrome.storage.local.set({ selectedModel: modelSelect.value });
  });

  function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;
    
    if (isUser) {
      messageDiv.textContent = content;
    } else {
      // Check if the content contains a JSON query
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const jsonContent = jsonMatch[1];
        const codeBlock = document.createElement('div');
        codeBlock.className = 'code-block';
        codeBlock.textContent = jsonContent;
        
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy Query';
        copyButton.onclick = () => {
          navigator.clipboard.writeText(jsonContent);
          copyButton.textContent = 'Copied!';
          setTimeout(() => {
            copyButton.textContent = 'Copy Query';
          }, 2000);
        };
        
        messageDiv.appendChild(codeBlock);
        messageDiv.appendChild(copyButton);
      } else {
        messageDiv.textContent = content;
      }
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function displayConversation() {
    chatContainer.innerHTML = '';
    conversationHistory.forEach((message, index) => {
      addMessage(message.content, index % 2 === 0);
    });
  }

  async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    console.log('Sending message:', message); // Debug log

    // Disable input and button while processing
    userInput.disabled = true;
    sendButton.disabled = true;

    // Add user message to UI
    addMessage(message, true);
    userInput.value = '';

    // Add user message to history
    conversationHistory.push({ role: 'user', content: message });
    console.log('Updated conversation history:', conversationHistory); // Debug log

    try {
      // Send message to background script for API call
      console.log('Sending request to background script...'); // Debug log
      const response = await chrome.runtime.sendMessage({
        type: 'sendToOpenAI',
        message: message,
        history: conversationHistory,
        model: modelSelect.value
      });

      console.log('Received response from background script:', response); // Debug log

      // Add assistant response to UI and history
      addMessage(response.content);
      conversationHistory.push({ role: 'assistant', content: response.content });

      // Save updated history to storage
      chrome.storage.local.set({ conversationHistory });
      console.log('Saved updated conversation history to storage.'); // Debug log
    } catch (error) {
      console.error('Error:', error);
      addMessage('Sorry, there was an error processing your request. Please try again. error: ' + error );
    } finally {
      // Re-enable input and button
      userInput.disabled = false;
      sendButton.disabled = false;
      userInput.focus();
      console.log('Input and button re-enabled.'); // Debug log
    }
  }

  // Event listeners
  sendButton.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => {
    console.log('Key pressed:', e.key); // Debug log
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}); 