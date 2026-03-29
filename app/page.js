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
  if (!c.traitements || c.traitements.length === 0) return "🟢";

  const now = new Date();

  const actif = c.traitements.find(t => new Date(t.fin) >= now);

  if (!actif) return "🟢";

  return "🟡";
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
  const [nouveau, setNouveau] = useState({
    id:"", sexe:"", naissance:"", lot:"Couveuse",
    poids:"", mere:"", pere:""
  });

  const [selection, setSelection] = useState([]);

  useEffect(()=>{
    const data = localStorage.getItem("elevage");
    if(data) setChevreaux(JSON.parse(data));
  },[]);

  useEffect(()=>{
    localStorage.setItem("elevage", JSON.stringify(chevreaux));
  },[chevreaux]);

  // ===== AJOUT =====

  const ajouterChevreau = () => {
    if (!nouveau.id) return;

    setChevreaux([...chevreaux,{
      ...nouveau,
      poids: nouveau.poids ? parseFloat(nouveau.poids) : null,
      pesees: [],
      traitements:[]
    }]);

    setNouveau({
      id:"", sexe:"", naissance:"", lot:"Couveuse",
      poids:"", mere:"", pere:""
    });
  };

  // ===== PESEE =====

  const ajouterPesee = (i) => {
    const poids = prompt("Poids (kg) ?");
    if (!poids) return;

    const dateInput = prompt("Date (YYYY-MM-DD) ?");
    const date = dateInput ? new Date(dateInput) : new Date();

    const copy = [...chevreaux];
    copy[i].poids = parseFloat(poids);

    if(!copy[i].pesees) copy[i].pesees=[];
    copy[i].pesees.push({
      date,
      poids: parseFloat(poids)
    });

    setChevreaux(copy);
  };

  // ===== TRAITEMENT COMPLET =====

  const ajouterTraitement = (i) => {
    const produit = prompt("Produit ?");
    if (!produit) return;

    const posologie = prompt("Posologie ?");
    const voie = prompt("Voie ?");
    const frequence = prompt("Fréquence ?");
    const fin = prompt("Date fin (YYYY-MM-DD) ?");

    const copy = [...chevreaux];

    if(!copy[i].traitements) copy[i].traitements=[];

    copy[i].traitements.push({
      produit,
      posologie,
      voie,
      frequence,
      fin
    });

    setChevreaux(copy);
  };

  const getTraitementInfo = (c) => {
    if (!c.traitements || c.traitements.length === 0) return "";

    return c.traitements.map(t =>
      `${t.produit} | ${t.posologie} | ${t.voie} | ${t.frequence} | fin: ${t.fin}`
    ).join("\n");
  };

  // ===== UI =====

  return (
    <div className="p-4 grid gap-4">

      <h1 className="text-2xl font-bold">Gestion élevage</h1>

      {/* AJOUT */}
      <div className="border p-3">
        <h2>Ajouter</h2>

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

        <button onClick={ajouterChevreau}>➕ Ajouter</button>
      </div>

      {/* TABLEAU */}
      <div>

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
            className="grid grid-cols-10 gap-2 border p-2 mb-1"
            title={getTraitementInfo(c)}
          >

            <div style={{
              backgroundColor: couleurCollier(c.id),
              color:"white"
            }}>
              #{c.id}
            </div>

            <div>{c.sexe}</div>
            <div>{ageJours(c.naissance)} j</div>
            <div>{c.lot}</div>

            <div>
              {c.poids !== null ? c.poids.toFixed(2) : "-"} kg
            </div>

            <div>{statutPesee(c)}</div>
            <div>{statutTraitement(c)}</div>
            <div>{c.mere || "-"}</div>
            <div>{c.pere || "-"}</div>

            <div className="flex gap-1">
              <button onClick={()=>ajouterPesee(i)}>⚖️</button>
              <button onClick={()=>ajouterTraitement(i)}>💊</button>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}