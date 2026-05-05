import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { jsPDF } from 'jspdf';
export default function Rapports() {
  const [locataires, setLocataires] = useState([]);
  const [profil, setProfil] = useState(null);
  const [moisSelectionne, setMoisSelectionne] = useState(() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`; });
  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { const { data: loc } = await supabase.from('locataires').select('*, studios(numero, immeubles(nom))').order('nom'); const { data: pro } = await supabase.from('profil').select('*').single(); setLocataires(loc||[]); setProfil(pro); };
  const exporterRapportMensuel = async () => {
    const { data: paiements } = await supabase.from('paiements_loyer').select('*, locataires(nom, montant_loyer, studios(numero))').eq('periode',moisSelectionne);
    const { data: paiementsEau } = await supabase.from('paiements_eau').select('*').eq('periode',moisSelectionne);
    const { data: depenses } = await supabase.from('depenses').select('*');
    const { data: tousLoc } = await supabase.from('locataires').select('*, studios(numero)').eq('actif',true);
    const doc = new jsPDF();
    const moisLabel = new Date(moisSelectionne+'-01').toLocaleDateString('fr-FR',{ month:'long', year:'numeric' });
    doc.setFontSize(20); doc.text('RAPPORT MENSUEL', 105, 20, { align:'center' });
    doc.setFontSize(14); doc.text(moisLabel.toUpperCase(), 105, 32, { align:'center' });
    doc.setFontSize(11); doc.text(`Propriétaire: ${profil?.nom_facturation||''}`, 20, 45); doc.line(20, 52, 190, 52);
    let y = 62;
    doc.setFontSize(13); doc.text('LOYERS REÇUS', 20, y); y += 10;
    doc.setFontSize(10);
    const loyersPaies = paiements?.map(p => p.locataire_id) || [];
    paiements?.forEach(p => { doc.text(`✓ ${p.locataires?.nom} — ${p.montant?.toLocaleString()} FCFA`, 20, y); y += 8; if (y > 270) { doc.addPage(); y = 20; } });
    const retard = tousLoc?.filter(l => !loyersPaies.includes(l.id)) || [];
    if (retard.length) { y += 4; doc.text('NON PAYÉS:', 20, y); y += 8; retard.forEach(l => { doc.text(`✗ ${l.nom} — ${l.montant_loyer?.toLocaleString()} FCFA`, 20, y); y += 8; if (y > 270) { doc.addPage(); y = 20; } }); }
    y += 4; doc.line(20, y, 190, y); y += 8;
    const loyersRecus = paiements?.reduce((s,p) => s+(p.montant||0), 0) || 0;
    const eauTotal = paiementsEau?.reduce((s,p) => s+(p.montant||0), 0) || 0;
    const depTotal = depenses?.reduce((s,d) => s+(d.montant||0), 0) || 0;
    doc.setFontSize(12);
    doc.text(`Loyers reçus: ${loyersRecus.toLocaleString()} FCFA`, 20, y); y += 10;
    doc.text(`Eau reçu: ${eauTotal.toLocaleString()} FCFA`, 20, y); y += 10;
    doc.text(`Dépenses: ${depTotal.toLocaleString()} FCFA`, 20, y); y += 10;
    doc.setFontSize(14); doc.text(`BÉNÉFICE NET: ${(loyersRecus+eauTotal-depTotal).toLocaleString()} FCFA`, 105, y+6, { align:'center' });
    doc.save(`rapport-${moisSelectionne}.pdf`);
  };
  const exporterFicheLocataire = async (loc) => {
    const { data: pl } = await supabase.from('paiements_loyer').select('*').eq('locataire_id',loc.id).order('periode',{ ascending:false });
    const { data: pe } = await supabase.from('paiements_eau').select('*').eq('locataire_id',loc.id).order('periode',{ ascending:false });
    const doc = new jsPDF();
    doc.setFontSize(20); doc.text('FICHE LOCATAIRE', 105, 20, { align:'center' });
    doc.setFontSize(12); doc.text(`Nom: ${loc.nom}`, 20, 40); doc.text(`Tél: ${loc.telephone||'-'}`, 20, 50); doc.text(`Studio: ${loc.studios?.numero} — ${loc.studios?.immeubles?.nom}`, 20, 60); doc.text(`Loyer: ${loc.montant_loyer?.toLocaleString()} FCFA`, 20, 70); doc.text(`Caution: ${loc.caution?.toLocaleString()||'-'} FCFA`, 20, 80); doc.line(20, 88, 190, 88);
    let y = 98;
    doc.setFontSize(13); doc.text('HISTORIQUE LOYERS', 20, y); y += 10;
    doc.setFontSize(10); pl?.forEach(p => { doc.text(`${p.periode} — ${p.montant?.toLocaleString()} FCFA — ${p.mode_paiement}`, 20, y); y += 8; if (y > 270) { doc.addPage(); y = 20; } });
    y += 6; doc.setFontSize(13); doc.text('HISTORIQUE EAU', 20, y); y += 10;
    doc.setFontSize(10); pe?.forEach(p => { doc.text(`${p.periode} — ${p.consommation} m³ — ${p.montant?.toLocaleString()} FCFA`, 20, y); y += 8; if (y > 270) { doc.addPage(); y = 20; } });
    doc.save(`fiche-${loc.nom}.pdf`);
  };
  return (
    <div>
      <h2 style={{color:'#1a1a2e',marginBottom:'24px'}}>📄 Rapports & Exports</h2>
      <div style={{background:'white',borderRadius:'12px',padding:'24px',marginBottom:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
        <h3 style={{marginBottom:'16px'}}>📊 Rapport mensuel</h3>
        <div style={{display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
          <input type="month" value={moisSelectionne} onChange={e => setMoisSelectionne(e.target.value)} style={{padding:'10px',border:'2px solid #e5e7eb',borderRadius:'8px'}}/>
          <button onClick={exporterRapportMensuel} style={{background:'#0f3460',color:'white',border:'none',borderRadius:'8px',padding:'10px 24px',cursor:'pointer',fontWeight:'600'}}>📥 Exporter PDF</button>
        </div>
      </div>
      <div style={{background:'white',borderRadius:'12px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
        <h3 style={{marginBottom:'16px'}}>👥 Fiches individuelles</h3>
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {locataires.map(loc => (
            <div key={loc.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px',background:'#f9fafb',borderRadius:'8px',flexWrap:'wrap',gap:'8px'}}>
              <div><span style={{fontWeight:'600',color:'#1a1a2e'}}>{loc.nom}</span><span style={{color:'#6b7280',fontSize:'13px',marginLeft:'8px'}}>Studio {loc.studios?.numero} — {loc.actif?'✅ Actif':'❌ Parti'}</span></div>
              <button onClick={() => exporterFicheLocataire(loc)} style={{background:'#eff6ff',color:'#3b82f6',border:'none',borderRadius:'8px',padding:'8px 16px',cursor:'pointer',fontWeight:'600',fontSize:'13px'}}>📥 Exporter fiche</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
