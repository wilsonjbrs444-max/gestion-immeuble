import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
export default function Profil() {
  const [profil, setProfil] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ nom:'', email:'', telephone:'', numero_whatsapp:'', numero_orange_money:'', numero_wave:'', numero_virement:'', nom_facturation:'' });
  useEffect(() => { fetchProfil(); }, []);
  const fetchProfil = async () => { const { data } = await supabase.from('profil').select('*').single(); if (data) { setProfil(data); setForm({ nom:data.nom||'', email:data.email||'', telephone:data.telephone||'', numero_whatsapp:data.numero_whatsapp||'', numero_orange_money:data.numero_orange_money||'', numero_wave:data.numero_wave||'', numero_virement:data.numero_virement||'', nom_facturation:data.nom_facturation||'' }); } };
  const handleSubmit = async () => { setSaving(true); if (profil) { await supabase.from('profil').update(form).eq('id', profil.id); } else { await supabase.from('profil').insert(form); } setMessage('✅ Profil enregistré !'); setTimeout(() => setMessage(''), 3000); setSaving(false); fetchProfil(); };
  const fields = [{ label:'Votre nom', key:'nom', placeholder:'Wilson' },{ label:'Email', key:'email', placeholder:'email@gmail.com' },{ label:'Téléphone', key:'telephone', placeholder:'6XXXXXXXX' },{ label:'Numéro WhatsApp', key:'numero_whatsapp', placeholder:'2376XXXXXXXX' },{ label:'Nom sur factures', key:'nom_facturation', placeholder:'M. Wilson' },{ label:'Orange Money', key:'numero_orange_money', placeholder:'6XXXXXXXX' },{ label:'Wave', key:'numero_wave', placeholder:'6XXXXXXXX' },{ label:'Virement bancaire', key:'numero_virement', placeholder:'Numéro compte' }];
  return (
    <div>
      <h2 style={{color:'#1a1a2e',marginBottom:'24px'}}>⚙️ Mon Profil</h2>
      {message && <div style={{background:'#ecfdf5',color:'#10b981',padding:'14px',borderRadius:'10px',marginBottom:'20px',fontWeight:'600',textAlign:'center'}}>{message}</div>}
      <div style={{background:'white',borderRadius:'12px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'24px'}}>
          {fields.map(field => (
            <div key={field.key}>
              <label style={{display:'block',marginBottom:'6px',fontWeight:'600',fontSize:'14px'}}>{field.label}</label>
              <input type="text" value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} placeholder={field.placeholder} style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box',fontSize:'14px'}}/>
            </div>
          ))}
        </div>
        <div style={{background:'#eff6ff',borderRadius:'10px',padding:'16px',marginBottom:'24px'}}>
          <h4 style={{margin:'0 0 8px',color:'#1d4ed8'}}>💡 Alertes WhatsApp</h4>
          <p style={{margin:0,color:'#1d4ed8',fontSize:'13px'}}>Envoyez <strong>"I allow callmebot to send me messages"</strong> au <strong>+34 644 61 53 19</strong> sur WhatsApp pour activer les alertes.</p>
        </div>
        <button onClick={handleSubmit} disabled={saving} style={{background:saving?'#9ca3af':'#0f3460',color:'white',border:'none',borderRadius:'8px',padding:'12px 32px',cursor:'pointer',fontWeight:'600',fontSize:'16px'}}>{saving?'Enregistrement...':'💾 Enregistrer'}</button>
      </div>
    </div>
  );
}
