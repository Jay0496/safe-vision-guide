# StreetSense
Navigating the World, Beyond Sight. 
In our modern world, many visually impaired people face significant challenges when navigating city streets. They struggle with identifying street signs, detecting traffic lights, and understanding their surroundings, which can create a sense of isolation and dependency. Our solution provides real-time, AI-powered assistance to enhance the mobility and independence of visually impaired individuals, ensuring they can safely navigate urban environments.

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

## Key Features
It Utilizes AI models to identify and interpret street signs, traffic lights, and obstacles using Orkus, OpenCV, YOLOv3 providing immediate feedback to the user.​
User Interface: A frontend interface that displays processed information in an accessible manner, potentially offering voice feedback or haptic responses.​
API Integration: The backend likely exposes endpoints that the frontend communicates with, facilitating the exchange of data and AI model predictions.

Below is the flowchart of how Streetsmart works
![Flowchart (1)](https://github.com/user-attachments/assets/0211bd15-0982-4ba2-8157-4bc3b585a090)

## What to improve in the future
Training the model to be more accurate is required. The project was initally supposed to connect with Flutter and Firebase but could not be implemented or debugged in the given timeframe. Lastly, an upgrade on the UI would make the application more lively for the future customers



