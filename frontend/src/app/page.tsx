'use client'

import { useState, useRef } from 'react'
import { resizeImage } from '@/utils/imageUtils'

type UploadStatus = 'idle' | 'uploading' | 'parsing' | 'done' | 'error'

interface ParsedData {
  vendor: string
  invoice_no?: string
  invoice_date: string
  currency: string
  items: Array<{
    description: string
    qty: number
    unit_price: number
    line_total: number
    category: string
  }>
  subtotal: number
  tax: number
  total: number
  guessed_categories: boolean
}

export default function UploadPage() {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [message, setMessage] = useState('')
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatus('error')
      setMessage('Please upload an image file')
      return
    }

    try {
      setStatus('uploading')
      setMessage('Uploading image...')
      setParsedData(null)

      // Resize image to reduce costs
      const resizedFile = await resizeImage(file, 1600)

      // Upload file
      const formData = new FormData()
      formData.append('file', resizedFile)

      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/invoices/`, {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      const { id } = await uploadResponse.json()

      // Parse receipt
      setStatus('parsing')
      setMessage('Parsing receipt with AI...')

      const parseResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/invoices/${id}/parse`, {
        method: 'POST',
      })

      if (!parseResponse.ok) {
        throw new Error('Parsing failed')
      }

      const parsed = await parseResponse.json()
      setParsedData(parsed)
      setStatus('done')
      setMessage('Receipt parsed successfully!')

    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const getStatusClass = () => {
    switch (status) {
      case 'uploading': return 'status-uploading'
      case 'parsing': return 'status-parsing'
      case 'done': return 'status-done'
      case 'error': return 'status-error'
      default: return ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upload Receipt
        </h1>
        <p className="text-gray-600">
          Upload a photo of your receipt to automatically extract expense data
        </p>
      </div>

      <div className="card mb-8">
        <div
          className={`upload-area ${dragOver ? 'dragover' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop your receipt here
            </h3>
            <p className="text-gray-500 mb-4">
              Or click to select an image file
            </p>
            <button
              type="button"
              className="btn btn-primary"
              disabled={status === 'uploading' || status === 'parsing'}
            >
              Choose File
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {status !== 'idle' && (
          <div className="mt-4 text-center">
            <span className={`status-badge ${getStatusClass()}`}>
              {status === 'uploading' && '⏳ '}
              {status === 'parsing' && '🤖 '}
              {status === 'done' && '✅ '}
              {status === 'error' && '❌ '}
              {message}
            </span>
          </div>
        )}
      </div>

      {parsedData && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Parsed Receipt Data
          </h2>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(parsedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}