/**
 * Image processing utilities for postcard scanning
 * Includes color correction, brightness/contrast adjustment, and sharpening
 */

export async function processPostcardImage(imageFile: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        try {
          // Create canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Set canvas size to image size
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Apply image enhancements
          enhanceColors(data);
          adjustBrightnessContrast(data, 1.1, 1.15); // Slight brightness and contrast boost
          sharpenImage(imageData);

          // Put processed image back
          ctx.putImageData(imageData, 0, 0);

          // Convert to blob
          canvas.toBlob((blob) => {
            if (blob) {
              const processedFile = new File(
                [blob], 
                imageFile.name.replace(/\.[^/.]+$/, '-enhanced.jpg'),
                { type: 'image/jpeg' }
              );
              resolve(processedFile);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/jpeg', 0.95);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Enhance colors - boost saturation and adjust color balance
 */
function enhanceColors(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate average
    const avg = (r + g + b) / 3;

    // Boost saturation (move colors away from gray)
    const saturationBoost = 1.2;
    data[i] = clamp(avg + (r - avg) * saturationBoost);     // R
    data[i + 1] = clamp(avg + (g - avg) * saturationBoost); // G
    data[i + 2] = clamp(avg + (b - avg) * saturationBoost); // B
  }
}

/**
 * Adjust brightness and contrast
 */
function adjustBrightnessContrast(
  data: Uint8ClampedArray,
  brightness: number = 1.0,
  contrast: number = 1.0
) {
  const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

  for (let i = 0; i < data.length; i += 4) {
    // Apply brightness and contrast to RGB channels
    data[i] = clamp(factor * (data[i] - 128) + 128 + (brightness - 1) * 50);       // R
    data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128 + (brightness - 1) * 50); // G
    data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128 + (brightness - 1) * 50); // B
  }
}

/**
 * Sharpen image using convolution
 */
function sharpenImage(imageData: ImageData) {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const tempData = new Uint8ClampedArray(data);

  // Sharpening kernel
  const kernel = [
    0, -1,  0,
   -1,  5, -1,
    0, -1,  0
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) { // RGB channels only
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            sum += tempData[idx] * kernel[kernelIdx];
          }
        }
        const idx = (y * width + x) * 4 + c;
        data[idx] = clamp(sum);
      }
    }
  }
}

/**
 * Clamp value between 0 and 255
 */
function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}

/**
 * Get preview URL from processed file
 */
export function getPreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

