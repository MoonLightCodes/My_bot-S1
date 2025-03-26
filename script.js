// require('dotenv').config();
// console.log(process.env.API_KEY);
const API_TOKEN = `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`;
const MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.2";
const inp = document.getElementById("dynamicInput");
const out = document.getElementById("res");
const arw = document.getElementById("arw");
const loder = document.getElementById("loading");
let prompt = "";
let isCalled = false;
let loding = false;

//console.log(loder);
arw.addEventListener("click", () => {
  // if(inp.innerText.toString().trim()==='')return;

  callapi();
});

function addItem(){

}
async function callapi() {
  if (isCalled) return;
  prompt = inp.value;
  inp.value = "";
  out.innerText = "";
  adjustHeight();
  loder.style.display = "block"
  let ans;
  queryMistral(prompt)
    .then((response) => {
      ans = response.substring(
        response.indexOf(`<s>[INST] ${prompt} [/INST]`) +
          `<s>[INST] ${prompt} [/INST]`.length +
          1
      );
      ans = ans.split(" ");
      ans.forEach((x, i) => {
        setTimeout(() => {
          out.innerText = out.innerText + " " + x;
        }, 50 * i);
      });
    })
    .catch((e) => {
      out.innerText = "Error: Failed to fetch response.";
      console.log(e);
    })
    .finally(() => {
      loder.style.display = "none";
    });
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
