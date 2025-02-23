# StreetSense
*Navigating the World, Beyond Sight.*

In our modern world, many visually impaired people face significant challenges when navigating city streets. They struggle with identifying street signs, detecting traffic lights, and understanding their surroundings, which can create a sense of isolation and dependency. Our solution provides real-time, AI-powered assistance to enhance the mobility and independence of visually impaired individuals, ensuring they can safely navigate urban environments.

## Key Features
It Utilizes AI models to identify and interpret street signs, traffic lights, and obstacles using Orkus, OpenCV, YOLOv3 providing immediate feedback to the user.​
User Interface: A frontend interface that displays processed information in an accessible manner, potentially offering voice feedback or haptic responses.​
API Integration: The backend likely exposes endpoints that the frontend communicates with, facilitating the exchange of data and AI model predictions.

Below is the flowchart of how Streetsmart works
![Flowchart (1)](https://github.com/user-attachments/assets/0211bd15-0982-4ba2-8157-4bc3b585a090)

Conductor - Gemini for OCR

![image](https://github.com/user-attachments/assets/88aef933-d1ae-48eb-811b-4ebe67798925)

Decide Safest Action

![image](https://github.com/user-attachments/assets/d3375dc1-30c5-400a-a54f-454489bf04ed)

## What to improve in the future
Training the model to be more accurate is required. The project was initally supposed to connect with Flutter and Firebase but could not be implemented or debugged in the given timeframe. Lastly, an upgrade on the UI would make the application more lively for the future customers

## How it Works
### 1. User Captures Image
- The user interacts with the frontend (React), which connects to the device’s camera (via the mobile app or web interface).
- The camera captures the image of the environment (e.g., street, traffic signs, pedestrians).
### 2. Image Sent to Backend
- The captured image is sent to the Flask backend using an HTTP request (POST).
- The image is sent in base64 encoding so that it can be transmitted as text over the network.
### 3. Image Processing in Backend
- YOLO Object Detection:
    - The backend uses a custom-trained YOLO model (Ultralytics) to detect various objects in the image (e.g., traffic signs, vehicles, pedestrians).
        - Trained using a customer dataset and roboflow 
    - It identifies the type of object and its confidence level.
### MiDaS Depth Estimation:
- The backend uses the MiDaS model (via ONNX Runtime) to estimate the depth of the objects in the image.
- This allows the system to determine how far away objects are (useful for assessing safety when crossing streets).
### 4. Workflow Decision with Orkes Conductor
- Once objects are detected and their distances are calculated, the backend sends this data to Orkes Conductor for decision-making.
- If a store sign is detected, the image is sent to Gemini to recognize the text on the sign (e.g., the name of the store).
- If safety-related objects are detected (e.g., traffic lights, crosswalks), Orkes Conductor determines the next steps (e.g., whether it is safe to cross the street, if the light is red or green).
- This decision-making process is based on the objects detected in the image and the context of their surroundings (e.g., is the crosswalk clear? Is the light green?).
### 5. Feedback Sent to Frontend
- After Orkes Conductor processes the data, the backend sends the decision back to the frontend (needs to be implemented).
- The frontend then displays relevant feedback:
    - Text-to-Speech (TTS): Provides verbal feedback, such as "Green light, you can cross" or "Store sign detected: [Store Name]".
    - Vibration Alerts: In case of unsafe situations (e.g., red light, obstacles in the path), the app sends vibration feedback to alert the user.
### 6. User Receives Feedback
- The user receives the feedback via audio cues and vibration alerts, allowing them to make informed decisions about their navigation.
- For instance, the system will notify the user when it is safe to cross the street or when a store sign is detected nearby.
### 7. Repeat Process
- The system continuously processes new frames captured by the camera, sending the images to the backend for analysis and feedback.
- As the user moves through the environment, the system will update with new feedback based on the surrounding objects.

## Installation Steps
To set up the project locally:

1. Clone the Repository:
```
git clone https://github.com/Jay0496/safe-vision-guide.git
cd safe-vision-guide
```
Install Frontend Dependencies:
Ensure you have Node.js installed.​
Navigate to the root directory and run:​
```
npm install
```
Install Backend Dependencies:
Ensure you have Python and pip installed.​
Navigate to the backend/ directory:​
```
cd backend
```
Install the required Python packages:​
```
pip install -r requirements.txt
```
Running the Application:

Frontend: From the root directory:​
```
npm run dev
```
This starts the frontend development server, typically accessible at http://localhost:3000/.

Backend: From the backend/ directory:​
```
flask run
```
This starts the Flask server, typically accessible at http://localhost:5000/.





