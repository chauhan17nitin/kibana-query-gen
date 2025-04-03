// Replace with your API keys
const OPENAI_API_KEY = 'sk-proj-1234567890';
const GEMINI_API_KEY = 'api-key-1234567890';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received request:", request);
  console.log("Sender:", sender);

  if (request.type === 'sendToOpenAI') {
    const model = request.model || 'openai';
    console.log("Model selected:", model);

    if (model === 'openai') {
      console.log("Sending message to OpenAI:", request.message);
      sendToOpenAI(request.message, request.history)
        .then(response => {
          console.log("Received response from OpenAI:", response);
          sendResponse(response);
        })
        .catch(error => {
          console.error("Error from OpenAI:", error);
          sendResponse({ error: error.message });
        });
    } else if (model === 'gemini') {
      console.log("Sending message to Gemini:", request.message);
      sendToGemini(request.message, request.history)
        .then(response => {
          console.log("Received response from Gemini:", response);
          sendResponse(response);
        })
        .catch(error => {
          console.error("Error from Gemini:", error);
          sendResponse({ error: error.message });
        });
    }
    return true; // Will respond asynchronously
  } else {
    console.warn("Unknown request type:", request.type);
  }
});

async function sendToOpenAI(message, history) {
  const messages = [
    {
      role: "system",
      content: "You are an expert in Elasticsearch queries. Your task is to help users write raw Elasticsearch queries based on their requirements. Always format your response with the query in a JSON code block. Include explanations of the query structure and any important considerations."
    },
    ...history.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    {
      role: "user",
      content: message
    }
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content
    };
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}

async function sendToGemini(message, history) {
  console.log('sendToGemini called with message:', message);
  console.log('History:', history);

  // Convert history to Gemini format
  const prompt = history.map(msg => {
    return `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`;
  }).join('\n') + `\nHuman: ${message}`;
  
  console.log('Generated prompt for Gemini:', prompt);
  console.log('GEMINI_API_KEY:', GEMINI_API_KEY);

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert in Elasticsearch queries. Your task is to help users write raw Elasticsearch queries based on their requirements. Always format your response with the query in a JSON code block. Include explanations of the query structure and any important considerations.\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      })
    });

    console.log('Response from Gemini API:', response);

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Data received from Gemini:', data);
    
    return {
      content: data.candidates[0].content.parts[0].text
    };
  } catch (error) {
    console.error('Error calling Gemini:', error);
    throw error;
  }
} 