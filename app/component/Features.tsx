const features = [
  {
    icon: "🕌",
    title: "Prayer times",
    description: "Accurate prayer times based on your GPS location with beautiful adhan recitations."
  },
  {
    icon: "📖",
    title: "Quran reader",
    description: "Full Quran in Arabic with translation in 5 languages. Bookmarks and progress tracking."
  },
  {
    icon: "🕋",
    title: "Umrah guide",
    description: "Complete step-by-step Umrah guide with duas, tips and notes for female pilgrims."
  },
  {
    icon: "🤲",
    title: "Duas & Zikr",
    description: "38+ duas for Umrah, prayer, travel and daily life with Arabic and transliteration."
  },
  {
    icon: "🏨",
    title: "Hotel bookings",
    description: "Find and book hotels near Masjid al-Haram in Makkah and Masjid an-Nabawi in Madinah."
  },
  {
    icon: "📅",
    title: "Islamic calendar",
    description: "Full Hijri calendar with key Islamic dates — Eid, Ramadan, Arafah with Gregorian dates."
  },
]

export default function Features() {
  return (
    <section id="features" style={{ padding: "80px 48px", backgroundColor: "#fff" }}>
      
      {/* Section header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div style={{ color: "#C9A84C", fontSize: "12px", fontWeight: "500", letterSpacing: "1px", marginBottom: "8px" }}>
          EVERYTHING YOU NEED
        </div>
        <h2 style={{ color: "#1E3A5F", fontSize: "36px", fontWeight: "500", marginBottom: "12px" }}>
          Built for pilgrims, by design
        </h2>
        <p style={{ color: "#666", fontSize: "16px", maxWidth: "500px", margin: "0 auto" }}>
          Every feature crafted to make your Umrah journey easier and more spiritual
        </p>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", maxWidth: "1000px", margin: "0 auto" }}>
        {features.map((feature) => (
          <div key={feature.title} style={{ backgroundColor: "#fff", border: "0.5px solid #e5e5e5", borderRadius: "16px", padding: "24px" }}>
            <div style={{ fontSize: "32px", marginBottom: "14px" }}>{feature.icon}</div>
            <h3 style={{ color: "#1E3A5F", fontSize: "16px", fontWeight: "500", marginBottom: "8px" }}>{feature.title}</h3>
            <p style={{ color: "#666", fontSize: "13px", lineHeight: "1.6" }}>{feature.description}</p>
          </div>
        ))}
      </div>

    </section>
  )
}