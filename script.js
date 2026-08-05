// ==========================================================
// SCROLL REVEAL ANIMATION
// ==========================================================

const observer = new IntersectionObserver(

    (entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("active");

            }

        });

    },

    {
        threshold: 0.15
    }

);


document
    .querySelectorAll(".reveal")
    .forEach(element => observer.observe(element));


// ==========================================================
// IMAGE UPLOAD + CANVAS PREVIEW
// ==========================================================

const imageInput = document.getElementById("imageInput");
const uploadBtn = document.getElementById("uploadBtn");

const uploadPrompt = document.getElementById("uploadPrompt");

const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");

// ==========================================================
// GRID CONTROL ELEMENTS
// ==========================================================

const gridPreset = document.getElementById("gridPreset");

const horizontalToggle = document.getElementById("horizontalToggle");

const verticalToggle = document.getElementById("verticalToggle");

const diagonalToggle = document.getElementById("diagonalToggle");

const density = document.getElementById("density");

const densityValue = document.getElementById("densityValue");

const opacity = document.getElementById("opacity");

const lineWidth = document.getElementById("lineWidth");

const exportBtn = document.getElementById("exportBtn");


// Stores the original full-resolution image
// This will be used later for full-resolution export

let originalImage = null;


// Open file picker

uploadBtn.addEventListener("click", () => {

    imageInput.click();

});


// Handle selected image

imageInput.addEventListener("change", handleFile);


function handleFile(event) {

    const file = event.target.files[0];


    if (!file) return;


    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (!allowedTypes.includes(file.type)) {

        alert("Please upload a JPG, PNG, or WEBP image.");

        return;

    }


    const reader = new FileReader();


    reader.onload = (e) => {


        const img = new Image();


        img.onload = () => {


            // Keep original image untouched

            originalImage = img;


            resizeCanvas();


            uploadPrompt.style.display = "none";

            canvas.style.display = "block";


        };


        img.src = e.target.result;


    };


    reader.readAsDataURL(file);

}



// ==========================================================
// CANVAS DISPLAY SCALING
// ==========================================================

function resizeCanvas() {


    if (!originalImage) return;


    const maxWidth = window.innerWidth * 0.65;

    const maxHeight = window.innerHeight * 0.85;


    const scale = Math.min(

        maxWidth / originalImage.width,

        maxHeight / originalImage.height,

        1

    );


    /*
        The canvas uses a scaled preview size.

        The original image remains untouched
        in originalImage for future export.
    */


    canvas.width = originalImage.width * scale;

    canvas.height = originalImage.height * scale;


    renderCanvas();

}



// ==========================================================
// CANVAS RENDER PIPELINE
// ==========================================================

function renderCanvas() {


    if (!originalImage) return;


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.drawImage(

        originalImage,

        0,
        0,

        canvas.width,
        canvas.height

    );


    drawGrid();


}



// Resize preview when viewport changes

// ==========================================================
// GRID SYSTEM
// ==========================================================
const gridSettings = {

    horizontal:true,

    vertical:true,

    diagonal:true,

    density:4,

    color:"#ffffff",

    opacity:0.6,

    width:1

};

const presets = {


portrait:{

horizontal:true,

vertical:true,

diagonal:false,

density:4

},



loomis:{

horizontal:true,

vertical:true,

diagonal:true,

density:6

},



detail:{

horizontal:true,

vertical:true,

diagonal:true,

density:10

}


};



gridPreset.onchange = (e)=>{


const preset = presets[e.target.value];


if(!preset) return;



Object.assign(
gridSettings,
preset
);



horizontalToggle.checked =
gridSettings.horizontal;


verticalToggle.checked =
gridSettings.vertical;


diagonalToggle.checked =
gridSettings.diagonal;



density.value =
gridSettings.density;



densityValue.textContent =
gridSettings.density;



renderCanvas();


};



function drawGrid(){


    const w = canvas.width;

    const h = canvas.height;


    ctx.save();


    ctx.strokeStyle = gridSettings.color;

    ctx.globalAlpha = gridSettings.opacity;

    ctx.lineWidth = gridSettings.width;



    // Vertical lines

    if(gridSettings.vertical){

        const spacing = w / gridSettings.density;


        for(let i = 1; i < gridSettings.density; i++){

            ctx.beginPath();

            ctx.moveTo(
                i * spacing,
                0
            );

            ctx.lineTo(
                i * spacing,
                h
            );

            ctx.stroke();

        }

    }



    // Horizontal lines

    if(gridSettings.horizontal){

        const spacing = h / gridSettings.density;


        for(let i = 1; i < gridSettings.density; i++){

            ctx.beginPath();

            ctx.moveTo(
                0,
                i * spacing
            );

            ctx.lineTo(
                w,
                i * spacing
            );

            ctx.stroke();

        }

    }



    // Diagonal X

    if(gridSettings.diagonal){


        ctx.beginPath();

        ctx.moveTo(
            0,
            0
        );

        ctx.lineTo(
            w,
            h
        );

        ctx.stroke();



        ctx.beginPath();

        ctx.moveTo(
            w,
            0
        );

        ctx.lineTo(
            0,
            h
        );

        ctx.stroke();

    }


    ctx.restore();


}

window.addEventListener(

    "resize",

    () => {

        if (originalImage) {

            resizeCanvas();

        }

    }

);



// ==========================================================
// DRAG AND DROP SUPPORT
// ==========================================================

const dropArea = document.querySelector(".upload-area");


dropArea.addEventListener(
    "dragover",
    (event) => {

        event.preventDefault();

        dropArea.classList.add("dragover");

    }
);


dropArea.addEventListener(
    "dragleave",
    () => {

        dropArea.classList.remove("dragover");

    }
);


dropArea.addEventListener(
    "drop",
    (event) => {


        event.preventDefault();


        dropArea.classList.remove("dragover");


        const file = event.dataTransfer.files[0];


        if (!file) return;


        imageInput.files = event.dataTransfer.files;


        handleFile({

            target: {
                files: [file]
            }

        });


    }
);

// ==========================================================
// GRID CONTROLS
// ==========================================================


horizontalToggle.oninput = (e)=>{

    gridSettings.horizontal = e.target.checked;

    renderCanvas();

};



verticalToggle.oninput = (e)=>{

    gridSettings.vertical = e.target.checked;

    renderCanvas();

};



diagonalToggle.oninput = (e)=>{

    gridSettings.diagonal = e.target.checked;

    renderCanvas();

};


density.oninput = (e)=>{


gridSettings.density =
Number(e.target.value);



densityValue.textContent =
e.target.value;



renderCanvas();


};



opacity.oninput = (e)=>{

    gridSettings.opacity = Number(e.target.value);

    renderCanvas();

};



lineWidth.oninput = (e)=>{

    gridSettings.width = Number(e.target.value);

    renderCanvas();

};



document.querySelectorAll(".grid-color")
.forEach(button=>{


    button.onclick = ()=>{


        gridSettings.color = button.dataset.color;


        renderCanvas();


    };


});

exportBtn.onclick = ()=>{


if(!originalImage) return;



const exportCanvas =
document.createElement("canvas");



const exportCtx =
exportCanvas.getContext("2d");



exportCanvas.width =
originalImage.width;


exportCanvas.height =
originalImage.height;



exportCtx.drawImage(

originalImage,

0,

0

);



// scale grid to original resolution

exportCtx.scale(

originalImage.width / canvas.width,

originalImage.height / canvas.height

);



drawGridExport(exportCtx);



const link =
document.createElement("a");



link.download =
"gridsight-reference.png";



link.href =
exportCanvas.toDataURL(
"image/png"
);



link.click();


};

function drawGridExport(ctx){


ctx.strokeStyle =
gridSettings.color;


ctx.globalAlpha =
gridSettings.opacity;


ctx.lineWidth =
gridSettings.width;



const w =
canvas.width;


const h =
canvas.height;



if(gridSettings.vertical){


const spacing =
w/gridSettings.density;


for(let i=1;i<gridSettings.density;i++){


ctx.beginPath();

ctx.moveTo(
i*spacing,
0
);


ctx.lineTo(
i*spacing,
h
);


ctx.stroke();


}

}



if(gridSettings.horizontal){


const spacing =
h/gridSettings.density;


for(let i=1;i<gridSettings.density;i++){


ctx.beginPath();

ctx.moveTo(
0,
i*spacing
);


ctx.lineTo(
w,
i*spacing
);


ctx.stroke();


}

}


}