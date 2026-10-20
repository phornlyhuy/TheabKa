const MAX_INPUT_SIZE = 20 * 1024 * 1024;
const DEFAULT_MAX_OUTPUT_SIZE = 220 * 1024;

interface ImageCompressionOptions {
  format?: 'image/jpeg' | 'image/png';
  maxOutputSize?: number;
  maxDimension?: number;
}

export async function compressImageForStorage(
  file: File,
  { format = 'image/jpeg', maxOutputSize = DEFAULT_MAX_OUTPUT_SIZE, maxDimension = 1600 }: ImageCompressionOptions = {},
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('សូមជ្រើសរើសឯកសាររូបភាព (JPG, PNG ឬ WebP)។');
  }

  if (file.size > MAX_INPUT_SIZE) {
    throw new Error('រូបភាពធំពេក។ សូមជ្រើសរើសរូបភាពតូចជាង 20 MB។');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    let width = Math.max(1, Math.round(image.naturalWidth * scale));
    let height = Math.max(1, Math.round(image.naturalHeight * scale));
    let quality = 0.9;

    for (let attempt = 0; attempt < 12; attempt++) {
      const blob = await renderImage(image, width, height, quality, format);
      if (blob.size <= maxOutputSize) {
        return await blobToDataUrl(blob);
      }

      if (quality > 0.62) {
        quality = Math.max(0.62, quality - 0.08);
      } else {
        const nextWidth = Math.max(1, Math.round(width * 0.82));
        const nextHeight = Math.max(1, Math.round(height * 0.82));
        if (nextWidth === width && nextHeight === height) {
          quality = Math.max(0.45, quality - 0.05);
        } else {
          width = nextWidth;
          height = nextHeight;
        }
      }
    }

    throw new Error('មិនអាចបង្រួមរូបភាពឱ្យតូចបានទេ។ សូមសាកល្បងជាមួយរូបភាពផ្សេង។');
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('សូមជ្រើសរើស')) {
      throw error;
    }
    if (error instanceof Error && error.message.startsWith('រូបភាពធំ')) {
      throw error;
    }
    if (error instanceof Error && error.message.startsWith('មិនអាចបង្រួម')) {
      throw error;
    }
    throw new Error('មិនអាចបើករូបភាពនេះបានទេ។ សូមប្រើ JPG, PNG ឬ WebP។');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image decode failed'));
    image.src = src;
  });
}

function renderImage(
  image: HTMLImageElement,
  width: number,
  height: number,
  quality: number,
  format: 'image/jpeg' | 'image/png',
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      reject(new Error('Canvas is unavailable'));
      return;
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image conversion failed')), format, quality);
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Image read failed'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('Image read failed'));
    reader.readAsDataURL(blob);
  });
}
