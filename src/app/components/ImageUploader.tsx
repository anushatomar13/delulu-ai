"use client";
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import type { Worker } from 'tesseract.js';

export default function ImageUploader() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
   
    const file = acceptedFiles[0];
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    setText('');
   
    processImage(imageUrl);
  }, []);

  const processImage = async (imageUrl: string) => {
    setIsProcessing(true);
   
    let worker: Worker | null = null;
    
    try {
      worker = await createWorker('eng');
      
      const result = await worker.recognize(imageUrl);
      
      setText(result.data.text);
    } catch (error) {
      console.error('Error during OCR:', error);
      setText('Error processing image');
    } finally {
      if (worker) {
        await worker.terminate();
      }
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
    },
    maxFiles: 1
  });

  return (
    <div className="container mx-auto p-4">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center cursor-pointer hover:border-gray-500"
      >
        <input {...getInputProps()} />
        <p>Drag & drop an image here, or click to select one</p>
      </div>
     
      {image && (
        <div className="mt-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Uploaded Image:</h3>
            <img
              src={image}
              alt="Uploaded preview"
              className="mt-2 max-w-full h-auto max-h-96 rounded-md"
            />
          </div>
         
          <div>
            <h3 className="text-lg font-semibold">Extracted Text:</h3>
            {isProcessing ? (
              <p className="mt-2">Processing...</p>
            ) : (
              <pre className="mt-2 p-4 bg-gray-100 rounded-md whitespace-pre-wrap">
                {text || 'No text extracted'}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}