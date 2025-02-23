
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, PauseCircle, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraViewProps {
  onFrame?: (imageData: string) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onFrame }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        streamRef.current = stream;
        setHasPermission(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access denied. Please enable camera access to use this feature.');
      setHasPermission(false);
      stopStream();
    }
  };

  useEffect(() => {
    requestCameraPermission();
    return () => {
      stopStream();
    };
  }, []);

  const toggleProcessing = () => {
    setIsActive(!isActive);
  };

  useEffect(() => {
    let frameId: number;

    const captureFrame = () => {
      if (videoRef.current && canvasRef.current && isActive) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');

        if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = canvas.toDataURL('image/jpeg', 0.8);
          onFrame?.(imageData);
        }

        frameId = requestAnimationFrame(captureFrame);
      }
    };

    if (isActive) {
      frameId = requestAnimationFrame(captureFrame);
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isActive, onFrame]);

  if (hasPermission === null) {
    return (
      <div className="camera-container animate-pulse bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-medium text-gray-500">
            Requesting camera access...
          </span>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="camera-container bg-gray-100">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <Camera className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Camera Access Required
          </h3>
          <p className="text-gray-500 mb-4">
            {error || 'Please enable camera access to use this feature.'}
          </p>
          <Button
            onClick={requestCameraPermission}
            className="btn-primary"
          >
            Enable Camera
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-container animate-scale-up">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      <div className="camera-overlay" />
      
      <div className="absolute inset-x-0 bottom-0 p-6">
        <Button
          onClick={toggleProcessing}
          className={cn(
            "w-full btn-primary",
            isActive ? "bg-destructive hover:bg-destructive/90" : ""
          )}
        >
          {isActive ? (
            <>
              <PauseCircle className="mr-2 h-5 w-5" />
              Stop Processing
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-5 w-5" />
              Start Processing
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CameraView;
