export default function LoadingSpinner({label='Loading...'}) {
  return (
    <div 
    style={{
        padding:12,
        display:'flex',
        alignItems:'center',
        gap:10,
    }}
    role='status'
    aria-live='polite'
    >
      <span
          style={{
          width: 16,
          height: 16,
          border: "2px solid #bbb",
          borderTopColor: "#333",
          borderRadius: "50%",
          display: "inline-block",
          animation: "spin 0.8s linear infinite",
        }}
      >{label}</span>
      <style>
        {`@keyframes spin { to { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
}