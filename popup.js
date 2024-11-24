```javascript
document.getElementById("save-key").addEventListener("click", () => {
  const apiKey = document.getElementById("api-key").value;
  chrome.storage.local.set({ apiKey }, () => {
    document.getElementById("status").innerText = "API key saved.";
    setTimeout(() => {
      document.getElementById("status").innerText = "";
    }, 2000);
  });
});

document.getElementById("save-model").addEventListener("click", () => {
  const selectedModel = document.getElementById("model-select").value;
  chrome.storage.local.set({ selectedModel }, () => {
    document.getElementById("status").innerText = "Model saved.";
    setTimeout(() => {
      document.getElementById("status").innerText = "";
    }, 2000);
  });
});

document.getElementById("save-temperature").addEventListener("click", () => {
  const temperature = parseFloat(document.getElementById("temperature").value);
  chrome.storage.local.set({ temperature }, () => {
    document.getElementById("status").innerText = "Temperature saved.";
    setTimeout(() => {
      document.getElementById("status").innerText = "";
    }, 2000);
  });
});

document.getElementById("save-max-tokens").addEventListener("click", () => {
  const maxTokens = parseInt(document.getElementById("max-tokens").value, 10);
  chrome.storage.local.set({ maxTokens }, () => {
    document.getElementById("status").innerText = "Max Tokens saved.";
    setTimeout(() => {
      document.getElementById("status").innerText = "";
    }, 2000);
  });

  
});document.getElementById("view-history").addEventListener("click", () => {
  chrome.storage.local.get({ history: [] }, (items) => {
    const historyList = document.getElementById("history");
    historyList.innerHTML = "";
    items.history.forEach(entry => {
      const li = document.createElement("li");
      li.innerText = `[${entry.timestamp}] Q: ${entry.question} - A: ${entry.answer}`;
      historyList.appendChild(li);
    });
  });
});
```

