"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { extractTextFromImage } from '../../../../lib/ocrUtils'
import { Label } from "@/components/ui/label";

interface ImageUploaderProps {
  onTextExtracted: (text: string) => void;
  onFileChange: (file: File | null) => void;
}

export default function ImageUploader({ onTextExtracted, onFileChange }: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
   
    const file = acceptedFiles[0];
    onFileChange(file);
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
   
    setIsProcessing(true);
    const { text, error } = await extractTextFromImage(imageUrl);
    setIsProcessing(false);
    
    if (!error) {
      onTextExtracted(text);
    }
  }, [onTextExtracted, onFileChange]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
    },
    maxFiles: 1
  });

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center cursor-pointer hover:border-gray-500"
      >
        <input {...getInputProps()} />
        <p>Drag & drop an image here, or click to select one</p>
        {isProcessing && <p className="mt-2">Processing text from image...</p>}
      </div>
     
      {image && (
        <div className="mt-4">
          <Label>Uploaded Image:</Label>
          <img
            src={image}
            alt="Uploaded preview"
            className="mt-2 max-w-full h-auto max-h-48 rounded-md"
          />
        </div>
      )}
    </div>
  );
}