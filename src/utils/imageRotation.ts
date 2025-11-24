/**
 * Rotate an image file by specified degrees
 */
export async function rotateImage(file: File, degrees: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Calculate new dimensions based on rotation
          const radians = (degrees * Math.PI) / 180;
          const cos = Math.abs(Math.cos(radians));
          const sin = Math.abs(Math.sin(radians));
          
          const newWidth = img.width * cos + img.height * sin;
          const newHeight = img.width * sin + img.height * cos;

          canvas.width = newWidth;
          canvas.height = newHeight;

          // Translate to center and rotate
          ctx.translate(newWidth / 2, newHeight / 2);
          ctx.rotate(radians);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);

          // Convert to blob
          canvas.toBlob((blob) => {
            if (blob) {
              const rotatedFile = new File(
                [blob],
                file.name,
                { type: 'image/jpeg' }
              );
              resolve(rotatedFile);
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
    reader.readAsDataURL(file);
  });
}

