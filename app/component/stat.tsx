const stats = [
  { number: "5", label: "Languages" },
  { number: "114", label: "Quran surahs" },
  { number: "7", label: "Umrah phases" },
  { number: "38+", label: "Duas" },
  { number: "Free", label: "Always free" },
]

export default function Stats() {
  return (
    <section className="stats-bar">
      {stats.map((stat) => (
        <div key={stat.label} style={{ textAlign: "center" }}>
          <div style={{ color: "#1E3A5F", fontSize: "28px", fontWeight: "500" }}>{stat.number}</div>
          <div style={{ color: "rgba(30,58,95,0.7)", fontSize: "13px", marginTop: "2px" }}>{stat.label}</div>
        </div>
      ))}
    </section>
  )
}
