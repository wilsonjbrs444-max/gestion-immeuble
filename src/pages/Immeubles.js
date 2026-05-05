import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
export default function Immeubles() {
  const [immeubles, setImmeubles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ nom: '', adresse: '' });
  useEffect(() => { fetchImmeubles(); }, []);
  const fetchImmeubles = async () => { const { data } = await supabase.from('immeubles').select('*').order('created_at'); setImmeubles(data || []); };
  const handleSubmit = async () => { if (!form.nom) return alert('Nom obligatoire'); if (editItem) { await supabase.from('immeubles').update(form).eq('id', editItem.id); } else { await supabase.from('immeubles').insert(form); } setForm({ nom: '', adresse: '' }); setShowForm(false); setEditItem(null); fetchImmeubles(); };
  const handleDelete = async (id) => { if (!window.confirm('Supprimer ?')) return; await supabase.from('immeubles').delete().eq('id', id); fetchImmeubles(); };
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <h2 style={{color:'#1a1a2e',margin:0}}>🏢 Immeubles</h2>
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm({ nom: '', adresse: '' }); }} style={{background:'#0f3460',color:'white',border:'none',borderRadius:'8px',padding:'10px 20px',cursor:'pointer',fontWeight:'600'}}>+ Ajouter</button>
      </div>
      {showForm && (
        <div style={{background:'white',borderRadius:'12px',padding:'24px',marginBottom:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
          <h3>{editItem ? 'Modifier' : 'Nouvel immeuble'}</h3>
          <div style={{marginBottom:'16px'}}><label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Nom *</label><input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box'}} placeholder="Ex: Immeuble Centre"/></div>
          <div style={{marginBottom:'20px'}}><label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Adresse</label><input value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box'}} placeholder="Ex: Rue 12"/></div>
          <div style={{display:'flex',gap:'10px'}}><button onClick={handleSubmit} style={{background:'#10b981',color:'white',border:'none',borderRadius:'8px',padding:'10px 24px',cursor:'pointer',fontWeight:'600'}}>{editItem ? 'Modifier' : 'Enregistrer'}</button><button onClick={() => setShowForm(false)} style={{background:'#e5e7eb',color:'#374151',border:'none',borderRadius:'8px',padding:'10px 24px',cursor:'pointer'}}>Annuler</button></div>
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'16px'}}>
        {immeubles.map(immeuble => (
          <div key={immeuble.id} style={{background:'white',borderRadius:'12px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
            <div style={{fontSize:'32px',marginBottom:'12px'}}>🏢</div>
            <h3 style={{margin:'0 0 8px',color:'#1a1a2e'}}>{immeuble.nom}</h3>
            {immeuble.adresse && <p style={{color:'#6b7280',margin:'0 0 16px',fontSize:'14px'}}>📍 {immeuble.adresse}</p>}
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={() => { setEditItem(immeuble); setForm({ nom: immeuble.nom, adresse: immeuble.adresse || '' }); setShowForm(true); }} style={{flex:1,background:'#eff6ff',color:'#3b82f6',border:'none',borderRadius:'8px',padding:'8px',cursor:'pointer',fontWeight:'600'}}>✏️ Modifier</button>
              <button onClick={() => handleDelete(immeuble.id)} style={{flex:1,background:'#fef2f2',color:'#ef4444',border:'none',borderRadius:'8px',padding:'8px',cursor:'pointer',fontWeight:'600'}}>🗑️ Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
