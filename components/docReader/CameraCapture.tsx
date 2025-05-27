import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from '../ui/button';
import { useTranslations } from 'next-intl';

interface CameraCaptureProps {
  onImagesAdd: (images: string[]) => void;
}

export const CameraCapture = ({ onImagesAdd }: CameraCaptureProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const t = useTranslations('Common');

  const videoConstraints = {
    width: 1920,
    height: 1080,
    facingMode: facingMode,
    aspectRatio: 16 / 9,
    frameRate: { ideal: 30 },
  };

  const capture = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImages((prev) => [...prev, imageSrc]);
    }
  };

  useEffect(() => {
    if (capturedImages.length > 0) {
      onImagesAdd(capturedImages);
      setCapturedImages([]);
    }
  }, [capturedImages, onImagesAdd]);

  const toggleCamera = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">{t('cameraCapture')}</h2>

      <div className="mb-4 w-full">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="aspect-video h-auto w-full rounded-lg"
          videoConstraints={videoConstraints}
          audio={false}
          screenshotQuality={1}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          onClick={capture}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          {t('takePhoto')}
        </Button>
        <Button
          onClick={toggleCamera}
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          {t('switchCamera')}
        </Button>
      </div>
    </div>
  );
};
