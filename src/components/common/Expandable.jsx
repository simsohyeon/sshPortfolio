import { useState } from "react";

// 기본 접힘 상세 영역. 인쇄 시에는 버튼/내용 모두 숨김(.no-print).
export default function Expandable({ label = "상세 보기", closeLabel = "접기", aside, children, style }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="no-print" style={style}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="btn btn-ghost"
        style={{
          padding: "6px 0",
          fontSize: "0.82rem",
          fontWeight: 500,
          color: "var(--color-accent)",
          gap: "6px",
        }}
      >
        {open ? closeLabel : label}
        <span aria-hidden="true" style={{
          display: "inline-block",
          transition: "transform 0.18s var(--ease)",
          transform: open ? "rotate(180deg)" : "none",
          fontSize: "0.7rem",
        }}>▾</span>
      </button>
      {aside}
      </div>
      {open && <div style={{ marginTop: "8px" }}>{children}</div>}
    </div>
  );
}
