import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# Load the trained model
# Note: In a real deployment, ensure model.h5 is in the same directory
MODEL_PATH = 'model.h5'
model = None

if os.path.exists(MODEL_PATH):
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully.")
else:
    print("Warning: model.h5 not found. Inference will not work.")

# Disease labels (Example - should match your training classes)
CLASS_NAMES = [
    "Apple Scab", "Apple Black Rot", "Cedar Apple Rust", "Apple Healthy",
    "Corn Cercospora Leaf Spot", "Corn Common Rust", "Corn Northern Leaf Blight", "Corn Healthy",
    "Tomato Bacterial Spot", "Tomato Early Blight", "Tomato Late Blight", "Tomato Healthy"
]

def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        image_bytes = file.read()
        processed_image = preprocess_image(image_bytes)
        
        if model:
            predictions = model.predict(processed_image)
            class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][class_idx])
            disease = CLASS_NAMES[class_idx] if class_idx < len(CLASS_NAMES) else "Unknown"
            
            return jsonify({
                'disease': disease,
                'confidence': confidence
            })
        else:
            # Fallback for demo if model isn't loaded
            return jsonify({
                'disease': 'Demo: Healthy Leaf',
                'confidence': 0.99,
                'note': 'This is a demo response as model.h5 was not found.'
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
