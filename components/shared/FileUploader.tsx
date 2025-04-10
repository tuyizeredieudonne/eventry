'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useCallback } from 'react'

type FileUploaderProps = {
  onFieldChange: (url: string) => void;
  imageUrl: string;
}

export const FileUploader = ({ imageUrl, onFieldChange }: FileUploaderProps) => {
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('timestamp', String(Math.round(new Date().getTime() / 1000)))
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      onFieldChange(data.secure_url)
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }, [onFieldChange])

  return (
    <div className="flex-center bg-dark-3 flex h-72 cursor-pointer flex-col overflow-hidden rounded-xl bg-grey-50">
      {imageUrl ? (
        <div className="flex h-full w-full flex-1 justify-center">
          <Image
            src={imageUrl}
            alt="image"
            width={250}
            height={250}
            className="w-full object-cover object-center"
          />
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
          />
          <Button 
            type="button" 
            className="rounded-full"
            onClick={() => document.getElementById('imageUpload')?.click()}
          >
            Select from computer
          </Button>
        </div>
      )}
    </div>
  )
}
