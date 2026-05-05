import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#1a1a2e,#0f3460)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'white',borderRadius:'16px',padding:'40px',width:'100%',maxWidth:'400px'}}>
        <h1 style={{textAlign:'center',color:'#1a1a2e'}}>🏢 GestImmo</h1>
        <p style={{textAlign:'center',color:'#666',marginBottom:'32px'}}>Gestion de vos immeubles</p>
        {error && <div style={{background:'#fee2e2',color:'#dc2626',padding:'12px',borderRadius:'8px',marginBottom:'16px'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={{width:'100%',padding:'12px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box'}} placeholder="votre@email.com"/>
          </div>
          <div style={{marginBottom:'24px'}}>
            <label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Mot de passe</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:'100%',padding:'12px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box'}} placeholder="••••••••"/>
          </div>
          <button type="submit" disabled={loading} style={{width:'100%',padding:'14px',background:loading?'#9ca3af':'#0f3460',color:'white',border:'none',borderRadius:'8px',fontSize:'16px',fontWeight:'600',cursor:'pointer'}}>
            {loading?'Connexion...':'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
