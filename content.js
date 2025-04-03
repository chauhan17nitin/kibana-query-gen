// Listen for keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Check for Command+K (Mac) or Ctrl+K (Windows/Linux)
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    
    // Check if we're in the Kibana console
    const isKibanaConsole = window.location.pathname.includes('/app/dev_tools');
    if (!isKibanaConsole) {
      return;
    }

    // Open the extension popup
    chrome.runtime.sendMessage({ type: 'openPopup' });
  }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'insertQuery') {
    insertQueryIntoConsole(request.query);
  }
});

function insertQueryIntoConsole(query) {
  // Find the console input element
  const consoleInput = document.querySelector('.monaco-editor');
  if (!consoleInput) {
    console.error('Could not find Kibana console input');
    return;
  }

  // Get the Monaco editor instance
  const editor = consoleInput.querySelector('.monaco-editor').__mono_editor;
  if (!editor) {
    console.error('Could not find Monaco editor instance');
    return;
  }

  // Insert the query at the current cursor position
  const position = editor.getPosition();
  editor.executeEdits('', [{
    range: {
      startLineNumber: position.lineNumber,
      startColumn: position.column,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    },
    text: query
  }]);
} 