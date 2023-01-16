export async function loadTexture(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve(img);
    };

    img.onerror = (event, source, lineno, colno, error) => {
      reject(error ?? new Error('Loading failed'));
    };

    img.src = uri;
  });
}
