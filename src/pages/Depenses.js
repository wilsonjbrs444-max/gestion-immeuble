import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
export default function Depenses() {
  const [depenses, setDepenses] = useState([]);
  const [immeubles, setImmeubles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filtreImmeuble, setFiltreImmeuble] = useState('');
  const [form, setForm] = useState({ immeuble_id:'', categorie:'', montant:'', description:'', date_depense: new Date().toISOString().split('T')[0] });
  const categories = ['Plomberie','Électricité','Peinture','Gardien','Nettoyage','Réparation','Autre'];
  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { const { data: imm } = await supabase.from('immeubles').select('*').order('nom'); const { data: dep } = await supabase.from('depenses').select('*, immeubles(nom)').order('date_depense', { ascending: false }); setImmeubles(imm || []); setDepenses(dep || []); };
  const handleSubmit = async () => { if (!form.immeuble_id || !form.montant) return alert('Immeuble et montant obligatoires'); await supabase.from('depenses').insert(form); setForm({ immeuble_id:'', categorie:'', montant:'', description:'', date_depense: new Date().toISOString().split('T')[0] }); setShowForm(false); fetchData(); };
  const handleDelete = async (id) => { if (!window.confirm('Supprimer ?')) return; await supabase.from('depenses').delete().eq('id', id); fetchData(); };
  const depensesFiltrees = filtreImmeuble ? depenses.filter(d => d.immeuble_id === filtreImmeuble) : depenses;
  const total = depensesFiltrees.reduce((sum, d) => sum + (d.montant || 0), 0);
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <h2 style={{color:'#1a1a2e',margin:0}}>📝 Dépenses</h2>
        <button onClick={() => setShowForm(true)} style={{background:'#0f3460',color:'white',border:'none',borderRadius:'8px',padding:'10px 20px',cursor:'pointer',fontWeight:'600'}}>+ Ajouter</button>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px',flexWrap:'wrap',gap:'12px'}}>
        <select value={filtreImmeuble} onChange={e => setFiltreImmeuble(e.target.value)} style={{padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px'}}><option value="">Tous les immeubles</option>{immeubles.map(i => <option key={i.id} value={i.id}>{i.nom}</option>)}</select>
        <div style={{background:'white',borderRadius:'12px',padding:'12px 20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',borderLeft:'4px solid #f59e0b'}}><span style={{color:'#6b7280',fontSize:'13px'}}>Total : </span><span style={{fontWeight:'700',color:'#f59e0b',fontSize:'18px'}}>{total.toLocaleString()} FCFA</span></div>
      </div>
      {showForm && (
        <div style={{background:'white',borderRadius:'12px',padding:'24px',marginBottom:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
          <h3>Nouvelle dépense</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            <div><label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Immeuble *</label><select value={form.immeuble_id} onChange={e => setForm({ ...form, immeuble_id: e.target.value })} style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px'}}><option value="">Choisir</option>{immeubles.map(i => <option key={i.id} value={i.id}>{i.nom}</option>)}</select></div>
            <div><label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Catégorie</label><select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })} style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px'}}><option value="">Choisir</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Montant (FCFA) *</label><input type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box'}} placeholder="25000"/></div>
            <div><label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Date</label><input type="date" value={form.date_depense} onChange={e => setForm({ ...form, date_depense: e.target.value })} style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box'}}/></div>
            <div style={{gridColumn:'1 / -1'}}><label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Description</label><input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box'}} placeholder="Ex: Réparation fuite"/></div>
          </div>
          <div style={{display:'flex',gap:'10px',marginTop:'20px'}}><button onClick={handleSubmit} style={{background:'#10b981',color:'white',border:'none',borderRadius:'8px',padding:'10px 24px',cursor:'pointer',fontWeight:'600'}}>Enregistrer</button><button onClick={() => setShowForm(false)} style={{background:'#e5e7eb',color:'#374151',border:'none',borderRadius:'8px',padding:'10px 24px',cursor:'pointer'}}>Annuler</button></div>
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        {depensesFiltrees.map(dep => (
          <div key={dep.id} style={{background:'white',borderRadius:'12px',padding:'16px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
            <div>
              <div style={{fontWeight:'600',color:'#1a1a2e'}}>{dep.categorie || 'Dépense'}</div>
              <div style={{fontSize:'13px',color:'#6b7280'}}>🏢 {dep.immeubles?.nom} — {new Date(dep.date_depense).toLocaleDateString('fr-FR')}</div>
              {dep.description && <div style={{fontSize:'13px',color:'#6b7280'}}>{dep.description}</div>}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <span style={{fontWeight:'700',color:'#f59e0b',fontSize:'18px'}}>{dep.montant?.toLocaleString()} FCFA</span>
              <button onClick={() => handleDelete(dep.id)} style={{background:'#fef2f2',color:'#ef4444',border:'none',borderRadius:'8px',padding:'8px 12px',cursor:'pointer'}}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
