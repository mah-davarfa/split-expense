
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3011';


// res.status(200).json({message:'successfully loged in', token:token,user: { userId: user._id, name: user.name, email: user.email }})

export default async function authApi(path, {method = 'POST',token, body}={}) {
   const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token?{Authorization: `Bearer ${token}`} :{}),
        },
        body:body? JSON.stringify(body):undefined,
        credentials: 'include', // Include cookies for authentication
    });
   if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Request failed");
        }
   const data= await response.json().catch(() => ({}));
   return data;
}