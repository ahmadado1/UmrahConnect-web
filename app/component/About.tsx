export default function About() {
  return (
    <section style={{ padding: "80px 48px", backgroundColor: "#fff" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ color: "#C9A84C", fontSize: "12px", fontWeight: "500", letterSpacing: "1px", marginBottom: "8px" }}>
          MEET THE DEVELOPER
        </div>
        <h2 style={{ color: "#1E3A5F", fontSize: "36px", fontWeight: "500", margin: "0 0 32px" }}>
          About
        </h2>

        <div
          style={{
            background: "#f5f0e8",
            borderRadius: "16px",
            padding: "40px 32px",
            border: "1px solid rgba(201,168,76,0.2)",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1E3A5F 0%, #2d5a8e 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "28px",
            }}
          >
            🌙
          </div>

          <h3 style={{ color: "#1E3A5F", fontSize: "24px", fontWeight: "600", margin: "0 0 4px" }}>
            Ahmad Ado Muktar
          </h3>
          <p style={{ color: "#C9A84C", fontSize: "14px", fontWeight: "500", margin: "0 0 20px" }}>
            Founder &amp; Developer
          </p>
          <p style={{ color: "#666", fontSize: "16px", lineHeight: "1.8", margin: "0 0 24px" }}>
            Built by a Muslim developer passionate about making the Umrah journey easier for pilgrims worldwide.
          </p>
          <a
            href="mailto:ahmadado1@icloud.com"
            style={{ color: "#1E3A5F", fontSize: "15px", fontWeight: "500", textDecoration: "none" }}
          >
            ahmadado1@icloud.com
          </a>
        </div>
      </div>
    </section>
  )
}
