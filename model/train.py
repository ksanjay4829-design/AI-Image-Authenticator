import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader, random_split
from torchvision.models import resnet18, ResNet18_Weights
import torch.nn as nn
import torch.optim as optim

# -----------------------------
# 1. Device
# -----------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Using device:", device)

# -----------------------------
# 2. Image transformations
# -----------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# -----------------------------
# 3. Load dataset
# -----------------------------
dataset = datasets.ImageFolder(
    "dataset",
    transform=transform
)

print("Classes:", dataset.classes)
print("Total images:", len(dataset))

# -----------------------------
# 4. Train / validation split
# -----------------------------
train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size

train_dataset, val_dataset = random_split(
    dataset,
    [train_size, val_size],
    generator=torch.Generator().manual_seed(42)
)

print("Training images:", len(train_dataset))
print("Validation images:", len(val_dataset))

# -----------------------------
# 5. Data loaders
# -----------------------------
train_loader = DataLoader(
    train_dataset,
    batch_size=16,
    shuffle=True
)

val_loader = DataLoader(
    val_dataset,
    batch_size=16,
    shuffle=False
)

# -----------------------------
# 6. Load pretrained ResNet18
# -----------------------------
weights = ResNet18_Weights.DEFAULT

model = resnet18(weights=weights)

# Replace final layer
model.fc = nn.Linear(
    model.fc.in_features,
    2
)

model = model.to(device)

# -----------------------------
# 7. Loss and optimizer
# -----------------------------
criterion = nn.CrossEntropyLoss()

optimizer = optim.Adam(
    model.parameters(),
    lr=0.0001
)

# -----------------------------
# 8. Training
# -----------------------------
epochs = 10

for epoch in range(epochs):

    model.train()

    running_loss = 0
    correct = 0
    total = 0

    for images, labels in train_loader:

        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        running_loss += loss.item()

        _, predicted = torch.max(outputs, 1)

        total += labels.size(0)

        correct += (predicted == labels).sum().item()

    train_accuracy = 100 * correct / total

    # -----------------------------
    # Validation
    # -----------------------------
    model.eval()

    val_correct = 0
    val_total = 0

    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)

            _, predicted = torch.max(outputs, 1)

            val_total += labels.size(0)

            val_correct += (
                predicted == labels
            ).sum().item()

    val_accuracy = 100 * val_correct / val_total

    print(
        f"Epoch [{epoch+1}/{epochs}] "
        f"Loss: {running_loss:.4f} "
        f"Train Accuracy: {train_accuracy:.2f}% "
        f"Validation Accuracy: {val_accuracy:.2f}%"
    )

# -----------------------------
# 9. Save model
# -----------------------------
torch.save(
    model.state_dict(),
    "model/ai_image_authenticator.pth"
)

print()
print("Training complete!")
print("Model saved as:")
print("model/ai_image_authenticator.pth")