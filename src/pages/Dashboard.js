import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
export default function Dashboard() {
  const [stats, setStats] = useState({ totalStudios:0, studiosOccupes:0, studiosLibres:0, loyersRecus:0, loyersManquants:0, totalLocataires:0, depensesTotales:0 });
  const [retardataires, setRetardataires] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchStats(); }, []);
  const fetchStats = async () => {
    try {
      const now = new Date();
      const moisActuel = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
      const { data: studios } = await supabase.from('studios').select('*');
      const { data: locataires } = await supabase.from('locataires').select('*, studios(numero)').eq('actif',true);
      const { data: paiements } = await supabase.from('paiements_loyer').select('*').eq('periode',moisActuel);
      const { data: depenses } = await supabase.from('depenses').select('*');
      const totalStudios = studios?.length||0;
      const studiosOccupes = studios?.filter(s=>s.statut==='occupé').length||0;
      const studiosLibres = studios?.filter(s=>s.statut==='libre').length||0;
      const loyersRecus = paiements?.reduce((sum,p)=>sum+(p.montant||0),0)||0;
      const totalLoyers = locataires?.reduce((sum,l)=>sum+(l.montant_loyer||0),0)||0;
      const locatairesPaies = paiements?.map(p=>p.locataire_id)||[];
      const retard = locataires?.filter(l=>!locatairesPaies.includes(l.id))||[];
      const depensesTotales = depenses?.reduce((sum,d)=>sum+(d.montant||0),0)||0;
      setStats({ totalStudios, studiosOccupes, studiosLibres, loyersRecus, loyersManquants:Math.max(0,totalLoyers-loyersRecus), totalLocataires:locataires?.length||0, depensesTotales });
      setRetardataires(retard);
    } catch(e) { console.error(e); }
    setLoading(false);
  };
  if (loading) return <div style={{textAlign:'center',padding:'40px'}}>Chargement...</div>;
  return (
    <div>
      <h2 style={{marginBottom:'24px',color:'#1a1a2e'}}>📊 Tableau de bord — {new Date().toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'16px',marginBottom:'24px'}}>
        {[{label:'Studios total',value:stats.totalStudios,icon:'🏢',color:'#3b82f6'},{label:'Occupés',value:stats.studiosOccupes,icon:'✅',color:'#10b981'},{label:'Libres',value:stats.studiosLibres,icon:'🔓',color:'#f59e0b'},{label:'Locataires',value:stats.totalLocataires,icon:'👥',color:'#8b5cf6'}].map((card,i)=>(
          <div key={i} style={{background:'white',borderRadius:'12px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',borderLeft:`4px solid ${card.color}`}}>
            <div style={{fontSize:'28px',marginBottom:'8px'}}>{card.icon}</div>
            <div style={{fontSize:'28px',fontWeight:'700',color:card.color}}>{card.value}</div>
            <div style={{color:'#6b7280',fontSize:'14px'}}>{card.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'16px',marginBottom:'24px'}}>
        <div style={{background:'white',borderRadius:'12px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',borderLeft:'4px solid #10b981'}}><div style={{fontSize:'24px',marginBottom:'8px'}}>💰</div><div style={{fontSize:'24px',fontWeight:'700',color:'#10b981'}}>{stats.loyersRecus.toLocaleString()} FCFA</div><div style={{color:'#6b7280',fontSize:'14px'}}>Loyers reçus ce mois</div></div>
        <div style={{background:'white',borderRadius:'12px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',borderLeft:'4px solid #ef4444'}}><div style={{fontSize:'24px',marginBottom:'8px'}}>⏳</div><div style={{fontSize:'24px',fontWeight:'700',color:'#ef4444'}}>{stats.loyersManquants.toLocaleString()} FCFA</div><div style={{color:'#6b7280',fontSize:'14px'}}>Loyers manquants</div></div>
        <div style={{background:'white',borderRadius:'12px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',borderLeft:'4px solid #f59e0b'}}><div style={{fontSize:'24px',marginBottom:'8px'}}>🔧</div><div style={{fontSize:'24px',fontWeight:'700',color:'#f59e0b'}}>{stats.depensesTotales.toLocaleString()} FCFA</div><div style={{color:'#6b7280',fontSize:'14px'}}>Dépenses totales</div></div>
        <div style={{background:'white',borderRadius:'12px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',borderLeft:'4px solid #8b5cf6'}}><div style={{fontSize:'24px',marginBottom:'8px'}}>📈</div><div style={{fontSize:'24px',fontWeight:'700',color:'#8b5cf6'}}>{(stats.loyersRecus-stats.depensesTotales).toLocaleString()} FCFA</div><div style={{color:'#6b7280',fontSize:'14px'}}>Bénéfice net</div></div>
      </div>
      {retardataires.length>0 && (
        <div style={{background:'white',borderRadius:'12px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
          <h3 style={{color:'#ef4444',marginBottom:'16px'}}>⚠️ Locataires en retard ({retardataires.length})</h3>
          {retardataires.map((l,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px',background:'#fef2f2',borderRadius:'8px',marginBottom:'8px',borderLeft:'4px solid #ef4444'}}>
              <div><div style={{fontWeight:'600',color:'#1a1a2e'}}>{l.nom}</div><div style={{fontSize:'13px',color:'#6b7280'}}>Studio {l.studios?.numero}</div></div>
              <div style={{fontWeight:'700',color:'#ef4444'}}>{l.montant_loyer?.toLocaleString()} FCFA</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
