# AI Image Authenticator 🔍

An AI-powered web application that analyzes an uploaded image and predicts whether it is **AI Generated** or a **Real Image**.

The project uses a deep learning image-classification model built with **PyTorch and ResNet18**, exposed through a **FastAPI backend** and connected to a responsive HTML/CSS/JavaScript frontend.

---

## 🚀 Features

- Upload images directly from the browser
- Drag-and-drop image upload
- AI-generated vs real-image classification
- Confidence score for each prediction
- FastAPI REST API
- PyTorch deep learning model
- ResNet18 architecture
- Responsive web interface
- Separate frontend and backend architecture

---

## 🧠 Technology Stack

### Machine Learning
- Python
- PyTorch
- Torchvision
- ResNet18
- PIL

### Backend
- FastAPI
- Uvicorn
- Python
- REST API
- CORS

### Frontend
- HTML5
- CSS3
- JavaScript

### Development
- Visual Studio Code
- Git
- GitHub

---

## 📁 Project Structure

```text
AI-Image-Authenticator/
│
├── backend/
│   └── main.py
│
├── frontend/
│   ├── index.html
│   ├── analyze.html
│   ├── style.css
│   └── script.js
│
├── model/
│   ├── ai_image_authenticator.pth
│   ├── train.py
│   └── predict.py
│
├── forensic/
│
├── dataset/
│
├── requirements.txt
├── test_setup.py
├── .gitignore
└── README.md
