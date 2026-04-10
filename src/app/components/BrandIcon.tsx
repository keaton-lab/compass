interface BrandIconProps {
  name: string;
  path?: string | null;
  size?: number;
  className?: string;
  color?: string;
}

export default function BrandIcon({ name, path, size = 24, className = '', color }: BrandIconProps) {
  if (!path) {
    return <span className={className} style={{ fontSize: size * 0.5 }}>{name.slice(0, 2)}</span>;
  }

  const fillColor = color || 'currentColor';

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fillColor}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
