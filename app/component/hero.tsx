export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.4)", borderRadius: "20px", padding: "6px 14px", marginBottom: "24px" }}>
          <span>🕋</span>
          <span style={{ color: "#C9A84C", fontSize: "11px", fontWeight: "500", letterSpacing: "0.5px" }}>YOUR COMPLETE UMRAH COMPANION</span>
        </div>

        <h1 className="hero-title">
          Your journey to{" "}
          <span style={{ color: "#C9A84C" }}>the blessed lands</span>{" "}
          starts here
        </h1>

        <p className="hero-subtitle">
          Prayer times, Quran reader, Umrah guide, hotel bookings, duas and more — everything you need for a blessed pilgrimage.
        </p>

        <div className="hero-buttons">
          <a href="#">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>Download on the</div>
              <div style={{ color: "#fff", fontSize: "15px", fontWeight: "500" }}>App Store</div>
            </div>
          </a>
          <a href="#">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M3 20.5v-17c0-.83 1-.83 1.5-.5l15 8.5-15 8.5c-.5.33-1.5.33-1.5-.5z"/>
            </svg>
            <div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>Get it on</div>
              <div style={{ color: "#fff", fontSize: "15px", fontWeight: "500" }}>Google Play</div>
            </div>
          </a>
        </div>
      </div>

      <div className="hero-emoji">🕋</div>
    </section>
  )
}
