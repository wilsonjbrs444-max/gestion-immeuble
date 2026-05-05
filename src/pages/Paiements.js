import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { jsPDF } from 'jspdf';
export default function Paiements() {
  const [locataires, setLocataires] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moisSelectionne, setMoisSelectionne] = useState(() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`; });
  const [modePaiement, setModePaiement] = useState({});
  useEffect(() => { fetchData(); }, [moisSelectionne]);
  const fetchData = async () => { setLoading(true); const { data: loc } = await supabase.from('locataires').select('*, studios(numero, immeubles(nom))').eq('actif',true).order('nom'); const { data: pai } = await supabase.from('paiements_loyer').select('*').eq('periode',moisSelectionne); const { data: pro } = await supabase.from('profil').select('*').single(); setLocataires(loc||[]); setPaiements(pai||[]); setProfil(pro); setLoading(false); };
  const estPaye = (id) => paiements.find(p => p.locataire_id === id);
  const handlePayer = async (loc) => {
    const mode = modePaiement[loc.id] || 'Cash';
    const { data } = await supabase.from('paiements_loyer').insert({ locataire_id:loc.id, montant:loc.montant_loyer, mode_paiement:mode, date_paiement:new Date().toISOString().split('T')[0], periode:moisSelectionne, statut:'payé' }).select().single();
    if (data) { const doc = new jsPDF(); doc.setFontSize(20); doc.text('REÇU DE PAIEMENT', 105, 20, { align:'center' }); doc.setFontSize(12); doc.text(`Propriétaire: ${profil?.nom_facturation||''}`, 20, 40); doc.text(`Locataire: ${loc.nom}`, 20, 55); doc.text(`Studio: ${loc.studios?.numero} — ${loc.studios?.immeubles?.nom}`, 20, 65); doc.text(`Période: ${moisSelectionne}`, 20, 75); doc.text(`Mode: ${mode}`, 20, 85); doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 95); doc.setFontSize(16); doc.text(`MONTANT: ${loc.montant_loyer?.toLocaleString()} FCFA`, 105, 115, { align:'center' }); if (profil?.numero_orange_money) doc.text(`Orange Money: ${profil.numero_orange_money}`, 20, 140); if (profil?.numero_wave) doc.text(`Wave: ${profil.numero_wave}`, 20, 150); doc.save(`recu-loyer-${loc.nom}-${moisSelectionne}.pdf`); }
    fetchData();
  };
  const handleAnnuler = async (locataireId) => { if (!window.confirm('Annuler ce paiement ?')) return; await supabase.from('paiements_loyer').delete().eq('locataire_id',locataireId).eq('periode',moisSelectionne); fetchData(); };
  if (loading) return <div style={{textAlign:'center',padding:'40px'}}>Chargement...</div>;
  const totalRecu = paiements.reduce((sum,p) => sum+(p.montant||0), 0);
  const totalAttendu = locataires.reduce((sum,l) => sum+(l.montant_loyer||0), 0);
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px',flexWrap:'wrap',gap:'12px'}}>
        <h2 style={{color:'#1a1a2e',margin:0}}>💰 Paiements Loyer</h2>
        <input type="month" value={moisSelectionne} onChange={e => setMoisSelectionne(e.target.value)} style={{padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px'}}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'16px',marginBottom:'24px'}}>
        <div style={{background:'white',borderRadius:'12px',padding:'16px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',borderLeft:'4px solid #10b981'}}><div style={{fontSize:'20px',fontWeight:'700',color:'#10b981'}}>{totalRecu.toLocaleString()} FCFA</div><div style={{color:'#6b7280',fontSize:'13px'}}>Reçu</div></div>
        <div style={{background:'white',borderRadius:'12px',padding:'16px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',borderLeft:'4px solid #ef4444'}}><div style={{fontSize:'20px',fontWeight:'700',color:'#ef4444'}}>{(totalAttendu-totalRecu).toLocaleString()} FCFA</div><div style={{color:'#6b7280',fontSize:'13px'}}>Manquant</div></div>
        <div style={{background:'white',borderRadius:'12px',padding:'16px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',borderLeft:'4px solid #3b82f6'}}><div style={{fontSize:'20px',fontWeight:'700',color:'#3b82f6'}}>{paiements.length}/{locataires.length}</div><div style={{color:'#6b7280',fontSize:'13px'}}>Payés</div></div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        {locataires.map(loc => { const paye = estPaye(loc.id); return (
          <div key={loc.id} style={{background:'white',borderRadius:'12px',padding:'16px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',borderLeft:`4px solid ${paye?'#10b981':'#ef4444'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                {loc.photo_url ? <img src={loc.photo_url} alt={loc.nom} style={{width:'44px',height:'44px',borderRadius:'50%',objectFit:'cover'}}/> : <div style={{width:'44px',height:'44px',borderRadius:'50%',background:'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center'}}>👤</div>}
                <div>
                  <div style={{fontWeight:'600',color:'#1a1a2e'}}>{loc.nom}</div>
                  <div style={{fontSize:'13px',color:'#6b7280'}}>Studio {loc.studios?.numero} — {loc.montant_loyer?.toLocaleString()} FCFA</div>
                  {paye && <div style={{fontSize:'12px',color:'#10b981'}}>✅ Payé le {new Date(paye.date_paiement).toLocaleDateString('fr-FR')} — {paye.mode_paiement}</div>}
                  {!paye && <div style={{fontSize:'12px',color:'#ef4444'}}>⚠️ Non payé</div>}
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
                {!paye && <select value={modePaiement[loc.id]||'Cash'} onChange={e => setModePaiement({ ...modePaiement, [loc.id]: e.target.value })} style={{padding:'8px',border:'2px solid #e5e7eb',borderRadius:'8px',fontSize:'13px'}}><option>Cash</option><option>Orange Money</option><option>Wave</option><option>Virement</option></select>}
                {!paye ? <button onClick={() => handlePayer(loc)} style={{background:'#10b981',color:'white',border:'none',borderRadius:'8px',padding:'8px 16px',cursor:'pointer',fontWeight:'600',fontSize:'13px'}}>✅ Confirmer</button> : <button onClick={() => handleAnnuler(loc.id)} style={{background:'#fef2f2',color:'#ef4444',border:'none',borderRadius:'8px',padding:'8px 16px',cursor:'pointer',fontSize:'13px'}}>❌ Annuler</button>}
              </div>
            </div>
          </div>
        ); })}
      </div>
    </div>
  );
}
