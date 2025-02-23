
import { useState } from 'react';
import CameraView from '@/components/Camera';
import Feedback from '@/components/Feedback';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState({
    message: '',
    isSafe: true
  });

  // This is a mock function for now - we'll integrate with real AI later
  const mockProcessFrame = (imageData: string) => {
    // Simulate random detection results
    const objects = ['store sign', 'person', 'car', 'bicycle'];
    const distances = [2, 5, 8, 10];
    
    const randomIdx = Math.floor(Math.random() * objects.length);
    const object = objects[randomIdx];
    const distance = distances[randomIdx];
    
    const isSafe = distance > 6;
    const message = `${object} detected ${distance} feet away`;
    
    setFeedback({ message, isSafe });
  };

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

        <CameraView 
          onFrame={(imageData) => {
            setIsProcessing(true);
            mockProcessFrame(imageData);
          }} 
        />

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

export default Index;
