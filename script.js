const observer = new IntersectionObserver(

(entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("active");

}

});

},

{

threshold:0.15

}

);

document

.querySelectorAll(".reveal")

.forEach(el=>observer.observe(el));
const imageInput = document.getElementById("imageInput");
const uploadBtn = document.getElementById("uploadBtn");
const uploadPrompt = document.getElementById("uploadPrompt");

const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");

const grayscaleSlider = document.getElementById("grayscaleSlider");
const grayscaleValue = document.getElementById("grayscaleValue");

let grayscaleAmount = 0;

/*
    ORIGINAL FULL-RES IMAGE

    Never draw directly from the preview canvas later.

    This Image object always keeps
    the original resolution for export.
*/

let originalImage = null;

uploadBtn.addEventListener("click", () => {
    imageInput.click();
});

imageInput.addEventListener("change", handleFile);

function handleFile(e){

    const file = e.target.files[0];

    if(!file) return;

    if(!file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = function(event){

        const img = new Image();

        img.onload = function(){

            originalImage = img;

            drawPreview();

            uploadPrompt.style.display="none";
            canvas.style.display="block";

        };

        img.src = event.target.result;

    };

    reader.readAsDataURL(file);

}

function updatePreviewFilters(){

    canvas.style.filter =
        `grayscale(${grayscaleAmount}%)`;

}


function drawPreview(){

    const maxWidth = window.innerWidth * 0.65;
    const maxHeight = window.innerHeight * 0.85;

    const scale = Math.min(
        maxWidth / originalImage.width,
        maxHeight / originalImage.height,
        1
    );

    const displayWidth = originalImage.width * scale;
    const displayHeight = originalImage.height * scale;

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.drawImage(
        originalImage,
        0,
        0,
        displayWidth,
        displayHeight
    );

}

window.addEventListener("resize", () => {

    if(originalImage){

        drawPreview();

    }

});

grayscaleSlider.addEventListener("input", () => {

    grayscaleAmount = Number(grayscaleSlider.value);

    grayscaleValue.textContent =
        `${grayscaleAmount}%`;

    updatePreviewFilters();

});

updatePreviewFilters();

