import { useNavigate } from "react-router-dom";
import { github, globe, twitter } from "../icons";
import Mark from "../../design/Mark";

const Landing = () => {
  const navigate = useNavigate();

  const links = [
    { href: "http://github.com/darwinz/thnkfl", icon: github(5), label: "GitHub" },
    { href: "https://twitter.com/ubbjuntu", icon: twitter(5), label: "Twitter" },
    { href: "http://johnsonb.com", icon: globe(5), label: "Personal site" },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--paper)",
        color: "var(--ink)",
        position: "relative",
      }}
    >
      <header
        style={{
          padding: "28px 32px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Mark size={28} />
        <span
          style={{
            font: "400 20px/1 var(--font-serif)",
            letterSpacing: "-0.02em",
          }}
        >
          thnkflist
        </span>
      </header>

      <section
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 32px",
        }}
      >
        <div style={{ maxWidth: 720, textAlign: "center" }}>
          <div
            style={{
              font: "500 11px/1 var(--font-mono)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--ink-mute)",
              marginBottom: 18,
            }}
          >
            Introducing
          </div>
          <h1
            style={{
              font: "300 88px/1 var(--font-serif)",
              letterSpacing: "-0.04em",
              color: "var(--ink)",
              margin: 0,
            }}
          >
            thnkflist
            <span style={{ fontStyle: "italic", color: "var(--ink-soft)" }}>.</span>
          </h1>
          <p
            style={{
              font: "italic 400 22px/1.5 var(--font-serif)",
              color: "var(--ink-soft)",
              marginTop: 24,
              marginBottom: 0,
            }}
          >
            a running gratitude list —
            <br />
            small things, kept.
          </p>
          <p
            style={{
              font: "400 15px/1.6 var(--font-sans)",
              color: "var(--ink-soft)",
              marginTop: 28,
              maxWidth: 480,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            spin up a new list whenever the mood strikes — before coffee, after a
            hike, at the end of the day. every past list stays one click away.
          </p>
          <button
            type="button"
            onClick={() => navigate("/lists")}
            style={{
              marginTop: 36,
              font: "500 14px/1 var(--font-sans)",
              padding: "14px 28px",
              borderRadius: "var(--r-full)",
              background: "var(--ink)",
              color: "var(--paper)",
              border: 0,
              cursor: "pointer",
              transition: "background .15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--ink)";
            }}
          >
            get started
          </button>
        </div>
      </section>

      <footer
        style={{
          padding: "24px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "var(--ink-mute)",
          font: "italic 400 13px/1 var(--font-serif)",
        }}
      >
        <span>"small things, kept."</span>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-label={item.label}
              style={{
                color: "var(--ink-mute)",
                transition: "color .15s",
                display: "inline-flex",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--ink)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--ink-mute)";
              }}
            >
              {item.icon}
            </a>
          ))}
        </div>
      </footer>
    </main>
  );
};

export default Landing;
