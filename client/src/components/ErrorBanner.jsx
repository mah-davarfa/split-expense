export default function ErrorBanner({ message, onClose }) {
  if (!message) return null;

  return (
    <div
      style={{
        background: "#ffe8e8",
        border: "1px solid #ffb3b3",
        color: "#7a0000",
        padding: 12,
        borderRadius: 8,
        margin: "10px 0",
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
      }}
      role="alert"
    >
      <span>{message}</span>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  );
}