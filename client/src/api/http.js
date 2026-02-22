const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3011";

function isFormData (value){
    return typeof FormData !== 'undefined' && value instanceof FormData;
}

export async function http(path , {method='GET', body ,token, headers={}}={}){
   
    const form = isFormData(body);
   
    const res= await fetch(`${BASE_URL}${path}`,{
        method,
        headers:{
            ...(form ? {}:{'Content-Type':'application/json'}),
            ...(token ? {Authorization: `Bearer ${token}`} :{} ),
            ...(headers || {})
        },
        body:body
                ? form
                  ?body 
                  :JSON.stringify(body)
                  :undefined,
        credentials: "include",          
     })

     const contentType= res.headers.get('content-type') || '';

     let data;
     if(contentType.includes('application/json')){data= await res.json().catch(()=>null)
        }else if(contentType.startsWith('image/')){data= await res.blob().catch(()=>null)
            }else if(contentType.includes('application/pdf')){ data = await res.blob().catch(()=>null)
                }else{data= await res.text().catch(()=>null)}

     if(!res.ok){
        const message =
        (typeof data === "object" && data && (data.error || data.message))||
        (typeof data ==="string" && data) || `Request failed (${res.status})`
     
     const error = new Error(message);
        error.status= res.status;
        error.data=data;
        throw error
        }
 return data
}