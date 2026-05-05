import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
export default function Studios() {
  const [studios, setStudios] = useState([]);
  const [immeubles, setImmeubles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filtreImmeuble, setFiltreImmeuble] = useState('');
  const [form, setForm] = useState({ numero: '', statut: 'libre', immeuble_id: '' });
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: imm, error: e1 } = await supabase.from('immeubles').select('*').order('nom');
    const { data: std, error: e2 } = await supabase.from('studios').select('*, immeubles(nom)').order('numero');
    console.log('immeubles:', imm, e1);
    console.log('studios:', std, e2);
    setImmeubles(imm || []);
    setStudios(std || []);
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.numero) return setError('Numéro obligatoire');
    if (!form.immeuble_id) return setError('Immeuble obligatoire');
    const { data, error } = await supabase.from('studios').insert({
      numero: form.numero,
      statut: form.statut,
      immeuble_id: form.immeuble_id
    }).select();
    console.log('insert result:', data, error);
    if (error) return setError(error.message);
    setForm({ numero: '', statut: 'libre', immeuble_id: '' });
    setShowForm(false);
    setEditItem(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ?')) return;
    await supabase.from('studios').delete().eq('id', id);
    fetchData();
  };

  const studiosFiltres = filtreImmeuble ? studios.filter(s => s.immeuble_id === filtreImmeuble) : studios;
  const statutColor = { 'occupé': '#10b981', 'libre': '#3b82f6', 'rénovation': '#f59e0b' };
  const statutBg = { 'occupé': '#ecfdf5', 'libre': '#eff6ff', 'rénovation': '#fffbeb' };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <h2 style={{color:'#1a1a2e',margin:0}}>🚪 Studios</h2>
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm({ numero: '', statut: 'libre', immeuble_id: '' }); }} style={{background:'#0f3460',color:'white',border:'none',borderRadius:'8px',padding:'10px 20px',cursor:'pointer',fontWeight:'600'}}>+ Ajouter</button>
      </div>
      <div style={{marginBottom:'20px'}}>
        <select value={filtreImmeuble} onChange={e => setFiltreImmeuble(e.target.value)} style={{padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px'}}>
          <option value="">Tous les immeubles</option>
          {immeubles.map(i => <option key={i.id} value={i.id}>{i.nom}</option>)}
        </select>
      </div>
      {showForm && (
        <div style={{background:'white',borderRadius:'12px',padding:'24px',marginBottom:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
          <h3>{editItem ? 'Modifier' : 'Nouveau studio'}</h3>
          {error && <div style={{background:'#fee2e2',color:'#dc2626',padding:'12px',borderRadius:'8px',marginBottom:'16px'}}>{error}</div>}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
            <div>
              <label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Numéro *</label>
              <input value={form.numero} onChange={e => setForm({ ...form, numero: e.target.value })} style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box'}} placeholder="01"/>
            </div>
            <div>
              <label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Statut</label>
              <select value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })} style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px'}}>
                <option value="libre">Libre</option>
                <option value="occupé">Occupé</option>
                <option value="rénovation">En rénovation</option>
              </select>
            </div>
          </div>
          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Immeuble *</label>
            <select value={form.immeuble_id} onChange={e => setForm({ ...form, immeuble_id: e.target.value })} style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px'}}>
              <option value="">Choisir un immeuble</option>
              {immeubles.map(i => <option key={i.id} value={i.id}>{i.nom}</option>)}
            </select>
          </div>
          <div style={{display:'flex',gap:'10px'}}>
            <button onClick={handleSubmit} style={{background:'#10b981',color:'white',border:'none',borderRadius:'8px',padding:'10px 24px',cursor:'pointer',fontWeight:'600'}}>Enregistrer</button>
            <button onClick={() => { setShowForm(false); setError(''); }} style={{background:'#e5e7eb',color:'#374151',border:'none',borderRadius:'8px',padding:'10px 24px',cursor:'pointer'}}>Annuler</button>
          </div>
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'16px'}}>
        {studiosFiltres.length === 0 && <p style={{color:'#6b7280'}}>Aucun studio trouvé.</p>}
        {studiosFiltres.map(studio => (
          <div key={studio.id} style={{background:'white',borderRadius:'12px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
              <h3 style={{margin:0,color:'#1a1a2e'}}>Studio {studio.numero}</h3>
              <span style={{background:statutBg[studio.statut],color:statutColor[studio.statut],padding:'4px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:'600'}}>{studio.statut}</span>
            </div>
            <p style={{color:'#6b7280',margin:'0 0 16px',fontSize:'14px'}}>🏢 {studio.immeubles?.nom}</p>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={() => { setEditItem(studio); setForm({ numero:studio.numero, statut:studio.statut, immeuble_id:studio.immeuble_id }); setShowForm(true); }} style={{flex:1,background:'#eff6ff',color:'#3b82f6',border:'none',borderRadius:'8px',padding:'8px',cursor:'pointer',fontWeight:'600'}}>✏️</button>
              <button onClick={() => handleDelete(studio.id)} style={{flex:1,background:'#fef2f2',color:'#ef4444',border:'none',borderRadius:'8px',padding:'8px',cursor:'pointer',fontWeight:'600'}}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
