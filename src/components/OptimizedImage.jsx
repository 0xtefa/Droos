import { useState, useRef, useEffect } from 'react';

/**
 * Optimized image component with:
 * - Lazy loading using Intersection Observer
 * - Blur placeholder while loading
 * - Error handling with fallback
 * - Responsive image support
 */

export function OptimizedImage({
  src,
  alt,
  className = '',
  placeholderColor = 'bg-slate-200',
  fallbackSrc = null,
  sizes = '100vw',
  loading = 'lazy',
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc && imgRef.current) {
      imgRef.current.src = fallbackSrc;
    }
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Placeholder */}
      <div
        className={`absolute inset-0 ${placeholderColor} transition-opacity duration-300 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Actual image */}
      {isInView && (
        <img
          src={hasError && fallbackSrc ? fallbackSrc : src}
          alt={alt}
          loading={loading}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}

/**
 * Avatar image with optimized loading and fallback initials
 */
export function Avatar({
  src,
  name = '',
  size = 'md',
  className = '',
  ...props
}) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.slice(0, 2);
  };

  if (!src || hasError) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700 ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {getInitials(name).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setHasError(true)}
      className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      loading="lazy"
      {...props}
    />
  );
}

export default OptimizedImage;
