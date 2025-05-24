import React, { useRef, useState } from 'react';
import FigmaIcon from './FigmaIcon';
import FigmaButton from './FigmaButton';

interface FigmaImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage?: File | null;
  onImageRemove?: () => void;
  className?: string;
}

/**
 * FigmaImageUpload - Image upload component with camera icon and preview
 * Allows users to select and preview plant images
 */
const FigmaImageUpload: React.FC<FigmaImageUploadProps> = ({
  onImageSelect,
  selectedImage,
  onImageRemove,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Generate preview URL when selectedImage changes
  React.useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreview(null);
    }
  }, [selectedImage]);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Image size must be less than 5MB');
      return;
    }

    onImageSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    if (onImageRemove) {
      onImageRemove();
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`figma-image-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      {selectedImage && imagePreview ? (
        // Preview mode
        <div className="figma-image-upload-preview">
          <div className="figma-image-upload-preview-container">
            <img
              src={imagePreview}
              alt="Plant preview"
              className="figma-image-upload-preview-image"
            />
            <div className="figma-image-upload-preview-overlay">
              <FigmaButton
                variant="icon"
                onClick={handleRemove}
                className="figma-image-upload-remove"
              >
                <FigmaIcon name="plus" />
              </FigmaButton>
            </div>
          </div>
          <div className="figma-image-upload-preview-info">
            <span className="figma-text-small">{selectedImage.name}</span>
            <span className="figma-text-small">
              {(selectedImage.size / 1024 / 1024).toFixed(1)} MB
            </span>
          </div>
        </div>
      ) : (
        // Upload mode
        <div
          className={`figma-image-upload-area ${dragOver ? 'figma-image-upload-area-drag' : ''}`}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="figma-image-upload-content">
            <div className="figma-image-upload-icon">
              <FigmaIcon name="camera" size={32} />
            </div>
            <div className="figma-image-upload-text">
              <span className="figma-text-body-medium">Add Plant Photo</span>
              <span className="figma-text-small">
                Tap to select or drag & drop an image
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FigmaImageUpload;