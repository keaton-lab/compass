interface BrandIconProps {
  name: string;
  svg?: string | null;
  size?: number;
  className?: string;
  color?: string;
}

export default function BrandIcon({ name, svg, size = 24, className = '', color }: BrandIconProps) {
  if (!svg) {
    return <span className={className} style={{ fontSize: size * 0.5 }}>{name.slice(0, 2)}</span>;
  }

  const fillColor = color || 'currentColor';

  return (
    <span
      className={className}
      style={{ width: size, height: size, display: 'inline-flex' }}
      dangerouslySetInnerHTML={{
        __html: svg.replace(/fill="[^"]*"/g, `fill="${fillColor}"`),
      }}
    />
  );
}
