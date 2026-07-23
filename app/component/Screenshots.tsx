const screens = [
  {
    src: "/images/Simulator Screenshot - iPhone 16 Pro Max - 2026-07-16 at 00.25.02.png",
    label: "Home",
  },
  {
    src: "/images/Simulator Screenshot - iPhone 16 Pro Max - 2026-07-16 at 00.25.19.png",
    label: "AI Guide",
  },
  {
    src: "/images/Simulator Screenshot - iPhone 16 Pro Max - 2026-07-14 at 22.18.55.png",
    label: "Prayer",
  },
  {
    src: "/images/Simulator Screenshot - iPhone 16 Pro Max - 2026-06-23 at 19.45.17.png",
    label: "Services",
  },
]

function PhoneMockup({ src, label }: { src: string; label: string }) {
  return (
    <div className="phone-mockup">
      <div className="phone-mockup-frame">
        <div className="phone-mockup-screen">
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "72px",
              height: "20px",
              background: "#000",
              borderRadius: "12px",
              zIndex: 2,
            }}
          />
          <img
            src={src}
            alt={`UmrahConnect ${label} screen`}
            style={{ width: "100%", display: "block" }}
          />
        </div>
      </div>
      <div style={{ color: "#1E3A5F", fontSize: "14px", fontWeight: "600", marginTop: "16px" }}>
        {label}
      </div>
    </div>
  )
}

export default function Screenshots() {
  return (
    <section className="section-padding" style={{ backgroundColor: "#f5f0e8" }}>
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div className="section-label" style={{ marginBottom: "8px" }}>
          SEE IT IN ACTION
        </div>
        <h2 className="section-title" style={{ color: "#1E3A5F", margin: 0 }}>
          See it in action
        </h2>
      </div>

      <div className="screenshots-row">
        {screens.map((screen) => (
          <PhoneMockup key={screen.label} src={screen.src} label={screen.label} />
        ))}
      </div>
    </section>
  )
}
