// require('dotenv').config();
// console.log(process.env.API_KEY);
const API_TOKEN =`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`;
const MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.2";
const inp = document.getElementById("dynamicInput");
const out = document.getElementById("res");
const arw = document.getElementById("arw");
let prompt = "";
let isCalled = false;

arw.addEventListener("click", ()=>{
  console.log('clicked');
  callapi();
});

async function callapi() {
  if (isCalled) return;
  out.innerHTML = "LOADING...";
  prompt = inp.value;
  inp.value = "";
  adjustHeight();
  queryMistral(prompt).then(
    (response) =>
      (out.innerText = response.substring(
        response.indexOf(`<s>[INST] ${prompt} [/INST]`) +
          `<s>[INST] ${prompt} [/INST]`.length +
          1
      ))
  );
}

inp.addEventListener("input", adjustHeight);

async function queryMistral(prompt) {
  isCalled = true;
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
          inputs: `<s>[INST] ${prompt} [/INST]`,
          parameters: {
            max_new_tokens: 2000,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();
    isCalled = false;
    return data[0]?.generated_text || "Error: No response";
  } catch (error) {
    console.error("API Error:", error);
    isCalled = false;
    return "Error: Failed to fetch response";
  }
}

function adjustHeight() {
  inp.style.height = "auto";
  inp.style.height = inp.scrollHeight + "px";
}
