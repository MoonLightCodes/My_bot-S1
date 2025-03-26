const API_TOKEN = "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";
const MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.2";
const holder = document.getElementById("holder");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const loading = document.getElementById("loading");
let isL = false;

window.onload=()=>{
  const loader = loading.querySelectorAll('*');
  loader.forEach((e,i)=>{
    e.style.backgroundColor= `rgb(0,${(i*10)+90},${(i*10)+90})`;
    e.style.transform= `translate(-50%, -50%) rotate(${i*60}deg) translate(20px)`;
  })
}

async function handleSend() {
  const prompt = userInput.value.trim();
  if (!prompt || isL) return;

  isL = true;
  addMessage(prompt, true);
  userInput.value = "";
  adjustInputHeight();

  loading.style.display = "block";

  try {
    const response = await queryModel(prompt);
    addMessage(response, false);
  } catch (error) {
    addMessage(`Error: ${error.message}`, false);
  } finally {
    loading.style.display = "none";
  }
}

async function queryModel(prompt) {
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.7,
          },
        }),
      }
    );
    if (response.status === 402) {
      throw new Error("Payment required - switch to free model");
    }
    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();
    return (
      data[0]?.generated_text?.replace(`<s>[INST] ${prompt} [/INST]`, "") ||
      "No response"
    );
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

function addMessage(text, isUser) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isUser ? "user-message" : "bot-message"}`;
  messageDiv.textContent = "";
  holder.appendChild(messageDiv);
  if (!isUser) {
    typeText(messageDiv, text).finally(() => {
      isL = false;
      holder.scrollTop = holder.scrollHeight;
    });
  }else{
    messageDiv.textContent = text;
  }
}

async function typeText(element, text) {
  const words = text.split(" "); 
  let currentLength = 0;

  return new Promise((resolve) => {
    words.forEach((word, index) => {
      setTimeout(() => {
        element.textContent += (index === 0 ? "" : " ") + word;
        currentLength += word.length + 1;

        if (currentLength > 50 || index === words.length - 1) {
          holder.scrollTop = holder.scrollHeight;
          currentLength = 0;
        }

        if (index === words.length - 1) resolve();
      }, 50 * index); 
    });
  });
}
function adjustInputHeight() {
  userInput.style.height = "auto";
  userInput.style.height = userInput.scrollHeight + "px";
}

sendButton.addEventListener("click", handleSend);
userInput.addEventListener("input", adjustInputHeight);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});
