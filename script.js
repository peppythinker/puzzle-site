const randomTab = document.getElementById("randomTab");
const customTab = document.getElementById("customTab");
const randomControls = document.getElementById("randomControls");
const customControls = document.getElementById("customControls");

const newPuzzleBtn = document.getElementById("newPuzzleBtn");
const nextRandomBtn = document.getElementById("nextRandomBtn");
const generateBtn = document.getElementById("generateBtn");
const phraseInput = document.getElementById("phraseInput");

const puzzleBoard = document.getElementById("puzzleBoard");
const checkAnswerBtn = document.getElementById("checkAnswerBtn");
const showAnswerBtn = document.getElementById("showAnswerBtn");
const resultMessage = document.getElementById("resultMessage");
const gameSection = document.querySelector(".game-section");

const randomPhrases = [
  "SMILE",
  "HAPPY",
  "LEARN",
  "MATH",
  "PUZZLE",
  "BRAIN",
  "LOGIC",
  "HELLO",
  "NUMBER",
  "GAMES"
];

let decodedLetters = [];
let currentMode = "random";
let currentPhrase = "";
let currentLetters = [];

function setMode(mode) {
  currentMode = mode;

  randomTab.classList.toggle("active", mode === "random");
  customTab.classList.toggle("active", mode === "custom");

  randomControls.classList.toggle("active", mode === "random");
  customControls.classList.toggle("active", mode === "custom");

  nextRandomBtn.classList.toggle("hidden", mode !== "random");

  // show custom input area again when user switches back to custom mode
  if (mode === "custom") {
    customControls.style.display = "";
  }

  clearMessage();
}

function sanitizePhrase(text) {
  return text.toUpperCase().replace(/[^A-Z]/g, "");
}

function letterToNumber(letter) {
  return letter.charCodeAt(0) - 64;
}

function makeProblemForNumber(target) {
  let a;
  let b;

  if (target === 1) {
    return { a: 1, b: 0, answer: 1 };
  }

  a = Math.floor(Math.random() * (target - 1)) + 1;
  b = target - a;

  return { a, b, answer: target };
}

function buildPuzzle(phrase) {
  currentPhrase = phrase;
  currentLetters = phrase.split("");

decodedLetters = new Array(currentLetters.length).fill("_");
updateDecodedPhrase();
  
  puzzleBoard.innerHTML = "";

  currentLetters.forEach((letter, index) => {
    const answerNumber = letterToNumber(letter);
    const problem = makeProblemForNumber(answerNumber);

    const card = document.createElement("div");
    card.className = "puzzle-card";
    card.dataset.index = index;
    card.dataset.answer = letter;

    const math = document.createElement("div");
    math.className = "math-problem";
    math.textContent = `${problem.a} + ${problem.b} = ?`;

    const input = document.createElement("input");
    input.className = "letter-box";
    input.type = "number";
    input.maxLength = 2;
    input.autocomplete = "off";
    input.dataset.index = index;
    input.setAttribute("aria-label", `Letter ${index + 1}`);

    input.addEventListener("input", handleLetterInput);
    input.addEventListener("keydown", handleLetterKeydown);

    card.appendChild(math);
    card.appendChild(input);
    puzzleBoard.appendChild(card);
  });

  const firstInput = puzzleBoard.querySelector(".letter-box");
  if (firstInput) {
    firstInput.focus();
  }
}

function handleLetterInput(event) {
  const input = event.target;
  input.value = input.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1);

  const card = input.closest(".puzzle-card");
  const expected = card.dataset.answer;

  if (input.value === expected) {
    card.classList.add("correct");
  } else {
    card.classList.remove("correct");
  }

  if (input.value) {
    const allInputs = [...document.querySelectorAll(".letter-box")];
    const currentIndex = allInputs.indexOf(input);
    const nextInput = allInputs[currentIndex + 1];
    if (nextInput) {
      nextInput.focus();
    }
  }

  clearMessage();
}

function handleLetterKeydown(event) {
  const input = event.target;
  const allInputs = [...document.querySelectorAll(".letter-box")];
  const currentIndex = allInputs.indexOf(input);

  if (event.key === "Backspace" && input.value === "" && currentIndex > 0) {
    allInputs[currentIndex - 1].focus();
  }

  if (event.key === "ArrowLeft" && currentIndex > 0) {
    allInputs[currentIndex - 1].focus();
  }

  if (event.key === "ArrowRight" && currentIndex < allInputs.length - 1) {
    allInputs[currentIndex + 1].focus();
  }
}

function getUserAnswer() {
  return [...document.querySelectorAll(".letter-box")]
    .map((input) => input.value.toUpperCase())
    .join("");
}

function checkAnswer() {
  if (!currentPhrase) {
    showMessage("Please start a puzzle first.", "error");
    return;
  }

  const userAnswer = getUserAnswer();

  if (userAnswer.length !== currentPhrase.length) {
    showMessage("Fill in all the letter boxes first.", "error");
    return;
  }

  if ([...document.querySelectorAll(".letter-box")].some((input) => input.value === "")) {
    showMessage("Fill in all the letter boxes first.", "error");
    return;
  }

  if (userAnswer === currentPhrase) {
    document.querySelectorAll(".puzzle-card").forEach((card) => {
      card.classList.add("correct");
    });
    showMessage(`🎉 Correct! The phrase is ${currentPhrase}`, "success");
  } else {
    showMessage("Not quite — try again.", "error");
  }
}

function showAnswer() {
  if (!currentPhrase) {
    showMessage("Please start a puzzle first.", "error");
    return;
  }

  const inputs = document.querySelectorAll(".letter-box");
  const cards = document.querySelectorAll(".puzzle-card");

  inputs.forEach((input, index) => {
    input.value = currentLetters[index];
  });

  cards.forEach((card) => {
    card.classList.add("revealed");
    card.classList.add("correct");
  });

  showMessage(`Answer revealed: ${currentPhrase}`, "info");
}

function loadRandomPuzzle() {
  const phrase = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];

  gameSection.classList.remove("hidden");
  buildPuzzle(phrase);
  showMessage("New random puzzle loaded.", "info");
}

function generateCustomPuzzle() {
  const cleaned = sanitizePhrase(phraseInput.value);

  if (!cleaned) {
    showMessage("Please enter letters only.", "error");
    return;
  }

  gameSection.classList.remove("hidden");
  buildPuzzle(cleaned);

  // clear the answer so it is no longer visible
  phraseInput.value = "";

  // hide the custom input area after puzzle starts
  customControls.style.display = "none";

  showMessage("Your custom puzzle is ready.", "success");
}

function updateDecodedPhrase() {
  const display = document.getElementById("decodedPhrase");
  display.textContent = decodedLetters.join(" ");
}

function numberToLetter(num) {
  if (num < 1 || num > 26) return "";
  return String.fromCharCode(num + 64);
}


function showMessage(message, type) {
  resultMessage.textContent = message;
  resultMessage.className = `result-message ${type}`;
}

function clearMessage() {
  resultMessage.textContent = "";
  resultMessage.className = "result-message";
}

randomTab.addEventListener("click", () => {
  setMode("random");
});

customTab.addEventListener("click", () => {
  setMode("custom");
});

newPuzzleBtn.addEventListener("click", loadRandomPuzzle);
nextRandomBtn.addEventListener("click", loadRandomPuzzle);
generateBtn.addEventListener("click", generateCustomPuzzle);

checkAnswerBtn.addEventListener("click", checkAnswer);
showAnswerBtn.addEventListener("click", showAnswer);

phraseInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    generateCustomPuzzle();
  }
});

// default page state: random tab selected, but no puzzle shown yet
setMode("random");
gameSection.classList.add("hidden");

