/**
 * Resize image to reduce file size and API costs
 * @param file Original image file
 * @param maxWidth Maximum width in pixels
 * @returns Resized image file
 */
export async function resizeImage(file: File, maxWidth: number = 1600): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      
      if (ratio >= 1) {
        // Image is already smaller than max size
        resolve(file)
        return
      }

      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      // Draw resized image
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const resizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
          resolve(resizedFile)
        } else {
          resolve(file)
        }
      }, 'image/jpeg', 0.9)
    }

    img.src = URL.createObjectURL(file)
  })
}