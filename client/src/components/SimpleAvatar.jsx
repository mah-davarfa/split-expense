import { useState } from "react";


const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3011";

const buildFileUrl =(path)=>{
    if(!path) return '';
    const p = String(path).trim()
    if(!p) return '';
    if (p.startsWith("http")) return p;
    return `${API_BASE_URL}${p.startsWith("/") ? "" : "/"}${p}`;
}

export const SimpleAvatar =({name,profilePicture})=>{
    const [ok ,setOk]=useState(true);

////create a avator if url is not availble 

    const letter = (name?.trim()?.[0] || '?').toUpperCase();
    const src = profilePicture ? buildFileUrl(profilePicture) : "";
    return(
        <div
        style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        overflow: "hidden",
        border: "1px solid #e5e5e5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f7f7",
        fontWeight: 700,
        flex: "0 0 auto",
        userSelect: "none"
        }}>
         {src && ok ? (
        <img
          src={src}
          alt="profile"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => setOk(false)}
        />
      ) : (
        <span>{letter}</span>
      )}

        </div>
    )
}