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

function statutVecoxan(c) {
  if (!c.vecoxan) return "🟢";

  const now = new Date();
  const fin = new Date(c.vecoxan.fin);

  return fin >= now ? "🔴" : "🟢";
}

function statutTraitements(c) {
  if (!c.traitements || c.traitements.length === 0) return "🟢";

  const now = new Date();

  const actif = c.traitements.find(t => new Date(t.fin) >= now);

  return actif ? "🔴" : "🟢";
}

function couleurCollier(id) {
  // UNIQUEMENT 1 à 99 SANS ZERO DEVANT
  if (!/^[1-9][0-9]?$/.test(id)) return null;

  const couleurs = {
    1:"red",2:"blue",3:"green",4:"yellow",
    5:"orange",6:"purple",7:"pink",8:"brown",
    9:"black",10:"gray",11:"cyan",12:"magenta",
    13:"lime",14:"teal",15:"gold",16:"navy"
  };

  return couleurs[parseInt(id)] || "lightgray";
}

// ===== APP =====

export default function App() {

  const [chevreaux, setChevreaux] = useState([]);
  const [selection, setSelection] = useState([]);
  const [fiche, setFiche] = useState(null);

  const [nouveau, setNouveau] = useState({
    id:"", sexe:"", naissance:"", lot:"Couveuse",
    poids:"", mere:"", pere:""
  });

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

    setChevreaux([...chevreaux,{
      ...nouveau,
      poids: nouveau.poids ? parseFloat(nouveau.poids) : null,
      pesees: [],
      traitements: []
    }]);

    setNouveau({
      id:"", sexe:"", naissance:"", lot:"Couveuse",
      poids:"", mere:"", pere:""
    });
  };

  const toggleSelect = (i) => {
    setSelection(selection.includes(i)
      ? selection.filter(x => x !== i)
      : [...selection, i]);
  };

  const ajouterPesee = (i) => {
    const poids = prompt("Poids ?");
    if (!poids) return;

    const dateInput = prompt("Date YYYY-MM-DD ?");
    const date = dateInput ? new Date(dateInput) : new Date();

    const copy = [...chevreaux];
    copy[i].poids = parseFloat(poids);

    if (!copy[i].pesees) copy[i].pesees = [];
    copy[i].pesees.push({ date, poids: parseFloat(poids) });

    setChevreaux(copy);
  };

  const ajouterTraitement = (i) => {
    const produit = prompt("Produit ?");
    if (!produit) return;

    const duree = prompt("Durée (jours) ?");
    const now = new Date();
    const fin = new Date(now.getTime() + duree*86400000);

    const copy = [...chevreaux];

    copy[i].traitements.push({
      produit,
      debut: now,
      fin
    });

    setChevreaux(copy);
  };

  const ajouterVecoxan = (i) => {
    const duree = 1; // traitement court
    const now = new Date();
    const fin = new Date(now.getTime() + duree*86400000);

    const copy = [...chevreaux];

    copy[i].vecoxan = {
      debut: now,
      fin
    };

    setChevreaux(copy);
  };

  // ===== UI =====

  return (
    <div className="p-4 grid gap-4">

      <h1 className="text-2xl font-bold">Gestion élevage</h1>

      {/* FORMULAIRE */}
      <div className="border p-3">
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

        <button onClick={ajouterChevreau}>➕</button>
      </div>

      {/* TABLEAU */}
      <div>

        <div className="grid grid-cols-11 gap-2 font-bold border-b">
          <div>ID</div>
          <div>Sexe</div>
          <div>Âge</div>
          <div>Lot</div>
          <div>Poids</div>
          <div>Pesée</div>
          <div>Vecoxan</div>
          <div>Traitements</div>
          <div>Mère</div>
          <div>Père</div>
          <div>Actions</div>
        </div>

        {chevreaux.map((c,i)=>(
          <div key={i}
            className={`grid grid-cols-11 gap-2 border p-2 ${selection.includes(i)?"bg-blue-100":""}`}
          >

            <div
              style={{backgroundColor: couleurCollier(c.id), color:"white"}}
              onClick={()=>setFiche(c)}
            >
              #{c.id}
            </div>

            <div>{c.sexe}</div>
            <div>{ageJours(c.naissance)} j</div>
            <div>{c.lot}</div>
            <div>{c.poids ? c.poids.toFixed(2) : "-"}</div>
            <div>{statutPesee(c)}</div>
            <div>{statutVecoxan(c)}</div>
            <div>{statutTraitements(c)}</div>
            <div>{c.mere}</div>
            <div>{c.pere}</div>

            <div className="flex gap-1">
              <button onClick={()=>toggleSelect(i)}>✔️</button>
              <button onClick={()=>ajouterPesee(i)}>⚖️</button>
              <button onClick={()=>ajouterTraitement(i)}>💊</button>
              <button onClick={()=>ajouterVecoxan(i)}>V</button>
            </div>

          </div>
        ))}

      </div>

      {/* FICHE */}
      {fiche && (
        <div className="border p-3">
          <h2>Fiche #{fiche.id}</h2>
          <div>Âge : {ageJours(fiche.naissance)} jours</div>
          <div>Lot : {fiche.lot}</div>
          <div>Mère : {fiche.mere}</div>
          <div>Père : {fiche.pere}</div>
          <div>Poids : {fiche.poids}</div>

          <h3>Traitements</h3>
          {fiche.traitements.map((t,i)=>(
            <div key={i}>
              {t.produit} jusqu’au {new Date(t.fin).toLocaleDateString()}
            </div>
          ))}

          <button onClick={()=>setFiche(null)}>Fermer</button>
        </div>
      )}

    </div>
  );
}