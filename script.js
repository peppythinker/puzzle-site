const phrases = [
"HELLO CAT",
"HAPPY TURTLE",
"FUN PUZZLE",
"SMART KIDS",
"LOVE MATH",
"CUTE ANIMALS"
];

function generatePuzzle(){

const phrase = phrases[Math.floor(Math.random()*phrases.length)];

let numbers = [];

for(let i=0;i<phrase.length;i++){

let char = phrase[i];

if(char===" "){
numbers.push("/");
}
else{
let number = char.charCodeAt(0) - 64;
numbers.push(number);
}

}

document.getElementById("puzzle").innerText = numbers.join(" ");

document.getElementById("answer").innerText = "";

}
