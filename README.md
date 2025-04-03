# Kibana Query AI Assistant

A Chrome extension that helps you write Elasticsearch queries using AI. This extension provides an AI-powered assistant that can help you generate and refine Elasticsearch queries based on your requirements.

## Features

- Command+K (Mac) or Ctrl+K (Windows/Linux) shortcut to open the AI assistant
- Natural language to Elasticsearch query conversion
- Thread-based conversation for query refinement
- One-click copy of generated queries
- Direct insertion of queries into Kibana console
- Modern and intuitive UI
- Support for both OpenAI GPT-4 and Google's Gemini Pro models

## Setup

1. Clone this repository or download the source code
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. Get your API keys:
   - OpenAI API key from [OpenAI's website](https://platform.openai.com/api-keys)
   - Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
6. Open `background.js` and replace:
   - `YOUR_API_KEY` with your OpenAI API key
   - `YOUR_GEMINI_API_KEY` with your Gemini API key

## Usage

1. Open Kibana and navigate to the Dev Tools console
2. Press Command+K (Mac) or Ctrl+K (Windows/Linux) to open the AI assistant
3. Select your preferred AI model from the dropdown (OpenAI GPT-4 or Gemini Pro)
4. Type your query requirement in natural language
5. The AI will generate an Elasticsearch query based on your requirement
6. Click "Copy Query" to copy the generated query
7. The query will be automatically inserted into the Kibana console at your cursor position
8. You can continue the conversation to refine the query if needed

## Example

User: "I want to find all documents where the status field is 'error' and the timestamp is within the last 24 hours"

AI Response:
```json
{
  "query": {
    "bool": {
      "must": [
        {
          "term": {
            "status": "error"
          }
        },
        {
          "range": {
            "timestamp": {
              "gte": "now-24h",
              "lte": "now"
            }
          }
        }
      ]
    }
  }
}
```

## Security Note

- Never share your API keys
- The extension only works on Kibana domains (https://*.elastic.co/*)
- All API calls are made securely through HTTPS
- Your selected AI model preference is saved locally

## Contributing

Feel free to submit issues and enhancement requests!

