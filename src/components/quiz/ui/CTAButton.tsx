import type { ComponentChildren } from 'preact';

interface CTAButtonProps {
  children: ComponentChildren;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'data-event'?: string;
  ariaLabel?: string;
  count?: number;
}

export default function CTAButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  className = '',
  'data-event': dataEvent,
  ariaLabel,
  count
}: CTAButtonProps) {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && !loading) {
      e.preventDefault();
      onClick?.();
    }
  };

  const isDisabled = disabled || loading;
  
  const buttonClasses = [
    'cta-button',
    `cta-button--${variant}`,
    `cta-button--${size}`,
    fullWidth && 'cta-button--full-width',
    isDisabled && 'cta-button--disabled',
    loading && 'cta-button--loading',
    className
  ].filter(Boolean).join(' ');

  const buttonContent = (
    <>
      {loading && (
        <div className="cta-button__spinner" aria-hidden="true">
          <svg className="cta-button__spinner-icon" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="60 40"
            />
          </svg>
        </div>
      )}
      
      <span className={`cta-button__content ${loading ? 'cta-button__content--loading' : ''}`}>
        {children}
        {count !== undefined && count > 0 && (
          <span className="cta-button__count" aria-label={`(${count} selecionados)`}>
            ({count})
          </span>
        )}
      </span>
    </>
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown as any}
      disabled={isDisabled}
      data-event={dataEvent}
      aria-label={ariaLabel}
      aria-disabled={isDisabled}
    >
      {buttonContent}
    </button>
  );
}
