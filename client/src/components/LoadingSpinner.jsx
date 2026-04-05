export default function LoadingSpinner({label='Loading...'}) {
  return (
    <div 
    style={{
        padding:12,
        // display:'flex',
        position:"relative",
        
        // width:'100%',
        // alignItems:'center',
        gap:10,
    }}
    role='status'
    aria-live='polite'
    >
      <span
          style={{
           width: 200,
          //  height: 100,
          // border: "2px solid red",
          // borderTopColor: "#333",
          // borderRadius: "50%",
          // display: "inline-block",
          // animation: "spin 0.8s linear infinite",
          
          position: 'absolute',
          inset: 0,
          transform:' translateX(0%)',
          background: 'linear-gradient(90deg,transparent, rgba(255,255,255,0.6), transparent)',
          animation: 'conectTo 1.2s infinite',
        }}
      >{label}</span>
      {/* <style>
        {`@keyframes spin { to { transform: rotate(360deg); } }`}
      </style> */}
      <style>
        {'@keyframes conectTo {50% { transform: translateX(50%); }}'}
      </style>
    </div>
  );
}