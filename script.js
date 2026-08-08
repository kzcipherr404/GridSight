// ==========================================================
// GridSight — Portrait Reference Tool for Artists
// Pure Vanilla JavaScript implementation
// ==========================================================

// ==========================================================
// 1. SCROLL REVEAL ANIMATION (Landing Page)
// ==========================================================

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    },
    { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

// ==========================================================
// 2. DOM ELEMENTS REGISTRY
// ==========================================================

// Workspace & Canvas
const uploadPrompt = document.getElementById("uploadPrompt");
const uploadBtn = document.getElementById("uploadBtn");
const imageInput = document.getElementById("imageInput");
const canvasViewport = document.getElementById("canvasViewport");
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");
const toast = document.getElementById("toast");

// Info Bar
const imageInfoBar = document.getElementById("imageInfoBar");
const imageFileName = document.getElementById("imageFileName");
const imageDimensions = document.getElementById("imageDimensions");
const imageFileType = document.getElementById("imageFileType");

// Image Adjustments Controls
const grayscaleToggle = document.getElementById("grayscaleToggle");
const brightness = document.getElementById("brightness");
const brightnessValue = document.getElementById("brightnessValue");
const contrast = document.getElementById("contrast");
const contrastValue = document.getElementById("contrastValue");
const blur = document.getElementById("blur");
const blurValue = document.getElementById("blurValue");
const sharpen = document.getElementById("sharpen");
const sharpenValue = document.getElementById("sharpenValue");
const resetImageBtn = document.getElementById("resetImageBtn");

// Grid Controls
const gridPreset = document.getElementById("gridPreset");
const horizontalToggle = document.getElementById("horizontalToggle");
const verticalToggle = document.getElementById("verticalToggle");
const diagonalToggle = document.getElementById("diagonalToggle");
const density = document.getElementById("density");
const densityValue = document.getElementById("densityValue");
const opacity = document.getElementById("opacity");
const opacityValue = document.getElementById("opacityValue");
const lineWidth = document.getElementById("lineWidth");
const lineWidthValue = document.getElementById("lineWidthValue");
const colorButtons = document.querySelectorAll(".grid-color");
const resetGridBtn = document.getElementById("resetGridBtn");

// View Controls
const zoomLevelDisplay = document.getElementById("zoomLevelDisplay");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const fitViewBtn = document.getElementById("fitViewBtn");
const zoom100Btn = document.getElementById("zoom100Btn");
const resetViewBtn = document.getElementById("resetViewBtn");

// Export Controls
const exportFormat = document.getElementById("exportFormat");
const jpgQualityRow = document.getElementById("jpgQualityRow");
const jpgQuality = document.getElementById("jpgQuality");
const jpgQualityValue = document.getElementById("jpgQualityValue");
const exportBtn = document.getElementById("exportBtn");

// Shortcuts Modal
const shortcutsToggleBtn = document.getElementById("shortcutsToggleBtn");
const shortcutsModal = document.getElementById("shortcutsModal");
const closeShortcutsBtn = document.getElementById("closeShortcutsBtn");

// ==========================================================
// 3. APPLICATION STATE MANAGEMENT
// ==========================================================

const imageSettings = {
    grayscale: false,
    brightness: 100, // 50 - 150
    contrast: 100,   // 50 - 150
    blur: 0,         // 0 - 10
    sharpen: 0       // 0 - 10
};

const gridSettings = {
    horizontal: true,
    vertical: true,
    diagonal: false,
    density: 4,      // 2 - 25
    color: "#ffffff",
    opacity: 0.6,    // 0 - 1
    width: 1,        // 1 - 6
    preset: "portrait"
};

const viewSettings = {
    zoom: 1.0,       // 0.25 - 8.0
    minZoom: 0.25,
    maxZoom: 8.0,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0
};

const presets = {
    portrait: { horizontal: true, vertical: true, diagonal: false, density: 4 },
    loomis:    { horizontal: true, vertical: true, diagonal: true,  density: 6 },
    detail:    { horizontal: true, vertical: true, diagonal: true,  density: 10 }
};

let originalImage = null;
let processedCanvas = null; // Offscreen canvas for processed image
let processedCtx = null;
let currentFile = null;

// ==========================================================
// 4. FILE UPLOAD & DRAG/DROP HANDLERS
// ==========================================================

uploadBtn.addEventListener("click", () => imageInput.click());
imageInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
        processFile(e.target.files[0]);
    }
});

uploadPrompt.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadPrompt.classList.add("dragover");
});

uploadPrompt.addEventListener("dragleave", () => {
    uploadPrompt.classList.remove("dragover");
});

uploadPrompt.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadPrompt.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
    }
});

function processFile(file) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
        showToast("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            currentFile = file;

            // Display Info Bar
            imageFileName.textContent = file.name;
            imageDimensions.textContent = `${img.width} × ${img.height}`;
            imageFileType.textContent = file.type.split("/")[1].toUpperCase();
            imageInfoBar.style.display = "flex";

            // Hide Upload, Show Canvas Viewport
            uploadPrompt.style.display = "none";
            canvasViewport.style.display = "flex";

            // Initialize Offscreen Processed Canvas
            processedCanvas = document.createElement("canvas");
            processedCtx = processedCanvas.getContext("2d");

            // Reset View and Render
            resetView();
            renderProcessedImage();
        };

        img.onerror = () => {
            showToast("Failed to decode image file. Please try another image.");
        };

        img.src = e.target.result;
    };

    reader.onerror = () => {
        showToast("Error reading file.");
    };

    reader.readAsDataURL(file);
}

function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.style.display = "block";
    setTimeout(() => {
        toast.style.display = "none";
    }, duration);
}

// ==========================================================
// 5. IMAGE PROCESSING PIPELINE (Offscreen Canvas)
// ==========================================================

function renderProcessedImage() {
    if (!originalImage) return;

    // Use fit preview dimensions for performance
    const vpWidth = canvasViewport.clientWidth || 800;
    const vpHeight = canvasViewport.clientHeight || 600;
    const previewScale = Math.min(
        (vpWidth * 0.95) / originalImage.width,
        (vpHeight * 0.95) / originalImage.height,
        1
    );

    const prevW = Math.max(1, Math.round(originalImage.width * previewScale));
    const prevH = Math.max(1, Math.round(originalImage.height * previewScale));

    processedCanvas.width = prevW;
    processedCanvas.height = prevH;

    // Build CSS Filter string
    const filters = [];
    if (imageSettings.grayscale) {
        filters.push("grayscale(100%)");
    }
    if (imageSettings.brightness !== 100) {
        filters.push(`brightness(${imageSettings.brightness}%)`);
    }
    if (imageSettings.contrast !== 100) {
        filters.push(`contrast(${imageSettings.contrast}%)`);
    }
    if (imageSettings.blur > 0) {
        filters.push(`blur(${imageSettings.blur}px)`);
    }

    processedCtx.filter = filters.length > 0 ? filters.join(" ") : "none";
    processedCtx.clearRect(0, 0, prevW, prevH);
    processedCtx.drawImage(originalImage, 0, 0, prevW, prevH);
    processedCtx.filter = "none";

    // Sharpen Convolution Kernel
    if (imageSettings.sharpen > 0) {
        applySharpenKernel(processedCtx, prevW, prevH, imageSettings.sharpen);
    }

    renderCanvas();
}

/**
 * 3x3 Convolution Sharpening Algorithm
 */
function applySharpenKernel(ctx, width, height, amount) {
    if (amount <= 0 || width < 3 || height < 3) return;
    const factor = (amount / 10) * 0.6;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const copy = new Uint8ClampedArray(data);

    const centerWeight = 1 + 4 * factor;

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;

            for (let c = 0; c < 3; c++) {
                const top = copy[((y - 1) * width + x) * 4 + c];
                const bottom = copy[((y + 1) * width + x) * 4 + c];
                const left = copy[(y * width + (x - 1)) * 4 + c];
                const right = copy[(y * width + (x + 1)) * 4 + c];
                const center = copy[idx + c];

                const val = center * centerWeight - (top + bottom + left + right) * factor;
                data[idx + c] = val < 0 ? 0 : val > 255 ? 255 : val;
            }
        }
    }
    ctx.putImageData(imgData, 0, 0);
}

// ==========================================================
// 6. CANVAS VIEWPORT & RENDER PIPELINE
// ==========================================================

function renderCanvas() {
    if (!originalImage || !processedCanvas) return;

    const imgW = processedCanvas.width;
    const imgH = processedCanvas.height;

    // Display Canvas matches image size
    canvas.width = imgW;
    canvas.height = imgH;

    // Apply transform via CSS for hardware-accelerated pan & zoom
    const zoom = viewSettings.zoom;
    const tx = viewSettings.offsetX;
    const ty = viewSettings.offsetY;

    canvas.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`;

    // Draw processed image onto live canvas
    ctx.clearRect(0, 0, imgW, imgH);
    ctx.drawImage(processedCanvas, 0, 0);

    // Draw Grid Overlay
    drawGridOverlay(ctx, imgW, imgH);

    // Update Zoom level readout
    zoomLevelDisplay.textContent = `${Math.round(viewSettings.zoom * 100)}%`;
}

/**
 * True Square Cell Grid Overlay
 */
function drawGridOverlay(targetCtx, w, h) {
    const cellCount = gridSettings.density;
    if (cellCount < 1) return;

    // True square grid cell size based on image min dimension
    const cellSize = Math.min(w, h) / cellCount;

    targetCtx.save();
    targetCtx.strokeStyle = gridSettings.color;
    targetCtx.globalAlpha = gridSettings.opacity;
    targetCtx.lineWidth = gridSettings.width;

    // Vertical Lines
    if (gridSettings.vertical) {
        for (let x = cellSize; x < w; x += cellSize) {
            targetCtx.beginPath();
            targetCtx.moveTo(x, 0);
            targetCtx.lineTo(x, h);
            targetCtx.stroke();
        }
    }

    // Horizontal Lines
    if (gridSettings.horizontal) {
        for (let y = cellSize; y < h; y += cellSize) {
            targetCtx.beginPath();
            targetCtx.moveTo(0, y);
            targetCtx.lineTo(w, y);
            targetCtx.stroke();
        }
    }

    // Diagonal X Lines inside individual square cells
    if (gridSettings.diagonal) {
        for (let x = 0; x + cellSize <= w; x += cellSize) {
            for (let y = 0; y + cellSize <= h; y += cellSize) {
                targetCtx.beginPath();
                targetCtx.moveTo(x, y);
                targetCtx.lineTo(x + cellSize, y + cellSize);
                targetCtx.stroke();

                targetCtx.beginPath();
                targetCtx.moveTo(x + cellSize, y);
                targetCtx.lineTo(x, y + cellSize);
                targetCtx.stroke();
            }
        }
    }

    targetCtx.restore();
}

// ==========================================================
// 7. ZOOM & PAN NAVIGATION
// ==========================================================

function setZoom(newZoom) {
    const clampedZoom = Math.min(Math.max(newZoom, viewSettings.minZoom), viewSettings.maxZoom);
    viewSettings.zoom = clampedZoom;
    renderCanvas();
}

function resetView() {
    viewSettings.zoom = 1.0;
    viewSettings.offsetX = 0;
    viewSettings.offsetY = 0;
    renderCanvas();
}

// Zoom Controls Buttons
zoomInBtn.addEventListener("click", () => setZoom(viewSettings.zoom * 1.25));
zoomOutBtn.addEventListener("click", () => setZoom(viewSettings.zoom / 1.25));
fitViewBtn.addEventListener("click", resetView);
zoom100Btn.addEventListener("click", () => {
    if (!originalImage || !processedCanvas) return;
    const scale100 = originalImage.width / processedCanvas.width;
    setZoom(scale100);
});
resetViewBtn.addEventListener("click", resetView);

// Mouse Wheel Zoom
canvasViewport.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoom(viewSettings.zoom * zoomFactor);
}, { passive: false });

// Pointer Drag Panning
canvasViewport.addEventListener("pointerdown", (e) => {
    if (!originalImage) return;
    viewSettings.isDragging = true;
    viewSettings.dragStartX = e.clientX - viewSettings.offsetX;
    viewSettings.dragStartY = e.clientY - viewSettings.offsetY;
    canvasViewport.classList.add("panning");
    canvasViewport.setPointerCapture(e.pointerId);
});

canvasViewport.addEventListener("pointermove", (e) => {
    if (!viewSettings.isDragging) return;
    viewSettings.offsetX = e.clientX - viewSettings.dragStartX;
    viewSettings.offsetY = e.clientY - viewSettings.dragStartY;
    renderCanvas();
});

const stopPan = (e) => {
    if (viewSettings.isDragging) {
        viewSettings.isDragging = false;
        canvasViewport.classList.remove("panning");
        try {
            canvasViewport.releasePointerCapture(e.pointerId);
        } catch (_) {}
    }
};

canvasViewport.addEventListener("pointerup", stopPan);
canvasViewport.addEventListener("pointercancel", stopPan);

// Handle window resize
window.addEventListener("resize", () => {
    if (originalImage) {
        renderProcessedImage();
    }
});

// ==========================================================
// 8. IMAGE ADJUSTMENTS CONTROLS
// ==========================================================

grayscaleToggle.addEventListener("change", (e) => {
    imageSettings.grayscale = e.target.checked;
    renderProcessedImage();
});

brightness.addEventListener("input", (e) => {
    imageSettings.brightness = Number(e.target.value);
    brightnessValue.textContent = `${e.target.value}%`;
    renderProcessedImage();
});

contrast.addEventListener("input", (e) => {
    imageSettings.contrast = Number(e.target.value);
    contrastValue.textContent = `${e.target.value}%`;
    renderProcessedImage();
});

blur.addEventListener("input", (e) => {
    imageSettings.blur = Number(e.target.value);
    blurValue.textContent = `${e.target.value}px`;
    renderProcessedImage();
});

sharpen.addEventListener("input", (e) => {
    imageSettings.sharpen = Number(e.target.value);
    sharpenValue.textContent = e.target.value;
    renderProcessedImage();
});

resetImageBtn.addEventListener("click", resetImageAdjustments);

function resetImageAdjustments() {
    imageSettings.grayscale = false;
    imageSettings.brightness = 100;
    imageSettings.contrast = 100;
    imageSettings.blur = 0;
    imageSettings.sharpen = 0;

    grayscaleToggle.checked = false;
    brightness.value = 100;
    brightnessValue.textContent = "100%";
    contrast.value = 100;
    contrastValue.textContent = "100%";
    blur.value = 0;
    blurValue.textContent = "0px";
    sharpen.value = 0;
    sharpenValue.textContent = "0";

    renderProcessedImage();
}

// ==========================================================
// 9. GRID CONTROLS & PRESETS
// ==========================================================

function markPresetCustom() {
    gridSettings.preset = "custom";
    gridPreset.value = "custom";
}

gridPreset.addEventListener("change", (e) => {
    const selected = e.target.value;
    if (selected === "custom") return;

    const p = presets[selected];
    if (!p) return;

    gridSettings.horizontal = p.horizontal;
    gridSettings.vertical = p.vertical;
    gridSettings.diagonal = p.diagonal;
    gridSettings.density = p.density;
    gridSettings.preset = selected;

    horizontalToggle.checked = p.horizontal;
    verticalToggle.checked = p.vertical;
    diagonalToggle.checked = p.diagonal;
    density.value = p.density;
    densityValue.textContent = p.density;

    renderCanvas();
});

horizontalToggle.addEventListener("change", (e) => {
    gridSettings.horizontal = e.target.checked;
    markPresetCustom();
    renderCanvas();
});

verticalToggle.addEventListener("change", (e) => {
    gridSettings.vertical = e.target.checked;
    markPresetCustom();
    renderCanvas();
});

diagonalToggle.addEventListener("change", (e) => {
    gridSettings.diagonal = e.target.checked;
    markPresetCustom();
    renderCanvas();
});

density.addEventListener("input", (e) => {
    gridSettings.density = Number(e.target.value);
    densityValue.textContent = e.target.value;
    markPresetCustom();
    renderCanvas();
});

opacity.addEventListener("input", (e) => {
    gridSettings.opacity = Number(e.target.value);
    opacityValue.textContent = `${Math.round(e.target.value * 100)}%`;
    renderCanvas();
});

lineWidth.addEventListener("input", (e) => {
    gridSettings.width = Number(e.target.value);
    lineWidthValue.textContent = `${e.target.value}px`;
    renderCanvas();
});

colorButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        colorButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        gridSettings.color = btn.dataset.color;
        renderCanvas();
    });
});

resetGridBtn.addEventListener("click", resetGridSettings);

function resetGridSettings() {
    gridSettings.horizontal = true;
    gridSettings.vertical = true;
    gridSettings.diagonal = false;
    gridSettings.density = 4;
    gridSettings.color = "#ffffff";
    gridSettings.opacity = 0.6;
    gridSettings.width = 1;
    gridSettings.preset = "portrait";

    gridPreset.value = "portrait";
    horizontalToggle.checked = true;
    verticalToggle.checked = true;
    diagonalToggle.checked = false;
    density.value = 4;
    densityValue.textContent = "4";
    opacity.value = 0.6;
    opacityValue.textContent = "60%";
    lineWidth.value = 1;
    lineWidthValue.textContent = "1px";

    colorButtons.forEach(b => b.classList.toggle("active", b.dataset.color === "#ffffff"));

    renderCanvas();
}

// ==========================================================
// 10. EXPORT SYSTEM (Full-Resolution Export)
// ==========================================================

exportFormat.addEventListener("change", (e) => {
    jpgQualityRow.style.display = e.target.value === "jpeg" ? "flex" : "none";
});

jpgQuality.addEventListener("input", (e) => {
    jpgQualityValue.textContent = `${Math.round(e.target.value * 100)}%`;
});

exportBtn.addEventListener("click", exportFullResolution);

function exportFullResolution() {
    if (!originalImage) {
        showToast("Please upload an image first.");
        return;
    }

    const fullW = originalImage.width;
    const fullH = originalImage.height;

    // Create full resolution offscreen canvas
    const exportCanvas = document.createElement("canvas");
    const exportCtx = exportCanvas.getContext("2d");
    exportCanvas.width = fullW;
    exportCanvas.height = fullH;

    // Apply CSS Filters at full resolution
    const filters = [];
    if (imageSettings.grayscale) filters.push("grayscale(100%)");
    if (imageSettings.brightness !== 100) filters.push(`brightness(${imageSettings.brightness}%)`);
    if (imageSettings.contrast !== 100) filters.push(`contrast(${imageSettings.contrast}%)`);
    if (imageSettings.blur > 0) {
        // Scale blur radius proportionally to full resolution
        const blurScale = fullW / processedCanvas.width;
        filters.push(`blur(${imageSettings.blur * blurScale}px)`);
    }

    exportCtx.filter = filters.length > 0 ? filters.join(" ") : "none";
    exportCtx.clearRect(0, 0, fullW, fullH);
    exportCtx.drawImage(originalImage, 0, 0, fullW, fullH);
    exportCtx.filter = "none";

    // Sharpen Kernel at full resolution
    if (imageSettings.sharpen > 0) {
        applySharpenKernel(exportCtx, fullW, fullH, imageSettings.sharpen);
    }

    // Scale grid linewidth proportionally to full resolution
    const scaleFactor = fullW / processedCanvas.width;
    const fullLineWidth = Math.max(1, Math.round(gridSettings.width * scaleFactor));

    const tempWidth = gridSettings.width;
    gridSettings.width = fullLineWidth;

    // Draw Grid on full resolution image
    drawGridOverlay(exportCtx, fullW, fullH);

    gridSettings.width = tempWidth; // Restore preview line width

    // File download
    const format = exportFormat.value; // "png" or "jpeg"
    const extension = format === "jpeg" ? "jpg" : "png";
    const mimeType = `image/${format}`;
    const quality = format === "jpeg" ? Number(jpgQuality.value) : undefined;

    const baseName = currentFile ? currentFile.name.substring(0, currentFile.name.lastIndexOf('.')) || "reference" : "reference";
    const downloadFileName = `gridsight-${baseName}.${extension}`;

    const dataUrl = exportCanvas.toDataURL(mimeType, quality);
    const link = document.createElement("a");
    link.download = downloadFileName;
    link.href = dataUrl;
    link.click();

    showToast(`Exported ${downloadFileName} (${fullW} × ${fullH})`);
}

// ==========================================================
// 11. KEYBOARD SHORTCUTS & HELP MODAL
// ==========================================================

shortcutsToggleBtn.addEventListener("click", () => {
    shortcutsModal.style.display = "flex";
});

closeShortcutsBtn.addEventListener("click", () => {
    shortcutsModal.style.display = "none";
});

shortcutsModal.addEventListener("click", (e) => {
    if (e.target === shortcutsModal) {
        shortcutsModal.style.display = "none";
    }
});

document.addEventListener("keydown", (e) => {
    // Ignore hotkeys when typing in form inputs or dropdowns
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
    if (activeTag === "input" || activeTag === "select" || activeTag === "textarea") {
        return;
    }

    const key = e.key.toUpperCase();

    // Ctrl+S or Cmd+S for Export
    if ((e.ctrlKey || e.metaKey) && key === "S") {
        e.preventDefault();
        exportFullResolution();
        return;
    }

    switch (key) {
        case "G":
            // Toggle all grid lines
            const anyOn = gridSettings.horizontal || gridSettings.vertical || gridSettings.diagonal;
            gridSettings.horizontal = !anyOn;
            gridSettings.vertical = !anyOn;
            gridSettings.diagonal = !anyOn;
            horizontalToggle.checked = gridSettings.horizontal;
            verticalToggle.checked = gridSettings.vertical;
            diagonalToggle.checked = gridSettings.diagonal;
            markPresetCustom();
            renderCanvas();
            break;

        case "H":
            gridSettings.horizontal = !gridSettings.horizontal;
            horizontalToggle.checked = gridSettings.horizontal;
            markPresetCustom();
            renderCanvas();
            break;

        case "V":
            gridSettings.vertical = !gridSettings.vertical;
            verticalToggle.checked = gridSettings.vertical;
            markPresetCustom();
            renderCanvas();
            break;

        case "D":
            gridSettings.diagonal = !gridSettings.diagonal;
            diagonalToggle.checked = gridSettings.diagonal;
            markPresetCustom();
            renderCanvas();
            break;

        case "0":
            resetView();
            break;

        case "1":
            if (originalImage && processedCanvas) {
                setZoom(originalImage.width / processedCanvas.width);
            }
            break;

        case "+":
        case "=":
            setZoom(viewSettings.zoom * 1.25);
            break;

        case "-":
        case "_":
            setZoom(viewSettings.zoom / 1.25);
            break;

        case "R":
            resetImageAdjustments();
            break;

        case "ESCAPE":
            shortcutsModal.style.display = "none";
            break;
    }
});