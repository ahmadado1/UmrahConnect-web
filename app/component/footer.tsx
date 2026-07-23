export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#0d1b35", padding: "48px 48px 32px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "32px",
          marginBottom: "32px",
        }}
      >
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

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <a
            href="mailto:ahmadado1@icloud.com"
            style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", textDecoration: "none" }}
          >
            ahmadado1@icloud.com
          </a>
          <a
            href="https://instagram.com/myumrahconnect"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", textDecoration: "none" }}
          >
            @myumrahconnect
          </a>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <a href="/privacy-policy" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>
            Privacy Policy
          </a>
          <a href="/terms" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>
            Terms of Service
          </a>
          <a href="/contact" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>
            Contact
          </a>
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
