const phrases = [
  "CAT",
  "DOG",
  "HELLO",
  "LOVE",
  "SMART",
  "FUN MATH",
  "HAPPY CAT",
  "CUTE DOG",
  "BEST KID",
  "PLAY TIME",
  "GOOD JOB",
  "SUPER STAR"
];

let currentPhrase = "";

function letterToNumber(letter) {
  return letter.charCodeAt(0) - 64;
}

function makeAdditionProblem(target) {
  const first = Math.floor(Math.random() * (target + 1));
  const second = target - first;
  return `${first} + ${second}`;
}

function phraseToMathProblems(phrase) {
  const parts = [];

  for (let i = 0; i < phrase.length; i++) {
    const char = phrase[i];

    if (char === " ") {
      parts.push("/");
    } else {
      const num = letterToNumber(char);
      const problem = makeAdditionProblem(num);
      parts.push(problem);
    }
  }

  return parts;
}

function generatePuzzle() {
  const randomIndex = Math.floor(Math.random() * phrases.length);
  currentPhrase = phrases[randomIndex];

  const problems = phraseToMathProblems(currentPhrase);

  let html = "";

  for (let i = 0; i < problems.length; i++) {
    if (problems[i] === "/") {
      html += `<span class="space-break"></span> / <span class="space-break"></span>`;
    } else {
      html += `<span>${problems[i]} = ?</span>`;
    }

    if (i < problems.length - 1) {
      html += " &nbsp; | &nbsp; ";
    }
  }

  document.getElementById("puzzle").innerHTML = html;
  document.getElementById("playerAnswer").value = "";
  document.getElementById("result").textContent = "";
}

function checkAnswer() {
  const player = document.getElementById("playerAnswer").value.trim().toUpperCase();

  if (player === currentPhrase) {
    document.getElementById("result").textContent = "✅ Correct!";
  } else {
    document.getElementById("result").textContent = "❌ Try again";
  }
}

function showAnswer() {
  document.getElementById("result").textContent = `Answer: ${currentPhrase}`;
}

generatePuzzle();
