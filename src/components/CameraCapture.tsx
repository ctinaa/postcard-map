'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { processPostcardImage } from '@/utils/imageProcessing';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions and try again.');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            // Create initial file
            const rawFile = new File([blob], `postcard-${Date.now()}.jpg`, { type: 'image/jpeg' });
            
            // Process image (color correction, sharpening, etc.)
            const processedFile = await processPostcardImage(rawFile);
            
            stopCamera();
            onCapture(processedFile);
          } catch (error) {
            console.error('Image processing error:', error);
            // Fallback to raw image if processing fails
            const file = new File([blob], `postcard-${Date.now()}.jpg`, { type: 'image/jpeg' });
            stopCamera();
            onCapture(file);
          }
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const handleCapture = () => {
    // Start countdown
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setTimeout(capturePhoto, 100);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="text-5xl mb-4">📷</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Camera Access Needed</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleClose}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Use File Upload Instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Camera Viewfinder */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Postcard Frame Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Dark overlay with cutout */}
          <div className="absolute inset-0 bg-black/60" />
          
          {/* Frame guide - Standard postcard ratio 3:2 (landscape) */}
          <div className="relative z-10">
            <div className="border-4 border-white rounded-sm shadow-2xl" style={{ 
              width: 'min(90vw, 600px)', 
              height: 'calc(min(90vw, 600px) * 0.667)', // 3:2 ratio
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)'
            }}>
              {/* Corner markers - larger and more prominent */}
              <div className="absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 border-blue-400" />
              <div className="absolute -top-2 -right-2 w-12 h-12 border-t-4 border-r-4 border-blue-400" />
              <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-4 border-l-4 border-blue-400" />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 border-blue-400" />
              
              {/* Center crosshair for alignment */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-white/50" />
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-0.5 w-full bg-white/50" />
              </div>
            </div>
            
            {/* Instructions */}
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 text-center">
              <div className="bg-black/80 text-white px-6 py-3 rounded-lg text-base font-medium">
                📮 Align postcard edges with the frame
              </div>
              <div className="text-white text-sm mt-2 bg-black/60 px-4 py-2 rounded-full">
                Auto color correction will be applied
              </div>
            </div>
          </div>
        </div>

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
            <div className="text-white text-9xl font-bold animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
          <button
            onClick={handleClose}
            className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {isCameraReady && (
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Camera Ready
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-black p-6 flex items-center justify-center gap-6">
        {/* Secondary: Choose from Library */}
        <button
          onClick={handleClose}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          📁 Choose File
        </button>

        {/* Primary: Capture Button */}
        <button
          onClick={handleCapture}
          disabled={!isCameraReady || countdown !== null}
          className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 hover:border-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
        >
          <div className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors" />
        </button>

        {/* Tertiary: Cancel */}
        <div className="w-24" /> {/* Spacer for symmetry */}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

