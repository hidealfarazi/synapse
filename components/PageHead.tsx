/**
 * components/PageHead.tsx
 * Uniform header: mono counter line + large bold title + mono sublabel.
 */
interface PageHeadProps {
  counter: string;
  section: string;
  title: string;
  sub: string;
  accentColor?: string;
}

export function PageHead({ counter, section, title, sub, accentColor = "var(--rn-accent)" }: PageHeadProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.6875rem",
            letterSpacing: "0.12em",
            color: "var(--rn-muted)",
            textTransform: "uppercase",
          }}
        >
          {counter}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.6875rem",
            letterSpacing: "0.12em",
            color: accentColor,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          {section}
        </span>
      </div>
      <h1
        style={{
          fontSize: "clamp(2rem, 7vw, 3.5rem)",
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          color: "var(--rn-text)",
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.6875rem",
          letterSpacing: "0.08em",
          color: "var(--rn-muted)",
          marginTop: "0.75rem",
          textTransform: "uppercase",
        }}
      >
        {sub}
      </p>
    </div>
  );
}
