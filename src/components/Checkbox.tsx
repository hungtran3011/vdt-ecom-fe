'use client';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export default function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  className = ""
}: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  return (
    <label className={`flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />
        
        {/* Checkbox visual */}
        <div
          className={`
            w-5 h-5 rounded border-2 transition-all duration-150 flex items-center justify-center
            ${checked
              ? 'bg-(--md-sys-color-primary) border-(--md-sys-color-primary)'
              : 'bg-transparent border-(--md-sys-color-outline) hover:border-(--md-sys-color-on-surface)'
            }
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {checked && (
            <span className="mdi text-sm text-(--md-sys-color-on-primary)">
              check
            </span>
          )}
        </div>
      </div>
      
      <span className={`text-sm ${disabled ? 'text-(--md-sys-color-on-surface-variant)' : 'text-(--md-sys-color-on-surface)'}`}>
        {label}
      </span>
    </label>
  );
}
