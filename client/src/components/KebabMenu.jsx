import { useEffect,useRef, useState } from "react";

const KebabMenu = ({items=[]})=>{

    const [open,setOpen]=useState(false)
    const ref=useRef(null);


    useEffect(()=>{
        const onClickOutSide=(e)=>{
           if(ref.current && !ref.current.contains(e.target))setOpen(false)
        }
            document.addEventListener('mousedown', onClickOutSide);
            return()=>document.removeEventListener('mousedown',onClickOutSide)

        },[])
    

    const onItemClick =(handler)=>{
        setOpen(false)
        if(typeof handler === 'function') handler();
    };

    return (
         <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-label="Actions">
        ⋮
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            background: "white",
            border: "1px solid #ddd",
            padding: "6px",
            minWidth: "140px",
            zIndex: 50,
          }}
        >
          {items.map((it, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onItemClick(it.onClick)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "6px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              disabled={it.disabled}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>

    )
}
export default KebabMenu;