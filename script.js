document.addEventListener("DOMContentLoaded", () => {
  const colorPicker = document.getElementById("colorPicker");
  const preview = document.getElementById("preview");
  const downloadSvgBtn = document.getElementById("downloadSvg");
  const downloadPngBtn = document.getElementById("downloadPng");
  const widthInput = document.getElementById("width");
  const sizeMode = document.getElementsByName("sizeMode");

  let currentSvg = null;
  let originalWidth = null;
  let originalHeight = null;
  let originalRatio = null;

  // Charger le SVG initial
  fetch("logo-artyleiso.svg")
    .then((response) => response.text())
    .then((svgContent) => {
      preview.innerHTML = svgContent;
      currentSvg = preview.querySelector("svg");

      // Sauvegarder les dimensions originales
      originalWidth = currentSvg.viewBox.baseVal.width;
      originalHeight = currentSvg.viewBox.baseVal.height;
      originalRatio = originalHeight / originalWidth;

      updateColor(colorPicker.value);
    });

  // Mise à jour de la couleur en temps réel
  colorPicker.addEventListener("input", (e) => {
    updateColor(e.target.value);
  });

  // Mise à jour lors du changement de taille
  widthInput.addEventListener("input", updateSize);
  sizeMode.forEach((radio) => {
    radio.addEventListener("change", updateSize);
  });

  function updateSize() {
    if (!currentSvg) return;

    const width = parseInt(widthInput.value) | 1000;
    const isSquare = document.querySelector('input[name="sizeMode"]:checked').value === "square";

    const height = isSquare ? width : Math.round(width * originalRatio);

    // currentSvg.setAttribute("width", width);
    // currentSvg.setAttribute("height", height);
  }

  function updateColor(color) {
    if (!currentSvg) return;
    const styleElement = currentSvg.querySelector("style");
    if (styleElement) {
      let styleContent = styleElement.textContent;
      styleContent = styleContent.replace(/.cls-1\s*{\s*fill:\s*[^;]+;/, `.cls-1{fill:${color};`);
      styleElement.textContent = styleContent;
    }
  }

  // Téléchargement version SVG
  downloadSvgBtn.addEventListener("click", () => {
    if (!currentSvg) return;
    updateSize(); // S'assurer que la taille est mise à jour
    const svgData = new XMLSerializer().serializeToString(currentSvg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    downloadFile(blob, "logo-artyleiso-modified.svg");
  });

  // Téléchargement version PNG
  downloadPngBtn.addEventListener("click", () => {
    if (!currentSvg) return;

    updateSize(); // S'assurer que la taille est mise à jour
    const svgData = new XMLSerializer().serializeToString(currentSvg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const width = parseInt(widthInput.value) | 1000;
      const isSquare = document.querySelector('input[name="sizeMode"]:checked').value === "square";
      const height = isSquare ? width : Math.round(width * originalRatio);

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        downloadFile(blob, "logo-artyleiso-modified.png");
      }, "image/png");
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  });

  function downloadFile(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
});
