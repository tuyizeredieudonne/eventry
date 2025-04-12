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

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setIsUploading(true)
    setUploadError(null)
    
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file before upload
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('File size must be less than 4MB')
      setIsUploading(false)
      return
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file')
      setIsUploading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      setPreview(data.secure_url)
      onFieldChange(data.secure_url)
    } catch (error) {
      console.error('Error uploading file:', error)
      setUploadError('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }, [onFieldChange])

  return (
    <div className="flex-center bg-dark-3 flex h-72 cursor-pointer flex-col overflow-hidden rounded-xl bg-grey-50">
      {uploadError && (
        <div className="text-red-500 mb-2 p-2 bg-red-50 rounded">{uploadError}</div>
      )}
      
      {preview ? (
        <div className="flex h-full w-full flex-1 justify-center relative group">
          <Image
            src={preview}
            alt="event image"
            width={250}
            height={250}
            className="w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              type="button" 
              variant="secondary"
              className="rounded-full"
              onClick={() => document.getElementById('imageUpload')?.click()}
              disabled={isUploading}
            >
              Change Image
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-center flex-col py-5 text-grey-500">
          <Image
            src="/assets/icons/upload.svg"
            width={77}
            height={77}
            alt="file upload"
          />
          <h3 className="mb-2 mt-2">Drag photo here</h3>
          <p className="p-medium-12 mb-4">SVG, PNG, JPG</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="imageUpload"
            disabled={isUploading}
          />
        </div>
      )}
    </div>
  )
}
// Remove the duplicate useEffect implementation at the bottom

