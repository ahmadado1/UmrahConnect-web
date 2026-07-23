export default function Terms() {
  return (
    <div className="legal-page">
      <h1>Terms of Service</h1>
      <p style={{ color: "#999", fontSize: "14px", marginBottom: "40px" }}>Last updated: June 2026</p>
      <p style={{ color: "#444", lineHeight: "1.8", marginBottom: "32px" }}>By using UmrahConnect, you agree to these terms. Please read them carefully.</p>
      {[
        { title: "Use of the app", content: "UmrahConnect is intended for personal use by pilgrims performing Umrah or Hajj. You must be at least 13 years old to use this app." },
        { title: "Account responsibility", content: "You are responsible for keeping your account credentials secure. Please notify us immediately if you suspect unauthorized access." },
        { title: "Hotel bookings", content: "Hotel bookings made through UmrahConnect are requests confirmed by our team. Prices and availability are subject to change." },
        { title: "Religious content", content: "All Quran text, duas and Islamic content are provided for informational and spiritual purposes. We recommend consulting a qualified scholar for religious guidance." },
        { title: "Prayer times", content: "Prayer times are calculated based on your GPS location and may vary slightly from local mosque times." },
        { title: "Changes to terms", content: "We may update these terms from time to time. Continued use of the app after changes means you accept the new terms." },
        { title: "Contact us", content: "For questions about these terms, contact us at ahmadado1@icloud.com" },
      ].map((section) => (
        <div key={section.title} style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#1E3A5F", fontSize: "20px", fontWeight: "500", marginBottom: "8px" }}>{section.title}</h2>
          <p style={{ color: "#444", lineHeight: "1.8" }}>{section.content}</p>
        </div>
      ))}
    </div>
  )
}
