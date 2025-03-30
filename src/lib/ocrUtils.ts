import { createWorker } from 'tesseract.js';
import type { Worker } from 'tesseract.js';

export async function extractTextFromImage(imageUrl: string): Promise<{ text: string; error: string | null }> {
  let worker: Worker | null = null;
  
  try {
    worker = await createWorker('eng');
    
    const result = await worker.recognize(imageUrl);
    
    return { text: result.data.text, error: null };
  } catch (error) {
    console.error('Error during OCR:', error);
    return { text: '', error: 'Error processing image' };
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}