// ============================================
// AI IMAGE AUTHENTICATOR - FRONTEND SCRIPT
// ============================================

// FastAPI backend
const API_URL = "http://127.0.0.1:8000/predict";

// Elements
const imageInput = document.getElementById("imageInput");
const uploadCard = document.getElementById("uploadCard");

// Store selected image
let selectedFile = null;


// ============================================
// 1. IMAGE SELECTION
// ============================================

if (imageInput) {
    imageInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) {
            return;
        }

        selectedFile = file;

        showImagePreview(file);
    });
}


// ============================================
// 2. SHOW IMAGE PREVIEW
// ============================================

function showImagePreview(file) {

    const reader = new FileReader();

    reader.onload = function (event) {

        // Find preview image
        let preview = document.getElementById("imagePreview");

        // Create preview if it doesn't exist
        if (!preview) {

            preview = document.createElement("img");

            preview.id = "imagePreview";

            preview.style.maxWidth = "500px";
            preview.style.maxHeight = "500px";
            preview.style.width = "auto";
            preview.style.height = "auto";
            preview.style.display = "block";
            preview.style.margin = "20px auto";
            preview.style.borderRadius = "20px";
            preview.style.objectFit = "contain";

            if (uploadCard) {
                uploadCard.appendChild(preview);
            }
        }

        preview.src = event.target.result;

        // Show filename
        let fileName = document.getElementById("selectedFileName");

        if (!fileName) {

            fileName = document.createElement("p");

            fileName.id = "selectedFileName";

            fileName.style.textAlign = "center";
            fileName.style.fontSize = "18px";
            fileName.style.fontWeight = "600";

            if (uploadCard) {
                uploadCard.appendChild(fileName);
            }
        }

        fileName.textContent = file.name;

        // Create analyze button
        createAnalyzeButton();
    };

    reader.readAsDataURL(file);
}


// ============================================
// 3. CREATE ANALYZE BUTTON
// ============================================

function createAnalyzeButton() {

    let analyzeButton = document.getElementById("analyzeButton");

    if (!analyzeButton) {

        analyzeButton = document.createElement("button");

        analyzeButton.id = "analyzeButton";

        analyzeButton.innerHTML = "🔍 Analyze Image";

        analyzeButton.style.display = "block";
        analyzeButton.style.margin = "30px auto";
        analyzeButton.style.padding = "18px 45px";
        analyzeButton.style.border = "none";
        analyzeButton.style.borderRadius = "16px";
        analyzeButton.style.background = "#26382a";
        analyzeButton.style.color = "white";
        analyzeButton.style.fontSize = "20px";
        analyzeButton.style.fontWeight = "700";
        analyzeButton.style.cursor = "pointer";

        analyzeButton.addEventListener("click", analyzeImage);

        if (uploadCard) {
            uploadCard.appendChild(analyzeButton);
        }
    }

    analyzeButton.style.display = "block";
}


// ============================================
// 4. ANALYZE IMAGE
// ============================================

async function analyzeImage() {

    if (!selectedFile) {

        alert("Please choose an image first.");

        return;
    }

    const analyzeButton =
        document.getElementById("analyzeButton");

    // Loading state
    if (analyzeButton) {

        analyzeButton.disabled = true;

        analyzeButton.innerHTML =
            "⏳ Analyzing Image...";

        analyzeButton.style.opacity = "0.7";
        analyzeButton.style.cursor = "not-allowed";
    }


    // Remove previous result
    const oldResult =
        document.getElementById("analysisResult");

    if (oldResult) {
        oldResult.remove();
    }


    // Create form data
    const formData = new FormData();

    formData.append("file", selectedFile);


    try {

        console.log("Sending image to backend...");


        // Call FastAPI
        const response = await fetch(
            API_URL,
            {
                method: "POST",
                body: formData
            }
        );


        if (!response.ok) {

            throw new Error(
                "Backend returned HTTP " +
                response.status
            );
        }


        const result = await response.json();

        console.log("Backend result:", result);


        // Check backend error
        if (result.error) {

            throw new Error(result.error);
        }


        // Show result
        showAnalysisResult(result);


    } catch (error) {

        console.error("Analysis error:", error);

        showError(error.message);

    } finally {

        // Restore button
        if (analyzeButton) {

            analyzeButton.disabled = false;

            analyzeButton.innerHTML =
                "🔍 Analyze Image";

            analyzeButton.style.opacity = "1";

            analyzeButton.style.cursor =
                "pointer";
        }
    }
}


// ============================================
// 5. SHOW ANALYSIS RESULT
// ============================================

function showAnalysisResult(result) {

    const prediction =
        result.prediction || "UNKNOWN";

    const confidence =
        Number(result.confidence || 0);


    const isAI =
        prediction === "AI GENERATED";


    const resultBox =
        document.createElement("div");

    resultBox.id = "analysisResult";


    resultBox.style.maxWidth = "850px";

    resultBox.style.margin =
        "40px auto";

    resultBox.style.padding =
        "45px 30px";

    resultBox.style.borderRadius =
        "28px";

    resultBox.style.textAlign =
        "center";

    resultBox.style.background =
        "#eef3e8";

    resultBox.style.boxShadow =
        "0 15px 40px rgba(0,0,0,0.08)";


    // Status icon
    const icon =
        document.createElement("div");

    icon.textContent =
        isAI ? "⚠️" : "✓";

    icon.style.fontSize =
        "55px";

    icon.style.marginBottom =
        "10px";


    // Prediction
    const title =
        document.createElement("h2");

    title.textContent =
        prediction;

    title.style.fontSize =
        "42px";

    title.style.margin =
        "10px 0";

    title.style.fontWeight =
        "800";

    title.style.color =
        "#18291d";


    // Confidence
    const confidenceText =
        document.createElement("p");

    confidenceText.innerHTML =
        "Confidence: <strong>" +
        confidence.toFixed(2) +
        "%</strong>";

    confidenceText.style.fontSize =
        "24px";

    confidenceText.style.margin =
        "15px 0 25px";


    // Confidence bar
    const barContainer =
        document.createElement("div");

    barContainer.style.width =
        "80%";

    barContainer.style.height =
        "14px";

    barContainer.style.margin =
        "0 auto 30px";

    barContainer.style.background =
        "#d8dfd2";

    barContainer.style.borderRadius =
        "20px";

    barContainer.style.overflow =
        "hidden";


    const bar =
        document.createElement("div");

    bar.style.width =
        Math.min(confidence, 100) + "%";

    bar.style.height =
        "100%";

    bar.style.background =
        "#304b35";

    bar.style.borderRadius =
        "20px";

    bar.style.transition =
        "width 1s ease";


    barContainer.appendChild(bar);


    // File name
    const fileInfo =
        document.createElement("p");

    fileInfo.innerHTML =
        "<strong>File:</strong> " +
        escapeHTML(result.filename || selectedFile.name);

    fileInfo.style.fontSize =
        "17px";


    // Model information
    const modelInfo =
        document.createElement("p");

    modelInfo.innerHTML =
        "<strong>Model:</strong> ResNet18";

    modelInfo.style.fontSize =
        "17px";


    // Status
    const status =
        document.createElement("p");

    status.innerHTML =
        "<strong>Status:</strong> Analysis Complete";

    status.style.fontSize =
        "17px";


    // Analyze another button
    const anotherButton =
        document.createElement("button");

    anotherButton.textContent =
        "Analyze Another Image";

    anotherButton.style.marginTop =
        "25px";

    anotherButton.style.padding =
        "15px 30px";

    anotherButton.style.border =
        "none";

    anotherButton.style.borderRadius =
        "14px";

    anotherButton.style.background =
        "#26382a";

    anotherButton.style.color =
        "white";

    anotherButton.style.fontSize =
        "17px";

    anotherButton.style.fontWeight =
        "700";

    anotherButton.style.cursor =
        "pointer";


    anotherButton.addEventListener(
        "click",
        resetAnalyzer
    );


    // Build result box
    resultBox.appendChild(icon);

    resultBox.appendChild(title);

    resultBox.appendChild(confidenceText);

    resultBox.appendChild(barContainer);

    resultBox.appendChild(fileInfo);

    resultBox.appendChild(modelInfo);

    resultBox.appendChild(status);

    resultBox.appendChild(anotherButton);


    // Add to page
    const main =
        document.querySelector("main");

    if (main) {

        main.appendChild(resultBox);

        resultBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } else {

        document.body.appendChild(resultBox);
    }
}


// ============================================
// 6. ERROR MESSAGE
// ============================================

function showError(message) {

    const errorBox =
        document.createElement("div");

    errorBox.id =
        "analysisResult";


    errorBox.style.maxWidth =
        "850px";

    errorBox.style.margin =
        "40px auto";

    errorBox.style.padding =
        "40px";

    errorBox.style.borderRadius =
        "25px";

    errorBox.style.textAlign =
        "center";

    errorBox.style.background =
        "#f1f5ec";


    errorBox.innerHTML = `

        <div style="font-size:50px;">
            ⚠️
        </div>

        <h2 style="
            font-size:36px;
            margin:15px 0;
            color:#18291d;
        ">
            Analysis Failed
        </h2>

        <p style="
            font-size:20px;
            color:#59645a;
        ">
            ${escapeHTML(message)}
        </p>

        <p style="
            font-size:16px;
            color:#59645a;
        ">
            Make sure your backend server is running.
        </p>
    `;


    const main =
        document.querySelector("main");

    if (main) {

        main.appendChild(errorBox);

        errorBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } else {

        document.body.appendChild(errorBox);
    }
}


// ============================================
// 7. RESET
// ============================================

function resetAnalyzer() {

    selectedFile = null;


    // Remove preview
    const preview =
        document.getElementById("imagePreview");

    if (preview) {
        preview.remove();
    }


    // Remove filename
    const fileName =
        document.getElementById("selectedFileName");

    if (fileName) {
        fileName.remove();
    }


    // Remove analyze button
    const analyzeButton =
        document.getElementById("analyzeButton");

    if (analyzeButton) {
        analyzeButton.remove();
    }


    // Remove result
    const result =
        document.getElementById("analysisResult");

    if (result) {
        result.remove();
    }


    // Reset input
    if (imageInput) {
        imageInput.value = "";
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ============================================
// 8. DRAG AND DROP
// ============================================

if (uploadCard) {

    uploadCard.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            uploadCard.style.opacity =
                "0.7";
        }
    );


    uploadCard.addEventListener(
        "dragleave",
        function () {

            uploadCard.style.opacity =
                "1";
        }
    );


    uploadCard.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();

            uploadCard.style.opacity =
                "1";

            const files =
                event.dataTransfer.files;

            if (
                files &&
                files.length > 0
            ) {

                const file =
                    files[0];

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    alert(
                        "Please select an image file."
                    );

                    return;
                }

                selectedFile = file;

                showImagePreview(file);
            }
        }
    );
}


// ============================================
// 9. HTML ESCAPE
// ============================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


console.log(
    "AI Image Authenticator frontend loaded."
);