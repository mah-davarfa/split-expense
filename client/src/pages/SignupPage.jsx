import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";


const SignupPage = ()=>{
    const [name,setName] = useState('');
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
      const [passwordConfirm,setPasswordConfirm] = useState('');
    const {signup} = useAuth();

    const handleSignup = async(e)=>{
        e.preventDefault();
           if(password !== passwordConfirm){
            alert('Passwords do not match');
            setName('');
            setEmail('');
            setPassword('');
            setPasswordConfirm('');
            return;
        }
        await signup(name,email,password);
        setName('');
        setEmail('');
        setPassword('');
        setPasswordConfirm('');
    }

    return(
        <div>
            <h2>SignupPage   page</h2>
            <form onSubmit={handleSignup}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e)=>setName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />
                <input
                type="password"
                placeholder="passwordConfirm"
                value={passwordConfirm}
                onChange={(e)=>setPasswordConfirm(e.target.value)}
            />
                <button type="submit">Signup</button>
            </form>

        </div>
        
    )
}
export default SignupPage;