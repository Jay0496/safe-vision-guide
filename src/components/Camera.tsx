import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraViewProps {
  onFrame?: (imageData: string) => void;
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

  return (
    <div className="relative flex items-center justify-center w-full max-w-lg p-4 bg-gray-900 rounded-2xl">
      {hasPermission === null && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-2xl">
          <span className="text-white">Waiting for camera permission...</span>
        </div>
      )}
      {hasPermission === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 rounded-2xl p-4">
          <Camera className="h-12 w-12 text-white mb-4" />
          <span className="text-white mb-2">Camera Access Required</span>
          <p className="text-gray-300 text-center mb-4">{error}</p>
          <Button onClick={requestCameraPermission}>Enable Camera</Button>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn("w-full h-auto object-cover rounded-2xl", hasPermission === false ? "hidden" : "")}
      />
    </div>
  );
};

export default CameraView;
