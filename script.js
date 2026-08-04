const startBtn = document.getElementById("startBtn");
const hero = document.getElementById("hero");
const editor = document.getElementById("editor");

startBtn.addEventListener("click", () => {
    hero.classList.add("hidden");
    editor.classList.remove("hidden");
});