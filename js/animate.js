const paintButton = document.querySelector(".play");
const aboutButton = document.querySelector(".about");
const instructionButton = document.querySelector(".instructions");
const menuCanvas = document.querySelector(".menu");
const sideTitle = document.querySelector(".br-title");

paintButton.addEventListener('mouseover', (event) => {
    menuCanvas.style.backgroundColor = "rgba(255, 255, 255, 0.816)";
});

paintButton.addEventListener('mouseleave', (event) => {
    menuCanvas.style.backgroundColor = "rgba(255, 255, 255, 1)";
});

paintButton.addEventListener('click', () => { startPainting(); });

aboutButton.addEventListener('click', () => { openAbout(); });

instructionButton.addEventListener('click', () => { openInstructions(); });

function startPainting() {
    menuCanvas.style.pointerEvents = 'none';
    menuCanvas.style.opacity = '0';
    sideTitle.style.opacity = 1;
}

function openAbout() {
    window.open('https://github.com/jmanasseh29/cs1230-final-project/#the-garden', '_blank');
}

function openInstructions() {
    window.open('https://github.com/jmanasseh29/cs1230-final-project/blob/main/README.md#usage', '_blank');
}