document.addEventListener("DOMContentLoaded", () => {
  const questions = document.querySelectorAll("h2, h3, p");

  questions.forEach(question => {
    if (isQuestion(question.innerText)) {
      question.addEventListener("mouseover", handleMouseOver);
    }
  });
});

let currentQuestion = null;
let isLoading = false;
let floatingBox = null;

async function handleMouseOver(event) {
  const question = event.target;
  if (isLoading || currentQuestion === question) return;
  currentQuestion = question;
  isLoading = true;

  showLoadingIndicator(question);
  const apiKey = await getAPIKey();
  if (!apiKey) {
    isLoading = false;
    return;
  }

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
        prompt: sanitizeInput(question.innerText),
        temperature: customTemperature,
        max_tokens: customMaxTokens
      })
    });

    if (response.ok) {
      const data = await response.json();
      saveInteraction(question.innerText, data.choices[0].text);
      showAnswerBox(question, data.choices[0].text);
    } else {
      showErrorBox(question, "Failed to fetch answer. Please try again.");
    }
  } catch (error) {
    logError(error);
    showErrorBox(question, "An error occurred. Check the console for details.");
  } finally {
    isLoading = false;
  }
}

function isQuestion(text) {
  const questionWords = ["what", "why", "how", "when", "who", "where", "which", "is", "can", "could", "should"];
  return questionWords.some(word => text.toLowerCase().startsWith(word));
}

function showAnswerBox(question, answer) {
  let floatingBox = getOrCreateFloatingBox();
  floatingBox.innerText = answer;
  styleFloatingBox(floatingBox, "#333", "1px solid #4caf50", "#fff");

  positionFloatingBox(question, floatingBox);
}

function showLoadingIndicator(question) {
  let floatingBox = getOrCreateFloatingBox();
  floatingBox.innerText = "Loading...";
  styleFloatingBox(floatingBox, "#444", "1px solid #ffc107", "#fff");

  positionFloatingBox(question, floatingBox);
}

function showErrorBox(question, errorMessage) {
  let floatingBox = getOrCreateFloatingBox();
  floatingBox.innerText = errorMessage;
  styleFloatingBox(floatingBox, "#550000", "1px solid #f44336", "#fff");

  positionFloatingBox(question, floatingBox);
}

function getOrCreateFloatingBox() {
  if (!floatingBox) {
    floatingBox = document.createElement("div");
    floatingBox.id = "floating-answer-box";
    floatingBox.style.position = "absolute";
    floatingBox.style.padding = "10px";
    floatingBox.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.8)";
    floatingBox.style.zIndex = "10000";
    floatingBox.style.transition = "background 0.3s ease, border 0.3s ease";
    floatingBox.style.borderRadius = "8px";
    floatingBox.style.cursor = "grab";
    floatingBox.draggable = true;

    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.marginLeft = "10px";
    closeButton.style.padding = "5px 10px";
    closeButton.style.background = "#444";
    closeButton.style.color = "#fff";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    closeButton.style.borderRadius = "4px";
    floatingBox.appendChild(closeButton);

    closeButton.addEventListener("click", () => {
      floatingBox.remove();
      floatingBox = null;
    });

    document.body.appendChild(floatingBox);
  }
  return floatingBox;
}

function styleFloatingBox(floatingBox, backgroundColor, borderColor, textColor) {
  floatingBox.style.background = backgroundColor;
  floatingBox.style.border = borderColor;
  floatingBox.style.color = textColor;
}

function positionFloatingBox(question, floatingBox) {
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  const updatePosition = debounce(e => {
    floatingBox.style.left = e.pageX + 15 + "px";
    floatingBox.style.top = e.pageY + 15 + "px";
  }, 10);

  question.addEventListener("mousemove", updatePosition);
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

function sanitizeInput(input) {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

function saveAPIKey(apiKey) {
  chrome.storage.local.set({ apiKey });
}

function saveSelectedModel(model) {
  chrome.storage.local.set({ selectedModel: model });
}

function saveInteraction(question, answer) {
  chrome.storage.local.get({ history: [] }, (items) => {
    const newHistory = items.history;
    newHistory.push({ question, answer, timestamp: new Date().toISOString() });
    chrome.storage.local.set({ history: newHistory });
  });
}

function logError(error) {
  console.error("ChatGPT Hover Script Error:", error);
  let consoleContainer = document.querySelector("#console-container");
  if (!consoleContainer) {
    consoleContainer = document.createElement("div");
    consoleContainer.id = "console-container";
    consoleContainer.style.position = "fixed";
    consoleContainer.style.bottom = "0";
    consoleContainer.style.right = "0";
    consoleContainer.style.width = "300px";
    consoleContainer.style.height = "200px";
    consoleContainer.style.background = "#222";
    consoleContainer.style.color = "#fff";
    consoleContainer.style.overflow = "auto";
    consoleContainer.style.padding = "10px";
    consoleContainer.style.fontSize = "12px";
    consoleContainer.style.zIndex = "10001";
    consoleContainer.style.borderRadius = "8px";

    const collapseButton = document.createElement("button");
    collapseButton.innerText = "Collapse";
    collapseButton.style.marginBottom = "5px";
    collapseButton.style.background = "#444";
    collapseButton.style.color = "#fff";
    collapseButton.style.border = "none";
    collapseButton.style.cursor = "pointer";
    collapseButton.style.padding = "5px 10px";
    collapseButton.style.borderRadius = "4px";
    consoleContainer.appendChild(collapseButton);

    collapseButton.addEventListener("click", () => {
      if (consoleContainer.style.height === "200px") {
        consoleContainer.style.height = "30px";
        collapseButton.innerText = "Expand";
      } else {
        consoleContainer.style.height = "200px";
        collapseButton.innerText = "Collapse";
      }
    });

    document.body.appendChild(consoleContainer);
  }
  const errorLine = document.createElement("div");
  errorLine.innerText = `[Error] ${error.message}`;
  consoleContainer.appendChild(errorLine);
}
