# AgroDetect AI - Plant Disease Classification Engine

AgroDetect AI uses deep learning (MobileNetV2) to detect plant diseases from leaf images.

## Project Structure
- `backend/`: Flask API for model inference.
- `model/`: Python training script using TensorFlow/Keras.
- `src/`: React frontend (Vite + Tailwind CSS).
- `src/services/geminiService.ts`: AI integration for the preview environment.

## How to Run Locally

### 1. Backend (Python/Flask)
1. Navigate to `backend/`.
2. Install dependencies: `pip install flask flask-cors tensorflow pillow numpy`.
3. Run the server: `python app.py`.
4. The API will be available at `http://localhost:5000/predict`.

### 2. Model Training
1. Navigate to `model/`.
2. Ensure you have a `dataset/` folder with subdirectories for each class.
3. Run `python train_model.py` to train and save `model.h5`.

### 3. Frontend (React)
1. Install dependencies: `npm install`.
2. Run the development server: `npm run dev`.
3. Open `http://localhost:3000` in your browser.

## Deployment Instructions

### Option 1: Render / Railway (PaaS)
1. **Backend**: Deploy the `backend/` folder as a Web Service. Set the build command to `pip install -r requirements.txt` and start command to `python app.py`.
2. **Frontend**: Deploy the root folder as a Static Site. Set the build command to `npm run build` and publish directory to `dist/`.

### Option 2: Docker
1. Create a `Dockerfile` in the root:
   ```dockerfile
   FROM python:3.9-slim
   WORKDIR /app
   COPY . .
   RUN pip install -r backend/requirements.txt
   CMD ["python", "backend/app.py"]
   ```
2. Build and run: `docker build -t agrodetect . && docker run -p 5000:5000 agrodetect`.

## AI Model Details
- **Architecture**: MobileNetV2 (Transfer Learning)
- **Input Size**: 224x224x3
- **Optimizer**: Adam
- **Loss**: Categorical Crossentropy
- **Callbacks**: EarlyStopping, ReduceLROnPlateau
