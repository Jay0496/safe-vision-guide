
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
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const requestCameraPermission = async () => {
    try {
      stopStream(); // Stop any existing stream first
      
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      console.log('Camera access granted, setting up video');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for the video to be ready to play
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              resolve(true);
            };
          }
        });
        
        await videoRef.current.play();
        setHasPermission(true);
        setError(null);
        console.log('Video stream started successfully');
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
      <div className="camera-container bg-black">
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <span className="text-lg font-medium text-white">
            Requesting camera access...
          </span>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="camera-container bg-black">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/80">
          <Camera className="h-12 w-12 text-white mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Camera Access Required
          </h3>
          <p className="text-gray-300 mb-4">
            {error || 'Please enable camera access to use this feature.'}
          </p>
          <Button
            onClick={requestCameraPermission}
            variant="default"
          >
            Enable Camera
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="absolute inset-x-0 bottom-0 p-6">
        <Button
          onClick={toggleProcessing}
          variant={isActive ? "destructive" : "default"}
          className="w-full"
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
