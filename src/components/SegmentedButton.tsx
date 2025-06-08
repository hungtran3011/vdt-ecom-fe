'use client';

interface SegmentedButtonOption {
  value: string;
  label: string;
  icon?: string;
}

interface SegmentedButtonProps {
  options: SegmentedButtonOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function SegmentedButton({
  options,
  value,
  onChange,
  disabled = false,
  className = ""
}: SegmentedButtonProps) {
  return (
    <div className={`inline-flex rounded-full border border-(--md-sys-color-outline) overflow-hidden ${className}`}>
      {options.map((option, index) => {
        const isSelected = value === option.value;
        const isFirst = index === 0;
        
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={`
              px-4 py-2 text-sm font-medium transition-all duration-150 flex items-center gap-2
              ${isSelected
                ? 'bg-(--md-sys-color-secondary-container) text-(--md-sys-color-on-secondary-container)'
                : 'bg-(--md-sys-color-surface) text-(--md-sys-color-on-surface) hover:bg-(--md-sys-color-surface-container-highest)'
              }
              ${!isFirst ? 'border-l border-(--md-sys-color-outline)' : ''}
              ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {option.icon && (
              <span className="mdi text-lg">
                {option.icon}
              </span>
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
