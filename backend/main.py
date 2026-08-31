from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

import torch
import torch.nn as nn

from PIL import Image
from torchvision import transforms
from torchvision.models import resnet18

import io
from pathlib import Path


# ============================================
# 1. Create FastAPI application
# ============================================

app = FastAPI(
    title="AI Image Authenticator API",
    description="API for detecting AI-generated and real images",
    version="1.0"
)


# ============================================
# 2. Allow frontend to connect
# ============================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# 3. Device
# ============================================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Using device:", device)


# ============================================
# 4. Image preprocessing
# ============================================

transform = transforms.Compose([
    transforms.Resize((224, 224)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ============================================
# 5. Create model
# ============================================

model = resnet18(weights=None)

model.fc = nn.Linear(
    model.fc.in_features,
    2
)


# ============================================
# 6. Find trained model
# ============================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = (
    BASE_DIR
    / "model"
    / "ai_image_authenticator.pth"
)


print("Model path:", MODEL_PATH)


# ============================================
# 7. Check model exists
# ============================================

if not MODEL_PATH.exists():

    raise FileNotFoundError(
        f"Trained model not found at: {MODEL_PATH}"
    )


# ============================================
# 8. Load trained model
# ============================================

model.load_state_dict(
    torch.load(
        MODEL_PATH,
        map_location=device
    )
)

model = model.to(device)

model.eval()

print(
    "AI Image Authenticator model "
    "loaded successfully!"
)


# ============================================
# 9. Class names
# ============================================

classes = [
    "AI GENERATED",
    "REAL IMAGE"
]


# ============================================
# 10. Home endpoint
# ============================================

@app.get("/")
def home():

    return {
        "message": "AI Image Authenticator API is running"
    }


# ============================================
# 11. Prediction endpoint
# ============================================

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):

    try:

        # ------------------------------------
        # Check file
        # ------------------------------------

        if not file.filename:

            return {
                "error": "No image file selected."
            }


        # ------------------------------------
        # Check image type
        # ------------------------------------

        allowed_types = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ]

        if file.content_type not in allowed_types:

            return {
                "error":
                "Unsupported image format. "
                "Use JPG, JPEG, PNG or WEBP."
            }


        # ------------------------------------
        # Read uploaded image
        # ------------------------------------

        image_bytes = await file.read()


        # ------------------------------------
        # Convert to PIL image
        # ------------------------------------

        image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")


        # ------------------------------------
        # Preprocess image
        # ------------------------------------

        image_tensor = transform(image)

        image_tensor = image_tensor.unsqueeze(0)

        image_tensor = image_tensor.to(device)


        # ------------------------------------
        # Make prediction
        # ------------------------------------

        with torch.no_grad():

            output = model(
                image_tensor
            )

            probabilities = torch.softmax(
                output,
                dim=1
            )

            confidence, predicted = torch.max(
                probabilities,
                1
            )


        # ------------------------------------
        # Get prediction
        # ------------------------------------

        prediction = classes[
            predicted.item()
        ]


        # ------------------------------------
        # Confidence percentage
        # ------------------------------------

        confidence_percentage = (
            confidence.item() * 100
        )


        # ------------------------------------
        # Return result
        # ------------------------------------

        return {

            "filename": file.filename,

            "prediction": prediction,

            "confidence": round(
                confidence_percentage,
                2
            )

        }


    except Exception as e:

        print(
            "Prediction error:",
            str(e)
        )

        return {

            "error": str(e)

        }