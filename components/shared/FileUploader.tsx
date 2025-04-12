'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useCallback, useEffect, useState } from 'react'  // Add useEffect to imports

type FileUploaderProps = {
  onFieldChange: (url: string) => void;
  imageUrl: string;
}

export const FileUploader = ({ imageUrl, onFieldChange }: FileUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string>(imageUrl)

  useEffect(() => {
    setPreview(imageUrl)
  }, [imageUrl])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      await handleFile(file)
    }
  }

  const handleFile = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('File size must be less than 4MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setPreview(data.secure_url)
      onFieldChange(data.secure_url)
    } catch (error) {
      setUploadError('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleFile(file)
    }
  }

  return (
    <div 
      className="flex-center bg-dark-3 flex h-72 cursor-pointer flex-col overflow-hidden rounded-xl bg-grey-50 relative"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => document.getElementById('imageUpload')?.click()}
    >
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}
      
      {uploadError && (
        <div className="absolute top-4 left-4 right-4 text-red-500 mb-2 p-2 bg-red-50 rounded text-center z-40">
          {uploadError}
        </div>
      )}
      
      {preview ? (
        <div className="flex h-full w-full flex-1 justify-center relative">
          <Image
            src={preview}
            alt="event image"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <p className="text-white text-center px-4">
              <span className="block font-semibold mb-2">Click or drag to change image</span>
              <span className="text-sm opacity-80">Maximum size: 4MB</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-center flex-col py-5 text-grey-500">
          <Image
            src="/assets/icons/upload.svg"
            width={77}
            height={77}
            alt="file upload"
            className="mb-3"
          />
          <h3 className="font-semibold mb-2">Drag photo here</h3>
          <p className="text-sm mb-4">SVG, PNG, JPG (max 4MB)</p>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="imageUpload"
        disabled={isUploading}
      />
    </div>
  )
}

