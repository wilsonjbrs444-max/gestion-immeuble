import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
export default function Locataires() {
  const [locataires, setLocataires] = useState([]);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nom:'', telephone:'', email:'', date_entree:'', date_echeance:'', montant_loyer:'', caution:'', date_fin_bail:'', index_eau_initial:'0', studio_id:'' });
  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    setLoading(true);
    const { data: std } = await supabase.from('studios').select('*, immeubles(nom)').order('numero');
    const { data: loc } = await supabase.from('locataires').select('*, studios(numero, immeubles(nom))').eq('actif', true).order('nom');
    setStudios(std || []);
    setLocataires(loc || []);
    setLoading(false);
  };
  const handleSubmit = async () => {
    if (!form.nom) return alert('Nom obligatoire');
    if (!form.studio_id) return alert('Studio obligatoire');
    setSaving(true);
    let photo_url = editItem?.photo_url || null;
    if (photoFile) {
      const fileName = `${Date.now()}-${photoFile.name}`;
      const { error: uploadError } = await supabase.storage.from('photo').upload(fileName, photoFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('photo').getPublicUrl(fileName);
        photo_url = urlData.publicUrl;
      }
    }
    const payload = {
      nom: form.nom,
      telephone: form.telephone || null,
      email: form.email || null,
      date_entree: form.date_entree || null,
      date_echeance: form.date_echeance ? parseInt(form.date_echeance) : null,
      montant_loyer: form.montant_loyer ? parseFloat(form.montant_loyer) : null,
      caution: form.caution ? parseFloat(form.caution) : null,
      date_fin_bail: form.date_fin_bail || null,
      index_eau_initial: form.index_eau_initial ? parseFloat(form.index_eau_initial) : 0,
      index_eau_actuel: form.index_eau_initial ? parseFloat(form.index_eau_initial) : 0,
      studio_id: form.studio_id,
      photo_url,
      actif: true
    };
    if (editItem) {
      await supabase.from('locataires').update(payload).eq('id', editItem.id);
    } else {
      const { error } = await supabase.from('locataires').insert(payload);
      if (error) { alert('Erreur: ' + error.message); setSaving(false); return; }
      await supabase.from('studios').update({ statut: 'occupé' }).eq('id', form.studio_id);
    }
    setForm({ nom:'', telephone:'', email:'', date_entree:'', date_echeance:'', montant_loyer:'', caution:'', date_fin_bail:'', index_eau_initial:'0', studio_id:'' });
    setPhotoFile(null);
    setShowForm(false);
    setEditItem(null);
    setSaving(false);
    await fetchData();
  };
  const handleDepart = async (loc) => {
    if (!window.confirm('Confirmer le départ de ' + loc.nom + ' ?')) return;
    await supabase.from('locataires').update({ actif: false }).eq('id', loc.id);
    await supabase.from('studios').update({ statut: 'libre' }).eq('id', loc.studio_id);
    fetchData();
  };
  if (loading) return <div style={{textAlign:'center',padding:'40px',fontSize:'18px'}}>⏳ Chargement...</div>;
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <h2 style={{color:'#1a1a2e',margin:0}}>👥 Locataires ({locataires.length})</h2>
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm({ nom:'', telephone:'', email:'', date_entree:'', date_echeance:'', montant_loyer:'', caution:'', date_fin_bail:'', index_eau_initial:'0', studio_id:'' }); }} style={{background:'#0f3460',color:'white',border:'none',borderRadius:'8px',padding:'10px 20px',cursor:'pointer',fontWeight:'600',fontSize:'16px'}}>+ Ajouter</button>
      </div>
      {showForm && (
        <div style={{background:'white',borderRadius:'12px',padding:'24px',marginBottom:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
          <h3 style={{marginBottom:'20px'}}>{editItem ? 'Modifier locataire' : 'Nouveau locataire'}</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            <div><label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Nom complet *</label><input type="text" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} placeholder="Jean Dupont" style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box'}}/></div>
            <div><label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Téléphone</label><input type="tel" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} placeholder="6XXXXXXXX" style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box'}}/></div>
            <div><label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jean@email.com" style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box'}}/></div>
            <div><label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Date d'entrée</label><input type="date" value={form.date_entree} onChange={e => setForm({...form, date_entree: e.target.value})} style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box'}}/></div>
            <div><label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Jour d'échéance (1-31)</label><input type="number" min="1" max="31" value={form.date_echeance} onChange={e => setForm({...form, date_echeance: e.target.value})} placeholder="1" style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box'}}/></div>
            <div><label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Loyer mensuel (FCFA)</label><input type="number" value={form.montant_loyer} onChange={e => setForm({...form, montant_loyer: e.target.value})} placeholder="50000" style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box'}}/></div>
            <div><label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Caution (FCFA)</label><input type="number" value={form.caution} onChange={e => setForm({...form, caution: e.target.value})} placeholder="50000" style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box'}}/></div>
            <div><label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Date fin bail</label><input type="date" value={form.date_fin_bail} onChange={e => setForm({...form, date_fin_bail: e.target.value})} style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box'}}/></div>
            <div><label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Index eau initial</label><input type="number" value={form.index_eau_initial} onChange={e => setForm({...form, index_eau_initial: e.target.value})} placeholder="0" style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box'}}/></div>
            <div><label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Studio *</label><select value={form.studio_id} onChange={e => setForm({...form, studio_id: e.target.value})} style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px'}}><option value="">-- Choisir un studio --</option>{studios.map(s => <option key={s.id} value={s.id}>{s.immeubles?.nom} — Studio {s.numero} ({s.statut})</option>)}</select></div>
            <div><label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>Photo</label><input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} style={{width:'100%',padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px',boxSizing:'border-box'}}/></div>
          </div>
          <div style={{display:'flex',gap:'10px',marginTop:'20px'}}>
            <button onClick={handleSubmit} disabled={saving} style={{background:saving?'#9ca3af':'#10b981',color:'white',border:'none',borderRadius:'8px',padding:'12px 28px',cursor:'pointer',fontWeight:'600',fontSize:'15px'}}>{saving ? '⏳ Enregistrement...' : '✅ Enregistrer'}</button>
            <button onClick={() => { setShowForm(false); setEditItem(null); }} style={{background:'#e5e7eb',color:'#374151',border:'none',borderRadius:'8px',padding:'12px 24px',cursor:'pointer',fontSize:'15px'}}>Annuler</button>
          </div>
        </div>
      )}
      {locataires.length === 0 ? (
        <div style={{textAlign:'center',padding:'60px',background:'white',borderRadius:'12px',color:'#6b7280'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>👥</div>
          <p style={{fontSize:'18px'}}>Aucun locataire enregistré.</p>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'16px'}}>
          {locataires.map(loc => (
            <div key={loc.id} style={{background:'white',borderRadius:'12px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}>
                {loc.photo_url ? <img src={loc.photo_url} alt={loc.nom} style={{width:'52px',height:'52px',borderRadius:'50%',objectFit:'cover'}}/> : <div style={{width:'52px',height:'52px',borderRadius:'50%',background:'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>👤</div>}
                <div>
                  <h3 style={{margin:0,color:'#1a1a2e',fontSize:'16px'}}>{loc.nom}</h3>
                  <p style={{margin:0,color:'#6b7280',fontSize:'13px'}}>🚪 Studio {loc.studios?.numero} — {loc.studios?.immeubles?.nom}</p>
                </div>
              </div>
              <div style={{fontSize:'13px',color:'#6b7280',marginBottom:'16px'}}>
                {loc.telephone && <p style={{margin:'4px 0'}}>📞 {loc.telephone}</p>}
                {loc.email && <p style={{margin:'4px 0'}}>✉️ {loc.email}</p>}
                <p style={{margin:'4px 0'}}>💰 {loc.montant_loyer?.toLocaleString()} FCFA/mois</p>
                <p style={{margin:'4px 0'}}>📅 Échéance : jour {loc.date_echeance}</p>
              </div>
              <div style={{display:'flex',gap:'8px'}}>
                <button onClick={() => { setEditItem(loc); setForm({ nom:loc.nom||'', telephone:loc.telephone||'', email:loc.email||'', date_entree:loc.date_entree||'', date_echeance:loc.date_echeance||'', montant_loyer:loc.montant_loyer||'', caution:loc.caution||'', date_fin_bail:loc.date_fin_bail||'', index_eau_initial:loc.index_eau_initial||'0', studio_id:loc.studio_id||'' }); setShowForm(true); }} style={{flex:1,background:'#eff6ff',color:'#3b82f6',border:'none',borderRadius:'8px',padding:'8px',cursor:'pointer',fontWeight:'600',fontSize:'13px'}}>✏️ Modifier</button>
                <button onClick={() => handleDepart(loc)} style={{flex:1,background:'#fef2f2',color:'#ef4444',border:'none',borderRadius:'8px',padding:'8px',cursor:'pointer',fontWeight:'600',fontSize:'13px'}}>🚪 Départ</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
