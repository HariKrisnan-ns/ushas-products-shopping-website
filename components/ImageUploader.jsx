'use client'
import { useState, useRef } from 'react'

// ─────────────────────────────────────────────────────────────
// ImageUploader — reusable component for any image field
//
// Props:
//   value       : current image URL string
//   onChange    : (url) => void  called when upload succeeds
//   label       : string  shown above the uploader (optional)
//   aspectHint  : string  e.g. "1:1" or "16:9" (optional)
// ─────────────────────────────────────────────────────────────
export default function ImageUploader({ value, onChange, label = 'Image', aspectHint }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef()

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  const uploadToCloudinary = async (file) => {
    // Validate
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP, etc.)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.')
      return
    }
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError('Cloudinary is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your .env.local')
      return
    }

    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET)
      formData.append('folder', 'ushas-products')

      // Use XMLHttpRequest to track upload progress
      const url = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
          }
        }

        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText)
            resolve(data.secure_url)
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`))
          }
        }

        xhr.onerror = () => reject(new Error('Network error during upload'))
        xhr.send(formData)
      })

      onChange(url)
      setProgress(100)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const handleFile = (file) => uploadToCloudinary(file)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handlePasteUrl = () => {
    const url = prompt('Paste image URL:')
    if (url && url.startsWith('http')) onChange(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && (
        <div style={{
          fontSize: 11.5, fontWeight: 800, letterSpacing: '0.07em',
          textTransform: 'uppercase', color: 'var(--muted)',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          {label}
          {aspectHint && (
            <span style={{
              fontSize: 10, background: 'var(--cream2)', color: 'var(--muted)',
              padding: '2px 8px', borderRadius: 20, fontWeight: 700,
              textTransform: 'none', letterSpacing: 0
            }}>
              Recommended: {aspectHint}
            </span>
          )}
        </div>
      )}

      {/* Drop zone */}
      <div
        style={{
          border: `2px dashed ${dragOver ? 'var(--green-m)' : value ? 'var(--green-lt)' : 'var(--border)'}`,
          borderRadius: 12,
          background: dragOver ? 'var(--green-pl)' : value ? 'var(--cream)' : 'var(--cream)',
          transition: 'all 0.2s',
          overflow: 'hidden',
          cursor: uploading ? 'wait' : 'pointer',
        }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        {/* Preview if image exists */}
        {value && !uploading && (
          <div style={{ position: 'relative' }}>
            <img
              src={value}
              alt="preview"
              style={{
                width: '100%', height: 160, objectFit: 'cover',
                display: 'block', borderRadius: '10px 10px 0 0'
              }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0)',
              borderRadius: '10px 10px 0 0',
              transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
            >
              <span style={{
                color: '#fff', fontSize: 13, fontWeight: 800,
                opacity: 0, transition: 'opacity 0.2s',
                background: 'rgba(0,0,0,0.5)', padding: '6px 14px', borderRadius: 8
              }}
                className="img-hover-label"
              >🔄 Click to replace</span>
            </div>
          </div>
        )}

        {/* Upload area */}
        <div style={{
          padding: value ? '10px 16px' : '28px 16px',
          textAlign: 'center',
          display: 'flex', flexDirection: value ? 'row' : 'column',
          alignItems: 'center', justifyContent: value ? 'space-between' : 'center',
          gap: 12
        }}>
          {uploading ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 28 }}>⬆️</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                Uploading… {progress}%
              </div>
              <div style={{
                width: '100%', height: 6, background: 'var(--cream3)',
                borderRadius: 6, overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%', width: `${progress}%`,
                  background: 'linear-gradient(90deg, var(--green-m), var(--gold-lt))',
                  borderRadius: 6, transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          ) : value ? (
            <>
              <span style={{ fontSize: 12.5, color: 'var(--green-m)', fontWeight: 700 }}>
                ✅ Image uploaded
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
                  style={{
                    padding: '6px 14px', borderRadius: 8, border: '1.5px solid var(--green-m)',
                    background: 'transparent', color: 'var(--green-m)',
                    fontSize: 12, fontWeight: 800, cursor: 'pointer',
                    fontFamily: 'Nunito, sans-serif'
                  }}
                >🔄 Replace</button>
                <button
                  onClick={e => { e.stopPropagation(); onChange('') }}
                  style={{
                    padding: '6px 14px', borderRadius: 8, border: '1.5px solid var(--red)',
                    background: 'transparent', color: 'var(--red)',
                    fontSize: 12, fontWeight: 800, cursor: 'pointer',
                    fontFamily: 'Nunito, sans-serif'
                  }}
                >✕ Remove</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 36, marginBottom: 4 }}>🖼️</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                {dragOver ? 'Drop to upload!' : 'Drag & drop or click to upload'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>
                JPG, PNG, WebP · Max 5MB
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
                  style={{
                    padding: '8px 18px', borderRadius: 8,
                    background: 'var(--green-m)', color: '#fff', border: 'none',
                    fontSize: 13, fontWeight: 800, cursor: 'pointer',
                    fontFamily: 'Nunito, sans-serif',
                    boxShadow: '0 3px 10px rgba(45,90,39,0.25)'
                  }}
                >📁 Choose File</button>
                <button
                  onClick={e => { e.stopPropagation(); handlePasteUrl() }}
                  style={{
                    padding: '8px 18px', borderRadius: 8,
                    background: 'transparent', color: 'var(--text)',
                    border: '1.5px solid var(--border)',
                    fontSize: 13, fontWeight: 800, cursor: 'pointer',
                    fontFamily: 'Nunito, sans-serif'
                  }}
                >🔗 Paste URL</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          background: '#FADBD8', border: '1px solid var(--red)',
          borderRadius: 8, padding: '10px 14px',
          fontSize: 12.5, color: 'var(--red)', fontWeight: 700,
          display: 'flex', alignItems: 'flex-start', gap: 8
        }}>
          <span>⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: 'var(--red)', cursor: 'pointer', fontSize: 14, fontWeight: 900,
              padding: 0, lineHeight: 1
            }}
          >✕</button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = '' }}
      />
    </div>
  )
}
