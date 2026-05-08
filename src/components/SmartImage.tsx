import { ImgHTMLAttributes } from "react";

interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

function resolveImageSrc(src: string): string {
  if (src && src.includes("blob.vercel-storage.com")) {
    return `/api/blob-image?url=${encodeURIComponent(src)}`;
  }
  return src;
}

export function SmartImage({ src, alt, className, ...props }: SmartImageProps) {
  if (!src) {
    return (
      <div
        className={`bg-muted animate-pulse ${className ?? ""}`}
        style={props.style}
      />
    );
  }

  return (
    <img
      src={resolveImageSrc(src)}
      alt={alt}
      className={className}
      {...props}
      onError={(e) => {
        e.currentTarget.style.display = "none";
        props.onError?.(e);
      }}
    />
  );
}
