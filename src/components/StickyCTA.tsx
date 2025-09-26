import { useState, useEffect } from 'preact/hooks';
import { trackCTAClick, trackQuizStart } from '../lib/analytics';

interface Props {
  ctaText?: string;
  variant?: 'A' | 'B';
}

export default function StickyCTA({ ctaText = 'Começar teste', variant = 'A' }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [heroElement, setHeroElement] = useState<Element | null>(null);

  useEffect(() => {
    // Find the hero section
    const hero = document.querySelector('section'); // First section should be hero
    setHeroElement(hero);

    if (!hero) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Show sticky CTA when hero is not visible
          setIsVisible(!entry.isIntersecting);
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-10px 0px'
      }
    );

    observer.observe(hero);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleClick = () => {
    trackCTAClick('sticky');
    trackQuizStart();

    // Add UTM parameters
    const url = new URL('/quiz', window.location.origin);
    url.searchParams.set('utm_source', 'durma_landing');
    url.searchParams.set('utm_medium', 'sticky_cta');
    url.searchParams.set('utm_campaign', 'lux_method');
    url.searchParams.set('variant', variant);

    window.location.href = url.toString();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl border-t border-base-300 transform transition-all duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="container-responsive py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-base-content font-semibold text-sm sm:text-base">
              Descubra o que está sabotando seu sono
            </p>
            <p className="text-base-content/70 text-xs sm:text-sm">
              Teste gratuito de 1 minuto
            </p>
          </div>

          <button
            onClick={handleClick}
            className="btn btn-primary btn-lg w-full sm:w-auto whitespace-nowrap animate-bounce-subtle"
            data-event="durma_cta_click"
            data-position="sticky"
          >
            {ctaText}
          </button>
        </div>
      </div>
    </div>
  );
}