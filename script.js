const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateGrid() {

    const grid = document.getElementById("grid");
    grid.innerHTML = "";

    for (let i = 0; i < 100; i++) {

        const cell = document.createElement("div");
        cell.className = "cell";

        const randomLetter =
            letters[Math.floor(Math.random() * letters.length)];

        cell.textContent = randomLetter;

        grid.appendChild(cell);
    }
}
