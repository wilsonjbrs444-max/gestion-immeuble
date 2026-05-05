import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { jsPDF } from 'jspdf';
const PRIX_M3 = 500;
export default function Eau() {
  const [locataires, setLocataires] = useState([]);
  const [factures, setFactures] = useState([]);
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nouvelIndex, setNouvelIndex] = useState({});
  const [moisSelectionne, setMoisSelectionne] = useState(() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`; });
  useEffect(() => { fetchData(); }, [moisSelectionne]);
  const fetchData = async () => { setLoading(true); const { data: loc } = await supabase.from('locataires').select('*, studios(numero, immeubles(nom))').eq('actif',true).order('nom'); const { data: fac } = await supabase.from('factures_eau').select('*').eq('periode',moisSelectionne); const { data: pro } = await supabase.from('profil').select('*').single(); setLocataires(loc||[]); setFactures(fac||[]); setProfil(pro); setLoading(false); };
  const getFacture = (id) => factures.find(f => f.locataire_id === id);
  const handleGenererFacture = async (loc) => {
    const newIndex = parseFloat(nouvelIndex[loc.id]);
    if (!newIndex) return alert('Entrez le nouvel index');
    const indexAncien = loc.index_eau_actuel || loc.index_eau_initial || 0;
    if (newIndex <= indexAncien) return alert('Index invalide');
    const consommation = newIndex - indexAncien;
    const montant = consommation * PRIX_M3;
    const { data } = await supabase.from('factures_eau').insert({ locataire_id:loc.id, index_ancien:indexAncien, index_nouveau:newIndex, consommation, montant, periode:moisSelectionne, statut:'en attente' }).select().single();
    await supabase.from('locataires').update({ index_eau_actuel:newIndex }).eq('id',loc.id);
    if (data) { const doc = new jsPDF(); doc.setFontSize(20); doc.text("FACTURE D'EAU", 105, 20, { align:'center' }); doc.setFontSize(12); doc.text(`Propriétaire: ${profil?.nom_facturation||''}`, 20, 40); doc.text(`Locataire: ${loc.nom}`, 20, 55); doc.text(`Studio: ${loc.studios?.numero}`, 20, 65); doc.text(`Période: ${moisSelectionne}`, 20, 75); doc.text(`Index ancien: ${indexAncien} m³`, 20, 90); doc.text(`Index nouveau: ${newIndex} m³`, 20, 100); doc.text(`Consommation: ${consommation} m³`, 20, 110); doc.text(`Prix: ${PRIX_M3} FCFA/m³`, 20, 120); doc.setFontSize(16); doc.text(`TOTAL: ${montant.toLocaleString()} FCFA`, 105, 140, { align:'center' }); if (profil?.numero_orange_money) doc.text(`Orange Money: ${profil.numero_orange_money}`, 20, 160); if (profil?.numero_wave) doc.text(`Wave: ${profil.numero_wave}`, 20, 170); doc.save(`facture-eau-${loc.nom}-${moisSelectionne}.pdf`); }
    setNouvelIndex({ ...nouvelIndex, [loc.id]:'' }); fetchData();
  };
  const handlePayerEau = async (loc, facture) => {
    await supabase.from('factures_eau').update({ statut:'payé' }).eq('id',facture.id);
    await supabase.from('paiements_eau').insert({ locataire_id:loc.id, index_ancien:facture.index_ancien, index_nouveau:facture.index_nouveau, consommation:facture.consommation, montant:facture.montant, date_paiement:new Date().toISOString().split('T')[0], periode:moisSelectionne, statut:'payé' });
    const doc = new jsPDF(); doc.setFontSize(20); doc.text('REÇU PAIEMENT EAU', 105, 20, { align:'center' }); doc.setFontSize(12); doc.text(`Locataire: ${loc.nom}`, 20, 40); doc.text(`Consommation: ${facture.consommation} m³`, 20, 55); doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 65); doc.setFontSize(16); doc.text(`MONTANT: ${facture.montant?.toLocaleString()} FCFA`, 105, 85, { align:'center' }); doc.save(`recu-eau-${loc.nom}-${moisSelectionne}.pdf`);
    fetchData();
  };
  if (loading) return <div style={{textAlign:'center',padding:'40px'}}>Chargement...</div>;
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px',flexWrap:'wrap',gap:'12px'}}>
        <h2 style={{color:'#1a1a2e',margin:0}}>💧 Gestion Eau</h2>
        <input type="month" value={moisSelectionne} onChange={e => setMoisSelectionne(e.target.value)} style={{padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px'}}/>
      </div>
      <div style={{background:'#eff6ff',borderRadius:'12px',padding:'16px',marginBottom:'24px'}}><p style={{margin:0,color:'#1d4ed8',fontWeight:'600'}}>💡 Prix du m³ : {PRIX_M3} FCFA</p></div>
      <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
        {locataires.map(loc => { const facture = getFacture(loc.id); const indexActuel = loc.index_eau_actuel || loc.index_eau_initial || 0; return (
          <div key={loc.id} style={{background:'white',borderRadius:'12px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',borderLeft:`4px solid ${facture?.statut==='payé'?'#10b981':facture?'#f59e0b':'#3b82f6'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'12px'}}>
              <div>
                <h3 style={{margin:'0 0 4px',color:'#1a1a2e'}}>{loc.nom}</h3>
                <p style={{margin:'0 0 8px',color:'#6b7280',fontSize:'13px'}}>Studio {loc.studios?.numero} — {loc.studios?.immeubles?.nom}</p>
                <p style={{margin:0,color:'#6b7280',fontSize:'13px'}}>Index actuel : <strong>{indexActuel} m³</strong></p>
                {facture && <div style={{marginTop:'8px',fontSize:'13px',color:facture.statut==='payé'?'#10b981':'#f59e0b',fontWeight:'600'}}>{facture.statut==='payé'?'✅ Payé':'⏳ En attente'} — {facture.montant?.toLocaleString()} FCFA ({facture.consommation} m³)</div>}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'8px',minWidth:'220px'}}>
                {!facture && <div style={{display:'flex',gap:'8px'}}><input type="number" placeholder="Nouvel index" value={nouvelIndex[loc.id]||''} onChange={e => setNouvelIndex({ ...nouvelIndex, [loc.id]:e.target.value })} style={{flex:1,padding:'8px',border:'2px solid #e5e7eb',borderRadius:'8px',fontSize:'13px'}}/><button onClick={() => handleGenererFacture(loc)} style={{background:'#3b82f6',color:'white',border:'none',borderRadius:'8px',padding:'8px 12px',cursor:'pointer',fontWeight:'600',fontSize:'13px'}}>📄 Facturer</button></div>}
                {facture && facture.statut !== 'payé' && <button onClick={() => handlePayerEau(loc, facture)} style={{background:'#10b981',color:'white',border:'none',borderRadius:'8px',padding:'8px 16px',cursor:'pointer',fontWeight:'600',fontSize:'13px'}}>✅ Confirmer paiement eau</button>}
              </div>
            </div>
          </div>
        ); })}
      </div>
    </div>
  );
}
