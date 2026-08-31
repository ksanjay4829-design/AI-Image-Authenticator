import sys
import torch
from PIL import Image
from torchvision import transforms
from torchvision.models import resnet18
import torch.nn as nn


# -----------------------------
# 1. Check image path
# -----------------------------
if len(sys.argv) < 2:
    print("Please provide an image path.")
    print("Example:")
    print(r"python model\predict.py dataset\ai\image.jpg")
    sys.exit()


image_path = sys.argv[1]


# -----------------------------
# 2. Device
# -----------------------------
device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Using device:", device)


# -----------------------------
# 3. Image preprocessing
# -----------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# -----------------------------
# 4. Create model
# -----------------------------
model = resnet18(weights=None)

model.fc = nn.Linear(
    model.fc.in_features,
    2
)


# -----------------------------
# 5. Load trained model
# -----------------------------
model.load_state_dict(
    torch.load(
        "model/ai_image_authenticator.pth",
        map_location=device
    )
)

model = model.to(device)

model.eval()


# -----------------------------
# 6. Load image
# -----------------------------
try:
    image = Image.open(image_path).convert("RGB")
except Exception as e:
    print("Could not open image.")
    print("Error:", e)
    sys.exit()


# -----------------------------
# 7. Prepare image
# -----------------------------
image_tensor = transform(image)

image_tensor = image_tensor.unsqueeze(0)

image_tensor = image_tensor.to(device)


# -----------------------------
# 8. Prediction
# -----------------------------
with torch.no_grad():

    output = model(image_tensor)

    probabilities = torch.softmax(
        output,
        dim=1
    )

    confidence, predicted = torch.max(
        probabilities,
        1
    )


# -----------------------------
# 9. Class names
# -----------------------------
classes = [
    "AI GENERATED",
    "REAL IMAGE"
]


prediction = classes[predicted.item()]

confidence_percentage = (
    confidence.item() * 100
)


# -----------------------------
# 10. Result
# -----------------------------
print()
print("==============================")
print("       IMAGE AUTHENTICATOR")
print("==============================")

print("Image:", image_path)

print()
print("Prediction:", prediction)

print(
    f"Confidence: {confidence_percentage:.2f}%"
)

print("==============================")