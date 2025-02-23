from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import torch
import io
from ultralytics import YOLO
import onnxruntime as ort  # MiDaS runs using ONNX

# Load models
app = Flask(__name__)
CORS(app)

# Load YOLO model
yolo_model = YOLO("C:\\Users\\jaysa\\safe-vision-guide\\backend\\best (1).pt")

# Load MiDaS depth estimation model
midas_session = ort.InferenceSession("C:\\Users\\jaysa\\safe-vision-guide\\backend\\midas_optimized.onnx")  # Ensure you have the correct model

# Function to decode image from base64
def decode_image(base64_string):
    img_data = base64.b64decode(base64_string)
    np_arr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

# Function to get object detection results from YOLO
def detect_objects(image):
    try:
        results = yolo_model(image)
        detections = []
        
        for r in results:
            for box in r.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])  # Bounding box
                conf = float(box.conf[0])  # Confidence
                cls = int(box.cls[0])  # Class index
                label = yolo_model.names[cls]  # Object label
                
                detections.append({
                    "label": label,
                    "confidence": conf,
                    "bbox": [x1, y1, x2, y2]
                })
        
        return detections
    except AttributeError as e:
        if str(e) == "'Conv' object has no attribute 'bn'":
            for m in yolo_model.model.modules():
                if hasattr(m, 'bn'):
                    continue  # The layer has batch norm, no action needed
                elif isinstance(m, torch.nn.Conv2d):
                    # If the Conv layer has no batch norm, add a dummy BatchNorm layer
                    m.bn = torch.nn.Identity()  # Acts as a placeholder
            print("Fixed missing 'bn' attributes in Conv layers.")

# Function to estimate depth using MiDaS
def estimate_depth(image):
    # Convert to grayscale and resize for MiDaS
    img = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (256, 256))  # MiDaS requires specific input size
    img = img.astype(np.float32) / 255.0
    img = np.expand_dims(img.transpose(2, 0, 1), axis=0)

    # Run inference
    ort_inputs = {midas_session.get_inputs()[0].name: img}
    depth_map = midas_session.run(None, ort_inputs)[0]

    return depth_map

# Main route to process images
@app.route('/process-image', methods=['POST'])

def process_image():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image part in the request"}), 400

        file = request.files['image']

        if file.filename == '':
            return jsonify({"error": "No image selected"}), 400

        if file:
            # Read the file into memory
            in_memory_file = io.BytesIO(file.read())
            # Decode the image using cv2
            np_arr = np.frombuffer(in_memory_file.getvalue(), np.uint8)
            image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if image is None:
                return jsonify({"error": "Failed to decode image"}), 400
        
        # Run YOLO detection
        detections = detect_objects(image)
        
        # Run MiDaS depth estimation
        depth_map = estimate_depth(image)
        print("Depth map shape:", depth_map.shape)
        
        # Identify store signs and nearby objects
        store_sign_detected = False
        objects_to_send = []
        
        for detection in detections:
            x1, y1, x2, y2 = detection["bbox"]
            label = detection["label"]
            
            # Estimate depth at center of object
            center_x, center_y = (x1 + x2) // 2, (y1 + y2) // 2
            depth_value = depth_map[0, center_y, center_x]  # Get depth at that point
            
            # Convert depth to approximate real-world distance (Needs calibration)
            estimated_distance = depth_value * 10  # Scale factor for depth

            if label == "store-sign" and estimated_distance <= 6:
                store_sign_detected = True
                _, img_encoded = cv2.imencode('.jpg', image)
                base64_img = base64.b64encode(img_encoded).decode('utf-8')
                objects_to_send.append({"label": label, "distance": estimated_distance, "image": base64_img})
            
            elif estimated_distance <= 10:
                objects_to_send.append({"label": label, "distance": estimated_distance})

        # Send to Orkes Conductor
        response_json = send_to_orkes(objects_to_send, store_sign_detected)

        return jsonify(response_json)
    except Exception as e:
        print(f"Exception occurred: {e}")
        return jsonify({"error": str(e)}), 500

# Function to send data to Orkes Conductor
def send_to_orkes(objects, store_sign_detected):
    # Define payload
    payload = {
        "storeSignDetected": store_sign_detected,
        "objects": objects
    }

    # TODO: Send this to Orkes via a POST request and get a response
    # Mock response for now
    return {
        "message": "Watch out! A store sign is ahead!" if store_sign_detected else "Safe to proceed.",
        "isSafe": not store_sign_detected
    }

if __name__ == '__main__':
    app.run(debug=True)
