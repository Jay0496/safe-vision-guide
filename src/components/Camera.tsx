import { useEffect, useRef, useState } from 'react';

interface CameraViewProps {
  onFrame: (imageData: string) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onFrame }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestCameraPermission = async () => {
    try {
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });

      console.log('Camera access granted');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.onloadedmetadata = () => videoRef.current?.play();
      }
      setHasPermission(true);
      setError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access denied. Please enable camera access.');
      setHasPermission(false);
    }
  };

  useEffect(() => {
    requestCameraPermission();
    
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Capture and send frames at a fixed interval
  useEffect(() => {
    if (hasPermission === true) {
      const captureFrame = () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx) {
          canvas.width = videoRef.current.videoWidth || 640;
          canvas.height = videoRef.current.videoHeight || 480;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL('image/jpeg'); // Convert frame to Base64
          console.log('Captured frame:', imageData);
          onFrame(imageData);
        }
      };

      const interval = setInterval(captureFrame, 1000); // Send frame every second
      return () => clearInterval(interval);
    }
  }, [hasPermission, onFrame]);

  return (
    <div className="relative flex items-center justify-center w-full max-w-lg p-4 bg-gray-900 rounded-2xl">
      {hasPermission === null && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-2xl">
          <span className="text-white">Waiting for camera permission...</span>
        </div>
      )}
      {hasPermission === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 rounded-2xl p-4">
          <span className="text-white mb-2">Camera Access Required</span>
          <p className="text-gray-300 text-center mb-4">{error}</p>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-auto object-cover rounded-2xl ${hasPermission === false ? "hidden" : ""}`}
      />
    </div>
  );
};

export default CameraView;
