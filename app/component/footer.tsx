export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "20px" }}>🌙</span>
            <span style={{ color: "#fff", fontSize: "18px", fontWeight: "500" }}>UmrahConnect</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: "0 0 4px" }}>
            Ahmad Ado Muktar
          </p>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", margin: 0 }}>
            Made with 🤲 for pilgrims worldwide
          </p>
        </div>

        <div className="footer-links-col footer-email">
          <a href="mailto:ahmadado1@icloud.com">
            ahmadado1@icloud.com
          </a>
          <a
            href="https://instagram.com/myumrahconnect"
            target="_blank"
            rel="noopener noreferrer"
          >
            @myumrahconnect
          </a>
        </div>

        <div className="footer-links-col">
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/contact">Contact</a>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "24px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", margin: 0 }}>
          © 2026 UmrahConnect. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
