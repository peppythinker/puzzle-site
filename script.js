const phrases = [
  "CAT",
  "DOG",
  "HELLO",
  "LOVE",
  "SMART",
  "FUN MATH",
  "HAPPY CAT",
  "CUTE DOG",
  "GOOD JOB",
  "BEST KID"
];

let currentPhrase = "";

function letterToNumber(letter) {
  return letter.charCodeAt(0) - 64;
}

function makeAdditionProblem(answer) {
  const first = Math.floor(Math.random() * (answer + 1));
  const second = answer - first;
  return `${first} + ${second}`;
}

function generatePuzzle() {
  const randomIndex = Math.floor(Math.random() * phrases.length);
  currentPhrase = phrases[randomIndex];

  let output = "";

  for (let i = 0; i < currentPhrase.length; i++) {
    const char = currentPhrase[i];

    if (char === " ") {
      output += " / ";
    } else {
      const number = letterToNumber(char);
      const problem = makeAdditionProblem(number);
      output += problem + " = ?";
    }

    if (i < currentPhrase.length - 1) {
      output += " | ";
    }
  }

  document.getElementById("puzzle").textContent = output;
  document.getElementById("playerAnswer").value = "";
  document.getElementById("result").textContent = "";
}

function checkAnswer() {
  const playerAnswer = document.getElementById("playerAnswer").value.trim().toUpperCase();

  if (playerAnswer === currentPhrase) {
    document.getElementById("result").textContent = "✅ Correct!";
  } else {
    document.getElementById("result").textContent = "❌ Try again";
  }
}

function showAnswer() {
  document.getElementById("result").textContent = "Answer: " + currentPhrase;
}

generatePuzzle();
