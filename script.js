const phrases = [
"HELLO CAT",
"HAPPY TURTLE",
"FUN PUZZLE",
"SMART KIDS",
"LOVE MATH",
"CUTE ANIMALS"
];

let currentPhrase = "";

function generatePuzzle(){

currentPhrase = phrases[Math.floor(Math.random()*phrases.length)];

let numbers = [];

for(let i=0;i<currentPhrase.length;i++){

let char = currentPhrase[i];

if(char===" "){
numbers.push("/");
}
else{
numbers.push(char.charCodeAt(0)-64);
}

}

document.getElementById("puzzle").innerText = numbers.join(" ");

document.getElementById("playerAnswer").value="";
document.getElementById("result").innerText="";
}

function checkAnswer(){

let player = document.getElementById("playerAnswer").value.toUpperCase();

if(player===currentPhrase){
document.getElementById("result").innerText="✅ Correct!";
}
else{
document.getElementById("result").innerText="❌ Try again";
}

}
