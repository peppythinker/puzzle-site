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

  const puzzle = document.getElementById("puzzle");
  puzzle.innerHTML = "";

  for (let i = 0; i < currentPhrase.length; i++) {
    const char = currentPhrase[i];

    if (char === " ") {
      const gap = document.createElement("div");
      gap.className = "word-gap";
      puzzle.appendChild(gap);
    } else {
      const number = letterToNumber(char);
      const problem = makeAdditionProblem(number);

      const box = document.createElement("div");
      box.className = "puzzle-box";

      box.innerHTML = `
        <div class="problem">${problem} = ?</div>
        <div class="box-label">Solve me</div>
      `;

      puzzle.appendChild(box);
    }
  }

  document.getElementById("playerAnswer").value = "";
  document.getElementById("result").textContent = "";
}

function checkAnswer() {
  const playerAnswer = document
    .getElementById("playerAnswer")
    .value
    .trim()
    .toUpperCase();

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

function generateCustomPuzzle(){

let input = document.getElementById("customPhrase").value
.trim()
.toUpperCase();

if(input===""){
alert("Please enter a phrase");
return;
}

input = input.replace(/[^A-Z ]/g,"");

currentPhrase = input;

const puzzle = document.getElementById("puzzle");
puzzle.innerHTML="";

for(let i=0;i<currentPhrase.length;i++){

const char=currentPhrase[i];

if(char===" "){

const gap=document.createElement("div");
gap.className="word-gap";
puzzle.appendChild(gap);

}else{

const number=letterToNumber(char);
const problem=makeAdditionProblem(number);

const box=document.createElement("div");
box.className="puzzle-box";

box.innerHTML=`

<div class="problem">${problem} = ?</div>
<div class="box-label">Solve me</div>
`;

puzzle.appendChild(box);

}

}

document.getElementById("playerAnswer").value="";
document.getElementById("result").textContent="";

}

