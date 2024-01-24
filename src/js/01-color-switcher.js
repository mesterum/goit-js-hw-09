function getRandomHexColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, 0)}`;
}

/** @type {HTMLButtonElement} */
const bStart = document.querySelector("[data-start]")
/** @type {HTMLButtonElement} */
const bStop = document.querySelector("[data-stop]")
bStop.disabled = true;
let id = 0
const changeBgColor = () => { document.body.style.backgroundColor = getRandomHexColor() }
bStart.addEventListener("click", () => {
  id = setInterval(changeBgColor, 1000)
  changeBgColor()
  bStart.disabled = true;
  bStop.disabled = false;
})

bStop.addEventListener("click", () => {
  clearInterval(id)
  bStart.disabled = false;
  bStop.disabled = true;
})