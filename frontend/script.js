// ============================================================
// AI IMAGE AUTHENTICATOR - FRONTEND SCRIPT
// ============================================================

// ============================================================
// 1. BACKEND API
// ============================================================

const API_URL = "https://ai-image-authenticator.onrender.com";


// ============================================================
// 2. GET HTML ELEMENTS
// ============================================================

const imageInput = document.getElementById("imageInput");
const uploadCard = document.getElementById("uploadCard");


// Try to find the analyze button using common IDs
const analyzeButton =
    document.getElementById("analyzeBtn") ||
    document.getElementById("analyzeButton") ||
    document.querySelector(".analyze-btn") ||
    document.querySelector("button");


// ============================================================
// 3. VARIABLES
// ============================================================

let selectedFile = null;


// ============================================================
// 4. CREATE / FIND RESULT ELEMENT
// ============================================================

let resultContainer =
    document.getElementById("result") ||
    document.getElementById("resultContainer") ||
    document.getElementById("analysisResult");


// ============================================================
// 5. FILE VALIDATION
// ============================================================

function isValidImage(file) {

    if (!file) {
        return false;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    return allowedTypes.includes(file.type);
}


// ============================================================
// 6. SELECT IMAGE
// ============================================================

function handleFile(file) {

    if (!file) {
        return;
    }


    // Check image type
    if (!isValidImage(file)) {

        alert(
            "Please select a JPG, JPEG, PNG or WEBP image."
        );

        return;
    }


    // Store selected image
    selectedFile = file;


    console.log("Selected image:", file.name);


    // Show preview
    showImagePreview(file);


    // Enable analyze button
    if (analyzeButton) {
        analyzeButton.disabled = false;
        analyzeButton.style.opacity = "1";
        analyzeButton.style.cursor = "pointer";
    }
}


// ============================================================
// 7. SHOW IMAGE PREVIEW
// ============================================================

function showImagePreview(file) {

    const reader = new FileReader();


    reader.onload = function (event) {

        // Find existing preview image
        let preview =
            document.getElementById("previewImage");


        // If preview doesn't exist, create it
        if (!preview) {

            preview = document.createElement("img");

            preview.id = "previewImage";

            preview.style.maxWidth = "500px";
            preview.style.maxHeight = "500px";
            preview.style.width = "auto";
            preview.style.height = "auto";
            preview.style.display = "block";
            preview.style.margin = "20px auto";
            preview.style.borderRadius = "15px";
            preview.style.objectFit = "contain";


            // Put preview inside upload card
            if (uploadCard) {
                uploadCard.appendChild(preview);
            }
        }


        preview.src = event.target.result;
        preview.style.display = "block";


        // Show filename
        let filenameElement =
            document.getElementById("fileName");


        if (filenameElement) {

            filenameElement.textContent =
                file.name;
        }
    };


    reader.readAsDataURL(file);
}


// ============================================================
// 8. NORMAL FILE SELECTION
// ============================================================

if (imageInput) {

    imageInput.addEventListener(
        "change",
        function () {

            if (
                this.files &&
                this.files.length > 0
            ) {

                handleFile(this.files[0]);
            }
        }
    );
}


// ============================================================
// 9. DRAG & DROP
// ============================================================

if (uploadCard) {


    // Drag over
    uploadCard.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            uploadCard.classList.add("drag-over");
        }
    );


    // Drag leave
    uploadCard.addEventListener(
        "dragleave",
        function () {

            uploadCard.classList.remove(
                "drag-over"
            );
        }
    );


    // Drop
    uploadCard.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();


            uploadCard.classList.remove(
                "drag-over"
            );


            const files =
                event.dataTransfer.files;


            if (
                files &&
                files.length > 0
            ) {

                handleFile(files[0]);
            }
        }
    );
}


// ============================================================
// 10. UPLOAD CARD CLICK
// ============================================================

if (uploadCard && imageInput) {

    uploadCard.addEventListener(
        "click",
        function (event) {

            // Don't trigger if clicking
            // an existing button
            if (
                event.target.tagName === "BUTTON"
            ) {
                return;
            }


            imageInput.click();
        }
    );
}


// ============================================================
// 11. ANALYZE IMAGE
// ============================================================

async function analyzeImage() {


    // Check image
    if (!selectedFile) {

        alert(
            "Please select an image first."
        );

        return;
    }


    console.log(
        "Starting image analysis..."
    );


    // Show loading
    showLoading();


    // Create FormData
    const formData = new FormData();


    formData.append(
        "file",
        selectedFile
    );


    try {


        // ====================================================
        // SEND IMAGE TO FASTAPI
        // ====================================================

        const response = await fetch(
            `${API_URL}/predict`,
            {
                method: "POST",
                body: formData
            }
        );


        console.log(
            "API status:",
            response.status
        );


        // ====================================================
        // CHECK RESPONSE
        // ====================================================

        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );
        }


        // Convert response to JSON
        const result =
            await response.json();


        console.log(
            "Prediction result:",
            result
        );


        // ====================================================
        // CHECK API ERROR
        // ====================================================

        if (result.error) {

            showError(
                result.error
            );

            return;
        }


        // ====================================================
        // SHOW RESULT
        // ====================================================

        showResult(result);


    } catch (error) {

        console.error(
            "Analysis error:",
            error
        );


        showError(
            "Unable to connect to the AI server. " +
            "Please try again in a few seconds."
        );
    }
}


// ============================================================
// 12. ANALYZE BUTTON EVENT
// ============================================================

if (analyzeButton) {

    analyzeButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            analyzeImage();
        }
    );
}


// ============================================================
// 13. SHOW LOADING
// ============================================================

function showLoading() {

    let container =
        getResultContainer();


    container.innerHTML = `

        <div class="analysis-result">

            <h2>
                🔍 Analyzing Image...
            </h2>

            <p>
                Please wait while the AI model
                analyzes your image.
            </p>

            <div class="loader"></div>

        </div>

    `;


    container.style.display = "block";
}


// ============================================================
// 14. SHOW RESULT
// ============================================================

function showResult(result) {


    const prediction =
        result.prediction || "UNKNOWN";


    const confidence =
        result.confidence ?? 0;


    const filename =
        result.filename || selectedFile?.name || "";


    // Determine result type
    const isAI =
        prediction.toUpperCase()
            .includes("AI");


    const isReal =
        prediction.toUpperCase()
            .includes("REAL");


    let icon = "🔍";


    if (isAI) {

        icon = "🤖";

    } else if (isReal) {

        icon = "✅";
    }


    // Get result container
    const container =
        getResultContainer();


    // Display result
    container.innerHTML = `

        <div class="analysis-result">

            <h2>
                ${icon} ${prediction}
            </h2>

            <p>
                Confidence:
                <strong>
                    ${confidence.toFixed(2)}%
                </strong>
            </p>

            <p class="filename">
                ${filename}
            </p>

        </div>

    `;


    container.style.display = "block";


    // Scroll to result
    container.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


// ============================================================
// 15. SHOW ERROR
// ============================================================

function showError(message) {

    const container =
        getResultContainer();


    container.innerHTML = `

        <div class="analysis-result error">

            <h2>
                ⚠️ Analysis Failed
            </h2>

            <p>
                ${message}
            </p>

            <p>
                Make sure the backend server
                is running and try again.
            </p>

        </div>

    `;


    container.style.display = "block";
}


// ============================================================
// 16. GET RESULT CONTAINER
// ============================================================

function getResultContainer() {

    if (resultContainer) {

        return resultContainer;
    }


    // Create result container
    resultContainer =
        document.createElement("div");


    resultContainer.id =
        "analysisResult";


    resultContainer.style.display =
        "none";


    resultContainer.style.margin =
        "30px auto";


    resultContainer.style.maxWidth =
        "900px";


    resultContainer.style.padding =
        "30px";


    resultContainer.style.textAlign =
        "center";


    // Add to page
    document.body.appendChild(
        resultContainer
    );


    return resultContainer;
}


// ============================================================
// 17. ADD LOADING CSS
// ============================================================

const style =
    document.createElement("style");


style.textContent = `

    .analysis-result {
        background: #eef3e9;
        padding: 45px;
        border-radius: 25px;
        text-align: center;
        margin: 30px auto;
        max-width: 900px;
    }

    .analysis-result h2 {
        font-size: 42px;
        margin-bottom: 20px;
    }

    .analysis-result p {
        font-size: 24px;
        color: #647064;
    }

    .analysis-result strong {
        font-size: 28px;
        color: #26382a;
    }

    .analysis-result.error {
        background: #fff1f1;
    }

    .analysis-result.error h2 {
        color: #b42318;
    }

    .filename {
        font-size: 16px !important;
        margin-top: 20px;
    }

    .loader {
        width: 45px;
        height: 45px;
        border: 5px solid #d5ddd0;
        border-top: 5px solid #26382a;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 25px auto;
    }

    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }

    .drag-over {
        border-color: #26382a !important;
        transform: scale(1.01);
    }

`;


document.head.appendChild(style);


// ============================================================
// 18. BACKEND HEALTH CHECK
// ============================================================

async function checkBackend() {

    try {

        const response =
            await fetch(
                `${API_URL}/health`
            );


        if (response.ok) {

            const data =
                await response.json();

            console.log(
                "Backend health:",
                data
            );

        } else {

            console.warn(
                "Backend health check failed."
            );
        }

    } catch (error) {

        console.warn(
            "Backend is not reachable:",
            error
        );
    }
}


// ============================================================
// 19. START HEALTH CHECK
// ============================================================

checkBackend();


console.log(
    "AI Image Authenticator frontend loaded."
);