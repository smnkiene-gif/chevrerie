"use client";

import React, { useState, useEffect } from "react";

// ===== OUTILS =====

function ageJours(date) {
  if (!date) return 0;
  return Math.floor((new Date() - new Date(date)) / (1000*60*60*24));
}

function statutPesee(c) {
  if (!c.pesees || c.pesees.length === 0) return "🟡";

  const last = new Date(c.pesees[c.pesees.length - 1].date);
  const now = new Date();
  const diff = (now - last) / (1000*60*60*24);

  if (diff >= 8) return "🔴";
  if (diff >= 7) return "🟡";
  return "🟢";
}

function statutTraitement(c) {
  if (!c.traitements || !c.traitements.vecoxan) return "🟡";

  const now = new Date();
  const d = new Date(c.traitements.vecoxan.prochaine);

  if (d < now) return "🔴";
  if (d.toDateString() === now.toDateString()) return "🟡";
  return "🟢";
}

function couleurCollier(id) {
  const couleurs = {
    1:"red",2:"blue",3:"green",4:"yellow",
    5:"orange",6:"purple",7:"pink",8:"brown",
    9:"black",10:"gray",11:"cyan",12:"magenta",
    13:"lime",14:"teal",15:"gold",16:"navy"
  };
  return couleurs[parseInt(id)] || null;
}

// ===== APP =====

export default function App() {

  const [chevreaux, setChevreaux] = useState([]);
  const [vue, setVue] = useState("global");

  const [nouveau, setNouveau] = useState({
    id:"", sexe:"", naissance:"", lot:"Couveuse",
    poids:"", mere:"", pere:""
  });

  const [selection, setSelection] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(()=>{
    const data = localStorage.getItem("elevage");
    if(data) setChevreaux(JSON.parse(data));
  },[]);

  useEffect(()=>{
    localStorage.setItem("elevage", JSON.stringify(chevreaux));
  },[chevreaux]);

  // ===== ACTIONS =====

  const ajouterChevreau = () => {
    if (!nouveau.id) return;

    if (editIndex !== null) {
      const copy = [...chevreaux];
      copy[editIndex] = {
        ...copy[editIndex],
        ...nouveau
      };
      setChevreaux(copy);
      setEditIndex(null);
    } else {
      setChevreaux([...chevreaux,{
        ...nouveau,
        poids: nouveau.poids ? parseFloat(nouveau.poids) : null,
        pesees: nouveau.poids ? [{date:new Date(), poids:parseFloat(nouveau.poids)}] : [],
        traitements:{}
      }]);
    }

    setNouveau({
      id:"", sexe:"", naissance:"", lot:"Couveuse",
      poids:"", mere:"", pere:""
    });
  };

  const ajouterPesee = (i) => {
    const poids = prompt("Poids ?");
    if (!poids) return;

    const dateInput = prompt("Date (YYYY-MM-DD) ou vide = aujourd’hui");
    const date = dateInput ? new Date(dateInput) : new Date();

    const copy = [...chevreaux];
    copy[i].poids = parseFloat(poids);

    if(!copy[i].pesees) copy[i].pesees=[];
    copy[i].pesees.push({date, poids:parseFloat(poids)});

    setChevreaux(copy);
  };

  const traiter = () => {
    const copy = [...chevreaux];
    const now = new Date();

    selection.forEach(i=>{
      if(!copy[i].traitements) copy[i].traitements={};
      copy[i].traitements.vecoxan = {
        derniere: now,
        prochaine: new Date(now.getTime()+21*86400000)
      };
    });

    setChevreaux(copy);
    setSelection([]);
  };

  const toggleSelect = (i)=>{
    setSelection(selection.includes(i)
      ? selection.filter(x=>x!==i)
      : [...selection,i]);
  };

  const chargerEdition = (i)=>{
    setNouveau({...chevreaux[i]});
    setEditIndex(i);
  };

  // ===== ALERTES =====

  const aFaire = chevreaux.map((c,i)=>{
    if (statutPesee(c)!=="🟢" || statutTraitement(c)!=="🟢") {
      return {c,i};
    }
    return null;
  }).filter(Boolean);

  // ===== UI =====

  return (
    <div className="p-4 grid gap-4">

      <h1 className="text-2xl font-bold">Gestion élevage</h1>

      {/* NAV */}
      <div className="flex gap-2">
        <button onClick={()=>setVue("global")}>Global</button>
        <button onClick={()=>setVue("alertes")}>🟡 À faire</button>
      </div>

      {/* FORMULAIRE */}
      <div className="border p-3">
        <h2>{editIndex !== null ? "Modifier" : "Ajouter"} un chevreau</h2>

        <input placeholder="Numéro"
          value={nouveau.id}
          onChange={(e)=>setNouveau({...nouveau,id:e.target.value})}
        />

        <select
          value={nouveau.sexe}
          onChange={(e)=>setNouveau({...nouveau,sexe:e.target.value})}
        >
          <option value="">Sexe</option>
          <option value="M">Mâle</option>
          <option value="F">Femelle</option>
        </select>

        <input type="date"
          value={nouveau.naissance}
          onChange={(e)=>setNouveau({...nouveau,naissance:e.target.value})}
        />

        <input placeholder="Lot"
          value={nouveau.lot}
          onChange={(e)=>setNouveau({...nouveau,lot:e.target.value})}
        />

        <input placeholder="Poids"
          value={nouveau.poids}
          onChange={(e)=>setNouveau({...nouveau,poids:e.target.value})}
        />

        <input placeholder="Mère"
          value={nouveau.mere}
          onChange={(e)=>setNouveau({...nouveau,mere:e.target.value})}
        />

        <input placeholder="Père"
          value={nouveau.pere}
          onChange={(e)=>setNouveau({...nouveau,pere:e.target.value})}
        />

        <button onClick={ajouterChevreau}>
          {editIndex !== null ? "💾 Modifier" : "➕ Ajouter"}
        </button>
      </div>

      {/* ===== VUE GLOBAL ===== */}

      {vue==="global" && (
        <div>

          {/* ENTÊTES */}
          <div className="grid grid-cols-10 gap-2 font-bold border-b pb-1">
            <div>ID</div>
            <div>Sexe</div>
            <div>Âge</div>
            <div>Lot</div>
            <div>Poids</div>
            <div>Pesée</div>
            <div>Traitement</div>
            <div>Mère</div>
            <div>Père</div>
            <div>Actions</div>
          </div>

          {chevreaux.map((c,i)=>(
            <div key={i}
              className={`grid grid-cols-10 gap-2 border p-2 mb-1 ${selection.includes(i)?"bg-blue-100":""}`}
            >

              <div style={{backgroundColor:couleurCollier(c.id),color:"white"}}>
                #{c.id}
              </div>

              <div>{c.sexe}</div>
              <div>{ageJours(c.naissance)} j</div>
              <div>{c.lot}</div>
              <div>{c.poids ? c.poids.toFixed(2) : "-"}</div>
              <div>{statutPesee(c)}</div>
              <div>{statutTraitement(c)}</div>
              <div>{c.mere || "-"}</div>
              <div>{c.pere || "-"}</div>

              <div className="flex gap-1">
                <button onClick={()=>ajouterPesee(i)}>⚖️</button>
                <button onClick={()=>chargerEdition(i)}>✏️</button>
                <button onClick={()=>toggleSelect(i)}>✔️</button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ===== ALERTES ===== */}

      {vue==="alertes" && (
        <div>
          <h2>🟡 À faire aujourd’hui</h2>

          {aFaire.length === 0 && <div>Rien à faire 👍</div>}

          {aFaire.map(({c,i})=>(
            <div key={i} className="border p-2 mb-1">
              <strong>#{c.id}</strong> - {c.lot}
              <div>Pesée : {statutPesee(c)}</div>
              <div>Traitement : {statutTraitement(c)}</div>

              <button onClick={()=>ajouterPesee(i)}>Peser</button>
              <button onClick={()=>{
                setSelection([i]);
                traiter();
              }}>Traiter</button>
            </div>
          ))}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex gap-2">
        <button onClick={traiter}>💊 Traiter sélection</button>
      </div>

    </div>
  );
}