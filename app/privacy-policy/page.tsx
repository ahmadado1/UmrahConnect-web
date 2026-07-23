export const metadata = {
  title: 'Privacy Policy | UmrahConnect',
  description: 'UmrahConnect privacy policy — how we collect, use, and protect your information.',
};

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ color: "#1E3A5F", fontSize: "36px", fontWeight: "500", marginBottom: "8px" }}>Privacy Policy</h1>
      <p style={{ color: "#999", fontSize: "14px", marginBottom: "40px" }}>Last updated: June 2026</p>
      <p style={{ color: "#444", lineHeight: "1.8", marginBottom: "32px" }}>
        UmrahConnect is committed to protecting your privacy. This policy explains how we collect, use and protect your information.
      </p>
      {[
        { title: "Information we collect", content: "We collect your name, email address, and language preference when you create an account. We also collect your GPS location to provide accurate prayer times and weather information." },
        { title: "How we use your information", content: "We use your information to provide prayer times, personalize your experience, save your Quran progress and bookmarks, and process hotel booking requests." },
        { title: "Data storage", content: "Your data is stored securely using Supabase. We do not sell your personal information to third parties." },
        { title: "Google Sign In", content: "If you sign in with Google, we receive your name, email and profile picture. We do not store your Google password." },
        { title: "Location data", content: "We use your location only to calculate prayer times and local weather. We do not store or share your location history." },
        { title: "Contact us", content: "If you have questions about this privacy policy, contact us at ahmadado1@icloud.com" },
      ].map((section) => (
        <div key={section.title} style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#1E3A5F", fontSize: "20px", fontWeight: "500", marginBottom: "8px" }}>{section.title}</h2>
          <p style={{ color: "#444", lineHeight: "1.8" }}>{section.content}</p>
        </div>
      ))}
    </div>
  )
}
