// components/AppImage.jsx

import { useState } from 'react';
import { CDN_BASE_URL } from '../utils/constant';

const AppImage = ({
  src,
  fallbackSrc = '/placeholder.svg',
  alt = 'Image',
  className = '',
  onError,
  ...props
}) => {
  const [imgError, setImgError] = useState(false);

  const getImageUrl = () => {
    if (!src || imgError) {
      return fallbackSrc;
    }

    // Full URL or imported local asset
    if (
      typeof src === 'string' &&
      (src.startsWith('http') ||
        src.startsWith('https') ||
        src.startsWith('/') ||
        src.startsWith('data:') ||
        src.includes('assets'))
    ) {
      return src;
    }

    // CDN path
    return `${CDN_BASE_URL}${src}`;
  };

  const handleError = (event) => {
    setImgError(true);

    if (onError) {
      onError(event);
    }
  };

  return (
    <img
      src={getImageUrl()}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default AppImage;