const screens = [
  { src: "/screen1.jpg", label: "Home" },
  { src: "/screen2.jpg", label: "Prayer Times" },
  { src: "/screen3.jpg", label: "Quran Reader" },
  { src: "/screen4.jpg", label: "Umrah Guide" },
]

export default function Screenshots() {
  return (
    <section style={{ backgroundColor: "#f5f0e8", padding: "80px 48px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div style={{ color: "#C9A84C", fontSize: "12px", fontWeight: "500", letterSpacing: "1px", marginBottom: "8px" }}>
          SEE IT IN ACTION
        </div>
        <h2 style={{ color: "#1E3A5F", fontSize: "36px", fontWeight: "500" }}>
          Beautiful by design
        </h2>
      </div>

      {/* Screenshots row */}
      <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
        {screens.map((screen) => (
          <div key={screen.label} style={{ textAlign: "center" }}>
            <div style={{ width: "200px", borderRadius: "28px", overflow: "hidden", border: "6px solid #1E3A5F", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
              <img src={screen.src} style={{ width: "100%", display: "block" }} alt={screen.label} />
            </div>
            <div style={{ color: "#1E3A5F", fontSize: "13px", fontWeight: "500", marginTop: "12px" }}>
              {screen.label}
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}