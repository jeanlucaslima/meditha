import { ComponentChildren } from 'preact';

interface NoticeProps {
  children: ComponentChildren;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export default function Notice({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  className = ''
}: NoticeProps) {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return (
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
            <path d="M6 8l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'warning':
        return (
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 1L15 14H1L8 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 6v3m0 3h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'danger':
        return (
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 4v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      default: // info
        return (
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 7v4m0-7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
    }
  };

  const handleDismiss = () => {
    if (dismissible && onDismiss) {
      onDismiss();
    }
  };

  return (
    <div 
      className={`notice notice--${variant} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="notice__content">
        <div className="notice__icon">
          {getIcon()}
        </div>
        
        <div className="notice__body">
          {title && (
            <div className="notice__title">
              {title}
            </div>
          )}
          <div className="notice__text">
            {children}
          </div>
        </div>

        {dismissible && (
          <button
            type="button"
            className="notice__dismiss"
            onClick={handleDismiss}
            aria-label="Fechar notificação"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
