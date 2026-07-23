export default function Navbar() {
  return (
    <nav style={{ backgroundColor: "#1E3A5F", padding: "25px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      
      {/* Logo */}
      <a href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
        <img src="/logo.jpg" style={{ width: "36px", height: "36px", borderRadius: "8px" }} alt="UmrahConnect" />
        <span style={{ color: "#fff", fontSize: "20px", fontWeight: "500" }}>UmrahConnect</span>
      </a>
      
      {/* Links */}
      <div style={{ display: "flex", gap: "32px" }}>
        <a href="/#features" style={{ color: "#fff", fontSize: "18px", textDecoration: "none" }}>Features</a>
        <a href="/hotels" style={{ color: "#fff", fontSize: "18px", textDecoration: "none" }}>Hotels</a>
        <a href="/#download" style={{ color: "#fff", fontSize: "18px", textDecoration: "none" }}>Download</a>
        <a href="/contact" style={{ color: "#fff", fontSize: "18px", textDecoration: "none" }}>Contact</a>
      </div>

      {/* Download button */}
      <a href="/#download" style={{ backgroundColor: "#C9A84C", color: "#1E3A5F", padding: "8px 20px", borderRadius: "20px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
        Download app
      </a>

    </nav>
  )
}