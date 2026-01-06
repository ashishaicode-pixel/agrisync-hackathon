import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Image } from 'lucide-react';

const PhotoUpload = ({ onPhotoSelect, currentPhoto, label = "Upload Photo" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(currentPhoto || null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      onPhotoSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removePhoto = () => {
    setPreview(null);
    onPhotoSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      
      {preview ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '200px',
              height: '150px',
              objectFit: 'cover',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}
          />
          <button
            type="button"
            onClick={removePhoto}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div
          className={`photo-upload-area ${isDragging ? 'dragover' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <Image size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
          <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            Drag and drop an image here, or click to select
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Upload size={16} />
              Choose File
            </button>
            
            <button
              type="button"
              className="btn btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                cameraInputRef.current?.click();
              }}
            >
              <Camera size={16} />
              Take Photo
            </button>
          </div>
          
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
            Supports JPG, PNG, WebP (max 5MB)
          </p>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default PhotoUpload;