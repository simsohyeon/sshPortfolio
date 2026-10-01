// 좌측 라벨 | 우측 본문 행. Experience 행·Skills·이력에서 공용
export default function LabelRow({ label, sub, accent, children }) {
  return (
    <div className="label-row">
      <div className="label-row-label">
        <span style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.92rem",
          fontWeight: 600,
          color: accent ? "var(--color-accent)" : "var(--color-text-strong)",
          lineHeight: 1.4,
        }}>{label}</span>
        {sub && (
          <span style={{
            display: "block",
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            color: "var(--color-muted)",
            marginTop: "3px",
            lineHeight: 1.5,
          }}>{sub}</span>
        )}
      </div>
      <div className="label-row-body">{children}</div>
    </div>
  );
}
