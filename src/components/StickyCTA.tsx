import { useState, useEffect } from 'preact/hooks';
import { trackCTAClick } from '../lib/analytics';

interface Props {
  ctaText?: string;
  variant?: 'A' | 'B';
}

export default function StickyCTA({ ctaText = 'Quero dormir naturalmente', variant: _variant = 'A' }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Find the hero CTA button instead of the entire hero section
    const heroCTA = document.getElementById('hero-cta');
    if (!heroCTA) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Show sticky CTA when hero CTA button is not visible
          const shouldShow = !entry.isIntersecting;
          setIsVisible(shouldShow);

          // Add/remove padding to body when sticky CTA is shown/hidden
          document.body.style.paddingBottom = shouldShow ? '120px' : '0';
        });
      },
      {
        threshold: 0,
        rootMargin: '0px'
      }
    );

    observer.observe(heroCTA);

    return () => {
      observer.disconnect();
      // Clean up padding when component unmounts
      document.body.style.paddingBottom = '0';
    };
  }, []);

  const handleClick = () => {
    trackCTAClick('sticky');
    const offerSection = document.getElementById('oferta');
    if (offerSection) {
      offerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.hash = 'oferta';
    }
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
              Checklist Método Lux com passo a passo diário
            </p>
            <p className="text-base-content/70 text-xs sm:text-sm">
              Acesso imediato + Bônus Quarto Caverna
            </p>
          </div>

          <button
            onClick={handleClick}
            className="btn bg-accent hover:bg-accent-600 text-white btn-lg w-full sm:w-auto whitespace-nowrap animate-bounce-subtle shadow-lg hover:shadow-xl transition-all duration-200"
            data-event="durma_cta_click"
            data-position="sticky"
            data-variant={_variant}
          >
            {ctaText}
          </button>
        </div>
      </div>
    </div>
  );
}
