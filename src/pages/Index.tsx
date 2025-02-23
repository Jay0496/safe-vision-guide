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

  // Convert base64 string to Blob
  const base64ToBlob = (base64: string, contentType: string) => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  };

  // Process frame from camera feed and send to backend
  const processFrame = async (imageData: string) => {
    try {
      console.log("Type of imageData before conversion:", typeof imageData);

      // Convert base64 image data to Blob
      const contentType = 'image/jpeg';
      const blob = base64ToBlob(imageData, contentType);

      console.log("Type of imageData after conversion:", typeof blob);

      const formData = new FormData();
      formData.append('image', blob); // Attach the image as FormData

      const response = await fetch('http://localhost:5000/process-image', {
        method: 'POST',
        body: formData // FormData automatically sets the Content-Type to multipart/form-data
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setFeedback({ message: data.message, isSafe: data.isSafe });
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Error processing image. Please try again.');
      setFeedback({ message: 'Error processing image', isSafe: false });
    } finally {
      setIsProcessing(false);
    }
};
// const processFrame = async (imageData: string) => {
//     try {
//       console.log("Type of imageData before conversion:", typeof imageData);

//       // Convert base64 image data to Blob
//       const contentType = 'image/jpeg';
//       const blob = base64ToBlob(imageData, contentType);

//       console.log("Type of imageData after conversion:", typeof blob);

//       const formData = new FormData();
//       formData.append('image', blob);
//       console.log(typeof(formData));

//       const response = await fetch('http://localhost:5000/process-image', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'  // Ensure the content type is JSON
//         },
//         body: formData
//       });

//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }

//       const data = await response.json();
//       setFeedback({ message: data.message, isSafe: data.isSafe });
//     } catch (error) {
//       console.error('Error processing image:', error);
//       toast.error('Error processing image. Please try again.');
//       setFeedback({ message: 'Error processing image', isSafe: false });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        stream.getTracks().forEach(track => track.stop());
      } catch {
        setHasCameraPermission(false);
      }
    };

    checkCameraPermission();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">SafeVision Guide</h1>
          <p className="text-gray-500">Your AI-powered navigation assistant</p>
        </header>

        {hasCameraPermission === null && (
          <div className="flex items-center justify-center bg-gray-200 w-full h-56">
            <span className="text-xl text-gray-500">Waiting for camera permission...</span>
          </div>
        )}

        {hasCameraPermission === false && (
          <div className="flex items-center justify-center bg-gray-200 w-full h-56">
            <span className="text-xl text-gray-500">Camera access denied. Please enable camera permission.</span>
          </div>
        )}

        {hasCameraPermission === true && (
          <CameraView onFrame={processFrame} />
        )}

        <div className="space-y-4">
          <Feedback message={feedback.message} isProcessing={isProcessing} isSafe={feedback.isSafe} />
        </div>
      </div>
    </div>
  );
};

export default Index;
