import { useEffect, useState } from 'preact/hooks';

interface ProgressBarTopProps {
  currentStep: number;
  totalSteps?: number;
  percentage?: number;
  stepLabel?: string;
  className?: string;
}

export default function ProgressBarTop({
  currentStep,
  totalSteps = 18,
  percentage,
  stepLabel,
  className = ''
}: ProgressBarTopProps) {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Calculate percentage if not provided
  const calculatedPercentage = percentage !== undefined 
    ? percentage 
    : Math.round((currentStep / totalSteps) * 100);

  // Show the bar after mount
  useEffect(() => {
    const showTimeout = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(showTimeout);
  }, []);

  // Simple percentage animation
  useEffect(() => {
    setDisplayPercentage(calculatedPercentage);
  }, [calculatedPercentage]);

  // Generate step label if not provided
  const defaultStepLabel = `Etapa ${currentStep} de ${totalSteps}`;
  const finalStepLabel = stepLabel || defaultStepLabel;

  return (
    <div 
      className={`progress-bar-top ${className} ${isVisible ? 'progress-bar-top--visible' : ''}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(displayPercentage)}
      aria-label={`Progresso do quiz: ${Math.round(displayPercentage)}%`}
    >
      <div className="progress-bar-top__track">
        <div 
          className="progress-bar-top__fill"
          style={{ width: `${displayPercentage}%` }}
        />
      </div>
      
      <div className="progress-bar-top__label">
        <span className="progress-bar-top__percentage">
          {Math.round(displayPercentage)}%
        </span>
        <span className="progress-bar-top__step">
          {finalStepLabel}
        </span>
      </div>
    </div>
  );
}
