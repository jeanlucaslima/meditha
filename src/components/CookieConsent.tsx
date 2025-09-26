import { useState, useEffect } from 'preact/hooks';
import { setConsentStatus, shouldShowConsentBanner } from '../lib/consent';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we should show the banner
    setIsVisible(shouldShowConsentBanner());
  }, []);

  const handleAccept = () => {
    setConsentStatus('accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    setConsentStatus('rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl border-t border-base-300">
      <div className="container-responsive py-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-base-content font-semibold text-sm mb-2">
              Cookies e Privacidade
            </h3>
            <p className="text-base-content/70 text-sm leading-relaxed">
              Usamos cookies para melhorar sua experiência e analisar como você usa nosso site.
              Isso nos ajuda a personalizar o conteúdo e otimizar nossa plataforma.
              <br />
              <a
                href="/privacy"
                className="text-primary hover:text-primary-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Saiba mais sobre nossa política de privacidade
              </a>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={handleReject}
              className="btn btn-outline text-sm px-4 py-2 w-full sm:w-auto order-2 sm:order-1"
            >
              Apenas essenciais
            </button>
            <button
              onClick={handleAccept}
              className="btn btn-primary text-sm px-6 py-2 w-full sm:w-auto order-1 sm:order-2"
            >
              Aceitar todos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}