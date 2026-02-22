import { useEffect } from "react";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
  zIndex: 9999,
};

const panelStyle = {
  width: "100%",
  maxWidth: "520px",
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
  overflow: "hidden",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 16px",
  borderBottom: "1px solid #eee",
};

const bodyStyle = {
  padding: "16px",
};

export default function Modal({ title = "Modal", onClose, children }) {
    useEffect(() => {
        const onKeyDown = (e) => {
        if (e.key === "Escape") onClose?.();
        };
        document.addEventListener("keydown", onKeyDown);

        // optional UX: prevent background scroll while modal is open
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

    return (
        <div
        style={overlayStyle}
        onMouseDown={(e) => {
            // close when clicking the overlay (outside the panel)
            if (e.target === e.currentTarget) onClose?.();
        }}
        role="dialog"
        aria-modal="true"
        >
        <div style={panelStyle}>
            <div style={headerStyle}>
            <h3 style={{ margin: 0, fontSize: "18px" }}>{title}</h3>
            <button type="button" onClick={onClose} aria-label="Close">
                ✕
            </button>
            </div>

            <div style={bodyStyle}>{children}</div>
        </div>
        </div>
    );
}
