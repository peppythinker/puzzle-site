const phrases = [
  "HELLO CAT",
  "HAPPY TURTLE",
  "FUN PUZZLE",
  "SMART KIDS",
  "LOVE MATH",
  "CUTE ANIMALS"
];

function phraseToNumbers(phrase) {
  const numbers = [];

  for (let i = 0; i < phrase.length; i++) {
    const char = phrase[i];

    if (char === " ") {
      numbers.push("/");
    } else {
      const number = char.charCodeAt(0) - 64;
      numbers.push(number);
    }
  }

  return numbers.join(" ");
}

function generatePuzzle() {
  const randomIndex = Math.floor(Math.random() * phrases.length);
  const phrase = phrases[randomIndex];
  const puzzleText = phraseToNumbers(phrase);

  document.getElementById("puzzle").textContent = puzzleText;
  document.getElementById("answer").textContent = "";
}

document.getElementById("newPuzzleBtn").addEventListener("click", generatePuzzle);

// Show one puzzle automatically when page loads
generatePuzzle();
