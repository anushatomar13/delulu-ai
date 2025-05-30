"use client";

import { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { extractTextFromImage } from '../../../../lib/ocrUtils';
import { gsap } from "gsap";
import { FiUpload, FiImage, FiLoader, FiCheck, FiX } from "react-icons/fi";

interface ImageUploaderProps {
  onTextExtracted: (text: string) => void;
  onFileChange: (file: File | null) => void;
}

export default function ImageUploader({ onTextExtracted, onFileChange }: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isProcessing && loaderRef.current) {
      gsap.to(loaderRef.current, {
        rotation: 360,
        duration: 1,
        repeat: -1,
        ease: "none",
      });
    }
  }, [isProcessing]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    onFileChange(file);
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    setUploadSuccess(true);
    
    // Animate image entrance
    if (imageRef.current) {
      gsap.fromTo(imageRef.current, 
        { opacity: 0, scale: 0.8, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
      );
    }
    
    setIsProcessing(true);
    const { text, error } = await extractTextFromImage(imageUrl);
    setIsProcessing(false);
    
    if (!error) {
      onTextExtracted(text);
      // Success animation
      gsap.to(dropzoneRef.current, {
        scale: 1.02,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
  }, [onTextExtracted, onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
    },
    maxFiles: 1
  });

  const clearImage = () => {
    setImage(null);
    setUploadSuccess(false);
    onFileChange(null);
    
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.in"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        ref={dropzoneRef}
        {...getRootProps()}
        className={`group relative cursor-pointer transition-all duration-300 ${
          isDragActive ? 'scale-105' : ''
        }`}
      >
        <input {...getInputProps()} />
        
        {/* Gradient border effect */}
        <div className={`absolute -inset-0.5 bg-gradient-to-r rounded-2xl blur transition-opacity duration-300 ${
          isDragActive 
            ? 'from-cyan-500 to-purple-500 opacity-75' 
            : uploadSuccess
            ? 'from-green-500 to-emerald-500 opacity-50'
            : 'from-purple-500/30 to-pink-500/30 opacity-0 group-hover:opacity-60'
        }`} />
        
        <div className={`relative bg-gray-900/60 backdrop-blur-sm border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
          isDragActive 
            ? 'border-cyan-400 bg-cyan-500/10' 
            : uploadSuccess
            ? 'border-green-400 bg-green-500/10'
            : 'border-gray-600 group-hover:border-purple-400 group-hover:bg-purple-500/5'
        }`}>
          
          <div className="text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center mb-4">
              {isProcessing ? (
                <div ref={loaderRef} className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <FiLoader className="text-white text-xl" />
                </div>
              ) : uploadSuccess ? (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center animate-pulse">
                  <FiCheck className="text-white text-xl" />
                </div>
              ) : isDragActive ? (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center animate-bounce">
                  <FiUpload className="text-white text-xl" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiImage className="text-white text-xl" />
                </div>
              )}
            </div>
            
            {/* Text */}
            <div className="space-y-2">
              {isProcessing ? (
                <>
                  <p className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Reading your vibe... 🔍
                  </p>
                  <p className="text-gray-400 text-sm">AI is analyzing the text fr fr</p>
                </>
              ) : uploadSuccess ? (
                <>
                  <p className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Got it bestie! ✨
                  </p>
                  <p className="text-gray-400 text-sm">Image uploaded successfully</p>
                </>
              ) : isDragActive ? (
                <>
                  <p className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Drop it like it's hot! 🔥
                  </p>
                  <p className="text-gray-400 text-sm">Release to upload your screenshot</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-white group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    Drop your screenshot here 📱
                  </p>
                  <p className="text-gray-400 text-sm">
                    Drag & drop or <span className="text-purple-400 font-medium">click to browse</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    PNG, JPG, JPEG up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview */}
      {image && (
        <div ref={imageRef} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FiImage className="text-green-400" />
                <span className="text-sm font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Uploaded Image:
                </span>
              </div>
              <button
                onClick={clearImage}
                className="group/btn p-2 rounded-full bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-all duration-200"
                title="Remove image"
              >
                <FiX className="text-red-400 group-hover/btn:text-red-300" />
              </button>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-gray-800/50">
              <img
                src={image}
                alt="Uploaded preview"
                className="w-full h-auto max-h-64 object-contain rounded-xl filter group-hover:brightness-110 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            {uploadSuccess && !isProcessing && (
              <div className="mt-3 flex items-center gap-2 text-green-400">
                <FiCheck className="text-sm" />
                <span className="text-sm font-medium">Ready to analyze! 🚀</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}