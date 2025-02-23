import { useState, useEffect } from 'react';
import CameraView from '@/components/Camera';
import Feedback from '@/components/Feedback';
import { toast } from 'sonner';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState({
    message: '',
    isSafe: true
  });
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const processFrame = async (imageData: string) => {
    try {
      const response = await fetch('http://localhost:5000/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setFeedback({
        message: data.message,
        isSafe: data.isSafe
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Error processing image. Please try again.');
      setFeedback({
        message: 'Error processing image',
        isSafe: false
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    // Check for camera permission on page load
    const checkCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // If the promise resolves, camera permission is granted
        setHasCameraPermission(true);
        stream.getTracks().forEach(track => track.stop()); // Stop the stream after checking
      } catch (err) {
        // If the promise is rejected, camera permission is denied
        setHasCameraPermission(false);
      }
    };

    checkCameraPermission();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            SafeVision Guide
          </h1>
          <p className="text-gray-500">
            Your AI-powered navigation assistant
          </p>
        </header>

        {hasCameraPermission === null && (
          // Show grey block when checking for permission
          <div className="flex items-center justify-center bg-gray-200 w-full h-56">
            <span className="text-xl text-gray-500">Waiting for camera permission...</span>
          </div>
        )}

        {hasCameraPermission === false && (
          // Show message when camera permission is denied
          <div className="flex items-center justify-center bg-gray-200 w-full h-56">
            <span className="text-xl text-gray-500">Camera access denied. Please enable camera permission.</span>
          </div>
        )}

        {hasCameraPermission === true && (
          // If permission is granted, show the camera view
          <CameraView 
            onFrame={(imageData) => {
              setIsProcessing(true);
              processFrame(imageData);
            }} 
          />
        )}

        <div className="space-y-4">
          <Feedback
            message={feedback.message}
            isProcessing={isProcessing}
            isSafe={feedback.isSafe}
          />
        </div>
      </div>
    </div>
  );
};

export default Index