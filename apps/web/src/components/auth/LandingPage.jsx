import AuthScreen from "./AuthScreen";

export default function LandingPage({ onSignup, onLogin, onSession, showAuth, authMode, onCloseAuth }) {
    return (
      <div className="landing-page">
        <header className="landing-header">
          <div className="landing-brand">
            <Building2 size={24} />
            <span><strong>AuditExpress</strong></span>
          </div>
          <div className="landing-actions">
            <button className="secondary" onClick={onSignup}>Sign Up</button>
            <button className="primary" onClick={onLogin}>Log In</button>
          </div>
        </header>

        {showAuth && (
          <div className="modal-overlay" onClick={onCloseAuth}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="modal-close" onClick={onCloseAuth}>✕</button>
              <AuthScreen mode={authMode} onSession={onSession} />
            </div>
          </div>
        )}

        <div className="landing-content">
          <section className="landing-hero">
            <h1>Professional Financial Reporting Engine</h1>
            <p>Streamline your Ind AS compliance reporting with intelligent ledger mapping and automated report generation.</p>
            <div className="landing-cta">
              <button className="primary" onClick={onSignup}>Get Started</button>
              <button className="secondary" onClick={onLogin}>Sign In</button>
            </div>
          </section>

          <section className="landing-features">
            <div className="feature">
              <div className="feature-icon">📊</div>
              <h3>Trial Balance Upload</h3>
              <p>Upload Excel trial balances and automatically parse ledger entries with validation.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🎯</div>
              <h3>Smart Ledger Mapping</h3>
              <p>Rule-based mapping of ledgers to Schedule III lines with manual override capability.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📄</div>
              <h3>Report Generation</h3>
              <p>Generate standalone and consolidated Ind AS reports with comparative period support.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🔍</div>
              <h3>Unmapped Entry Review</h3>
              <p>Easily identify and map unmapped ledger entries with dropdown selection.</p>
            </div>
          </section>

          <section className="landing-footer">
            <p>&copy; 2026 AuditExpress. Professional financial reporting suite.</p>
          </section>
        </div>
      </div>
    );
}