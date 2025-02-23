
import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackProps {
  message: string;
  isProcessing: boolean;
  isSafe?: boolean;
}

const Feedback: React.FC<FeedbackProps> = ({ 
  message, 
  isProcessing,
  isSafe = true 
}) => {
  useEffect(() => {
    if (message && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(utterance);
    }

    if (!isSafe && 'vibrate' in navigator) {
      navigator.vibrate(200);
    }
  }, [message, isSafe]);

  if (!isProcessing) return null;

  return (
    <div className={cn(
      "floating-card rounded-2xl p-4 animate-fade-up",
      isSafe ? "border-green-200" : "border-red-200"
    )}>
      <div className="flex items-start gap-3">
        {isSafe ? (
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 space-y-1">
          <p className={cn(
            "text-sm font-medium",
            isSafe ? "text-green-700" : "text-red-700"
          )}>
            {message}
          </p>
          <p className="text-xs text-gray-500">
            {isSafe ? 'Safe to proceed' : 'Exercise caution'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
