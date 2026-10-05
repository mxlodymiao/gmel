// Decorative icon. Static icons in this prototype do nothing, so they're
// hidden from assistive tech and never get hover or pointer styles.
export function Icon({ src, size = 20, className = '' }: { src: string; size?: number; className?: string }) {
  return <img src={src} alt="" aria-hidden width={size} height={size} className={`block shrink-0 ${className}`} />;
}
