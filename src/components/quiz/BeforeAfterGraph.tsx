import { BEFORE_AFTER_DATA } from '../../lib/quiz/content';

interface BeforeAfterGraphProps {
  showAnimation?: boolean;
  compact?: boolean;
}

export default function BeforeAfterGraph({
  showAnimation = true,
  compact = false
}: BeforeAfterGraphProps) {
  const { antes, depois } = BEFORE_AFTER_DATA;

  return (
    <div className={`before-after-graph ${compact ? 'before-after-graph-compact' : ''}`}>
      <div className="before-after-header">
        <h3 className="before-after-title">
          Sua transformação em 7 dias
        </h3>
        <p className="before-after-subtitle">
          Resultados reais baseados em mais de 1.000 pessoas
        </p>
      </div>

      <div className="before-after-comparison">
        {/* ANTES */}
        <div className="before-after-column before-column">
          <div className="before-after-label before-label">
            {antes.label}
          </div>

          <div className="before-after-items">
            {antes.items.map((item, index) => (
              <div
                key={index}
                className="before-after-item before-item"
                style={{ animationDelay: showAnimation ? `${index * 100}ms` : '0ms' }}
              >
                <div className="item-label">
                  {item.label}
                </div>
                <div className="item-value-container">
                  <div
                    className="item-value-bar before-bar"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="item-value">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow/Transition */}
        <div className="before-after-arrow">
          <svg
            width="48"
            height="24"
            viewBox="0 0 48 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="arrow-icon"
          >
            <path
              d="M2 12H46M46 12L38 4M46 12L38 20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="arrow-label">7 dias</span>
        </div>

        {/* DEPOIS */}
        <div className="before-after-column after-column">
          <div className="before-after-label after-label">
            {depois.label}
          </div>

          <div className="before-after-items">
            {depois.items.map((item, index) => (
              <div
                key={index}
                className="before-after-item after-item"
                style={{ animationDelay: showAnimation ? `${(index + 4) * 100}ms` : '0ms' }}
              >
                <div className="item-label">
                  {item.label}
                </div>
                <div className="item-value-container">
                  <div
                    className="item-value-bar after-bar"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="item-value">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Metrics */}
      <div className="before-after-metrics">
        <div className="metric">
          <div className="metric-value">94%</div>
          <div className="metric-label">Melhoram em 7 dias</div>
        </div>
        <div className="metric">
          <div className="metric-value">87%</div>
          <div className="metric-label">Param com remédios</div>
        </div>
        <div className="metric">
          <div className="metric-value">30 dias</div>
          <div className="metric-label">Garantia total</div>
        </div>
      </div>
    </div>
  );
}