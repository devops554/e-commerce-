export const metadata = {
  title: "Privacy Policy | Kiranase - Bihar's Fastest Grocery Delivery",
  description:
    "Read Kiranase's privacy policy. We are committed to protecting your personal information and your right to privacy.",
};

export default function PrivacyPolicy() {
  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>

      <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#15803d", marginBottom: "8px" }}>
        Privacy Policy
      </h1>
      <p style={{ color: "#666", marginBottom: "40px" }}>
        Last updated: March 2026
      </p>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "12px", color: "#1a1a1a" }}>
          1. Introduction
        </h2>
        <p style={{ color: "#444", lineHeight: 1.8 }}>
          Welcome to Kiranase ("we", "our", "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our website kiranase.com and our services.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "12px", color: "#1a1a1a" }}>
          2. Information We Collect
        </h2>
        <p style={{ color: "#444", lineHeight: 1.8, marginBottom: "12px" }}>
          We collect information you provide directly to us, including:
        </p>
        {[
          "Name, email address, phone number and delivery address when you create an account",
          "Payment information when you place an order",
          "Order history and preferences",
          "Communications you send us including customer support messages",
          "Device information and IP address when you visit our website",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "8px", alignItems: "flex-start" }}>
            <span style={{ color: "#15803d", fontWeight: 700, minWidth: "20px" }}>•</span>
            <p style={{ color: "#444", lineHeight: 1.8, margin: 0 }}>{item}</p>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "12px", color: "#1a1a1a" }}>
          3. How We Use Your Information
        </h2>
        <p style={{ color: "#444", lineHeight: 1.8, marginBottom: "12px" }}>
          We use the information we collect to:
        </p>
        {[
          "Process and deliver your orders across Bihar and India",
          "Send you order confirmations and delivery updates",
          "Provide customer support and resolve disputes",
          "Send promotional offers and updates (you can opt out anytime)",
          "Improve our services and website experience",
          "Comply with legal obligations",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "8px", alignItems: "flex-start" }}>
            <span style={{ color: "#15803d", fontWeight: 700, minWidth: "20px" }}>•</span>
            <p style={{ color: "#444", lineHeight: 1.8, margin: 0 }}>{item}</p>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "12px", color: "#1a1a1a" }}>
          4. Sharing Your Information
        </h2>
        <p style={{ color: "#444", lineHeight: 1.8, marginBottom: "12px" }}>
          We do not sell your personal information. We may share your information with:
        </p>
        {[
          "Delivery partners to fulfill your orders",
          "Payment processors to handle transactions securely",
          "Analytics providers to improve our services (e.g. Google Analytics)",
          "Law enforcement when required by law",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "8px", alignItems: "flex-start" }}>
            <span style={{ color: "#15803d", fontWeight: 700, minWidth: "20px" }}>•</span>
            <p style={{ color: "#444", lineHeight: 1.8, margin: 0 }}>{item}</p>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "12px", color: "#1a1a1a" }}>
          5. Data Security
        </h2>
        <p style={{ color: "#444", lineHeight: 1.8 }}>
          We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment transactions are encrypted using SSL technology.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "12px", color: "#1a1a1a" }}>
          6. Your Rights
        </h2>
        <p style={{ color: "#444", lineHeight: 1.8, marginBottom: "12px" }}>
          You have the right to:
        </p>
        {[
          "Access and receive a copy of your personal data",
          "Correct inaccurate personal data",
          "Request deletion of your personal data",
          "Opt out of marketing communications",
          "Lodge a complaint with a supervisory authority",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "8px", alignItems: "flex-start" }}>
            <span style={{ color: "#15803d", fontWeight: 700, minWidth: "20px" }}>•</span>
            <p style={{ color: "#444", lineHeight: 1.8, margin: 0 }}>{item}</p>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "12px", color: "#1a1a1a" }}>
          7. Cookies
        </h2>
        <p style={{ color: "#444", lineHeight: 1.8 }}>
          We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "12px", color: "#1a1a1a" }}>
          8. Children's Privacy
        </h2>
        <p style={{ color: "#444", lineHeight: 1.8 }}>
          Our services are not directed to children under 18 years of age. We do not knowingly collect personal information from children under 18.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "12px", color: "#1a1a1a" }}>
          9. Changes to This Policy
        </h2>
        <p style={{ color: "#444", lineHeight: 1.8 }}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page with an updated date.
        </p>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "12px", color: "#1a1a1a" }}>
          10. Contact Us
        </h2>
        <p style={{ color: "#444", lineHeight: 1.8 }}>
          If you have any questions about this Privacy Policy, please contact us:
        </p>
        <div style={{ background: "#f0fdf4", borderRadius: "12px", padding: "24px", marginTop: "16px" }}>
          <p style={{ color: "#444", margin: "0 0 8px" }}>📧 <strong>Email:</strong> care@kiranase.com</p>
          <p style={{ color: "#444", margin: "0 0 8px" }}>📞 <strong>Phone:</strong> +91 8581 901 902</p>
          <p style={{ color: "#444", margin: "0 0 8px" }}>🌐 <strong>Website:</strong> kiranase.com</p>
          <p style={{ color: "#444", margin: 0 }}>📍 <strong>Address:</strong> Bihar, India</p>
        </div>
      </section>

      <section style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", borderRadius: "16px", padding: "32px", textAlign: "center", color: "white" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "12px" }}>
          Questions? We're here to help!
        </h2>
        <p style={{ opacity: 0.9, marginBottom: "20px" }}>
          Contact us anytime at care@kiranase.com
        </p>
        
         <a href="https://www.kiranase.com"

          style={{ background: "white", color: "#16a34a", padding: "12px 32px", borderRadius: "50px", fontWeight: 700, fontSize: "1rem", textDecoration: "none", display: "inline-block" }}
        >
          🛒 Back to Shopping
        </a>
      </section>

    </main>
  );
}
