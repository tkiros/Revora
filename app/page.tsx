import { FoodCheckForm } from "../components/food-check-form";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "16px 12px 32px",
        color: "#0f172a"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          margin: "0 auto",
          display: "grid",
          gap: "16px"
        }}
      >
        <section
          style={{
            display: "grid",
            gap: "10px",
            padding: "20px",
            borderRadius: "24px",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0"
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#475569"
            }}
          >
            Revora
          </p>
          <h1 style={{ margin: 0, fontSize: "32px", lineHeight: 1.1 }}>
            Revora&apos;s quick permission-first food check
          </h1>
          <p style={{ margin: 0, fontSize: "16px", lineHeight: 1.6, color: "#334155" }}>
            Describe the food, add your latest A1C, and stay on one page while
            Revora prepares a calm answer. No login is required, and local
            validation checks your input before any request is sent.
          </p>
        </section>

        <section
          style={{
            padding: "20px",
            borderRadius: "24px",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)"
          }}
        >
          <FoodCheckForm />
        </section>
      </div>
    </main>
  );
}
