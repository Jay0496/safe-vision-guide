
import { useState } from 'react';
import CameraView from '@/components/Camera';
import Feedback from '@/components/Feedback';
import { toast } from 'sonner';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState({
    message: '',
    isSafe: true
  });

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
            processFrame(imageData);
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
