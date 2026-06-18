export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#0d1b35", padding: "32px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "20px" }}>🌙</span>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>UmrahConnect © 2026</span>
      </div>

      {/* Links */}
      <div style={{ display: "flex", gap: "24px" }}>
        <a href="/privacy" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>Privacy Policy</a>
        <a href="/terms" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>Terms of Service</a>
        <a href="/contact" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>Contact</a>
      </div>

      {/* Made with */}
      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
        Made with 🤲 for pilgrims worldwide
      </div>

    </footer>
  )
}