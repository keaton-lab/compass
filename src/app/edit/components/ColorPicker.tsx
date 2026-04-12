'use client';

interface ColorOption {
  name: string;
  value: string;
}

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: ColorOption[];
}

const DEFAULT_COLORS: ColorOption[] = [
  { name: '蓝色', value: '#3b82f6' },
  { name: '绿色', value: '#10b981' },
  { name: '紫色', value: '#8b5cf6' },
  { name: '橙色', value: '#f59e0b' },
  { name: '红色', value: '#ef4444' },
  { name: '青色', value: '#06b6d4' },
  { name: '粉色', value: '#ec4899' },
  { name: '靛蓝', value: '#6366f1' },
];

export default function ColorPicker({ value, onChange, colors = DEFAULT_COLORS }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-2">
      {colors.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onChange(color.value)}
          className={`h-7 w-7 rounded-[999px] border transition-transform ${
            value === color.value
              ? 'scale-110 ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)]'
              : 'hover:scale-105'
          }`}
          style={{ backgroundColor: color.value, borderColor: 'rgba(255,255,255,0.28)' }}
          title={color.name}
        />
      ))}

    </div>
  );
}
