/* Background JavaScript (background.js) */
```javascript
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "askChatGPT",
    title: "Ask ChatGPT",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "askChatGPT" && info.selectionText) {
    const apiKey = await getAPIKey();
    const selectedModel = await getSelectedModel();
    const customTemperature = await getCustomTemperature();
    const customMaxTokens = await getCustomMaxTokens();

    try {
      const response = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: info.selectionText,
          temperature: customTemperature,
          max_tokens: customMaxTokens
        })
      });

      if (response.ok) {
        const data = await response.json();
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: showAlert,
          args: [data.choices[0].text]
        });
      } else {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: showAlert,
          args: ["Failed to fetch answer. Please try again."]
        });
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  }
});

function showAlert(message) {
  alert(message);
}

async function getAPIKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get("apiKey", (items) => {
      resolve(items.apiKey);
    });
  });
}

async function getSelectedModel() {
  return new Promise((resolve) => {
    chrome.storage.local.get("selectedModel", (items) => {
      resolve(items.selectedModel || "gpt-3.5-turbo");
    });
  });
}

async function getCustomTemperature() {
  return new Promise((resolve) => {
    chrome.storage.local.get("temperature", (items) => {
      resolve(items.temperature || 0.7);
    });
  });
}

async function getCustomMaxTokens() {
  return new Promise((resolve) => {
    chrome.storage.local.get("maxTokens", (items) => {
      resolve(items.maxTokens || 100);
    });
  });
}
```
