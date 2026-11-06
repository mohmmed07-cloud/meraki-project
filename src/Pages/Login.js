import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './firebase';

import { useNavigate } from 'react-router-dom';
import './Login.css';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
const handleLogin = async (e) => {
    e.preventDefault();
    try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/admin');
    } catch (err) {
        console.error("خطأ الفايربيز بالتفصيل:", err.code, err.message); // اطبع الخطأ الحقيقي هنا
        setError('الخطأ هو: ' + err.code); // ليظهر لك الخطأ على الشاشة وتعرفه فوراً
    }
};

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <h2>Admin Login</h2>
                {error && <p className="error-msg">{error}</p>}
                
                <input 
                    type="email" 
                    placeholder="Admin Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;