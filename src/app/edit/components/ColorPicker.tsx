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
    <div className="flex items-center gap-1.5">
      {colors.map((color) => (
        <button
          key={color.value}
          onClick={() => onChange(color.value)}
          className={`w-6 h-6 rounded-md transition-all ${
            value === color.value
              ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)] scale-110'
              : 'hover:scale-110'
          }`}
          style={{ backgroundColor: color.value }}
          title={color.name}
        />
      ))}
      {/* Custom color input */}
      <label className="relative w-6 h-6 rounded-md overflow-hidden cursor-pointer hover:scale-110 transition-transform border border-[var(--panel-border)]">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer border-0 p-0"
        />
      </label>
    </div>
  );
}
