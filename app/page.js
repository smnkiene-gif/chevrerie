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
  return diff <= 7 ? "🟢" : "🔴";
}

function statutTraitement(c) {
  const t = c.traitements && c.traitements.vecoxan;
  if (!t) return "🟡";
  const now = new Date();
  const d = new Date(t.prochaine);
  if (d.toDateString() === now.toDateString()) return "🟡";
  if (d < now) return "🔴";
  return "🟢";
}

function couleurCollier(id) {
  const couleurs = {
    1: "red", 2: "blue", 3: "green", 4: "yellow",
    5: "orange", 6: "purple", 7: "pink", 8: "brown",
    9: "black", 10: "gray", 11: "cyan", 12: "magenta",
    13: "lime", 14: "teal", 15: "gold", 16: "navy"
  };
  return couleurs[parseInt(id)] || null;
}

// ===== APP =====

export default function App() {
  const [chevreaux, setChevreaux] = useState([]);

  const [nouveau, setNouveau] = useState({
    id: "",
    sexe: "",
    naissance: "",
    lot: "Couveuse",
    poids: "",
    mere: "",
    pere: ""
  });

  const [selection, setSelection] = useState([]);
  const [filtreLot, setFiltreLot] = useState("");
  const [tri, setTri] = useState("");

  useEffect(() => {
    const data = localStorage.getItem("elevage");
    if (data) setChevreaux(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem("elevage", JSON.stringify(chevreaux));
  }, [chevreaux]);

  // ===== ACTIONS =====

  const ajouterChevreau = () => {
    if (!nouveau.id) return;

    setChevreaux([
      ...chevreaux,
      {
        ...nouveau,
        poids: nouveau.poids ? parseFloat(nouveau.poids) : null,
        pesees: nouveau.poids
          ? [{ date: new Date(), poids: parseFloat(nouveau.poids) }]
          : [],
        traitements: {}
      }
    ]);

    setNouveau({
      id: "",
      sexe: "",
      naissance: "",
      lot: "Couveuse",
      poids: "",
      mere: "",
      pere: ""
    });
  };

  const ajouterPesee = (i, poids) => {
    if (!poids) return;
    const copy = [...chevreaux];
    copy[i].poids = parseFloat(poids);
    if (!copy[i].pesees) copy[i].pesees = [];
    copy[i].pesees.push({ date: new Date(), poids: parseFloat(poids) });
    setChevreaux(copy);
  };

  const toggleSelect = (i) => {
    setSelection(selection.includes(i)
      ? selection.filter(x => x !== i)
      : [...selection, i]
    );
  };

  const changerLot = (lot) => {
    const copy = [...chevreaux];
    selection.forEach(i => copy[i].lot = lot);
    setChevreaux(copy);
    setSelection([]);
  };

  const traiter = () => {
    const copy = [...chevreaux];
    const now = new Date();
    selection.forEach(i => {
      if (!copy[i].traitements) copy[i].traitements = {};
      copy[i].traitements.vecoxan = {
        derniere: now,
        prochaine: new Date(now.getTime() + 21*86400000)
      };
    });
    setChevreaux(copy);
    setSelection([]);
  };

  // ===== FILTRES =====

  let liste = [...chevreaux];

  if (filtreLot) {
    liste = liste.filter(c => c.lot === filtreLot);
  }

  if (tri === "poids") {
    liste.sort((a,b) => (a.poids||0)-(b.poids||0));
  }

  const lots = [...new Set(chevreaux.map(c => c.lot))];

  // ===== UI =====

  return (
    <div className="p-4 grid gap-4">

      <h1 className="text-2xl font-bold">Gestion élevage</h1>

      {/* AJOUT */}
      <div className="border p-3">
        <h2>Ajouter un chevreau</h2>

        <input placeholder="Numéro"
          value={nouveau.id}
          onChange={(e)=>setNouveau({...nouveau, id: e.target.value})}
        />

        <select
          value={nouveau.sexe}
          onChange={(e)=>setNouveau({...nouveau, sexe: e.target.value})}
        >
          <option value="">Sexe</option>
          <option value="M">Mâle</option>
          <option value="F">Femelle</option>
        </select>

        <input type="date"
          value={nouveau.naissance}
          onChange={(e)=>setNouveau({...nouveau, naissance: e.target.value})}
        />

        <input placeholder="Lot"
          value={nouveau.lot}
          onChange={(e)=>setNouveau({...nouveau, lot: e.target.value})}
        />

        <input placeholder="Poids naissance"
          value={nouveau.poids}
          onChange={(e)=>setNouveau({...nouveau, poids: e.target.value})}
        />

        <input placeholder="Mère"
          value={nouveau.mere}
          onChange={(e)=>setNouveau({...nouveau, mere: e.target.value})}
        />

        <input placeholder="Père"
          value={nouveau.pere}
          onChange={(e)=>setNouveau({...nouveau, pere: e.target.value})}
        />

        <button onClick={ajouterChevreau}>➕ Ajouter</button>
      </div>

      {/* FILTRES */}
      <div className="flex gap-2">
        <select onChange={(e)=>setFiltreLot(e.target.value)}>
          <option value="">Tous lots</option>
          {lots.map(l => <option key={l}>{l}</option>)}
        </select>

        <button onClick={()=>setTri("poids")}>Trier poids</button>
      </div>

      {/* TABLEAU */}
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
          <div>Action</div>
        </div>

        <div className="p-2">
          {liste.map((c,i)=>(
            <div key={i}
              className={`grid grid-cols-10 gap-2 p-2 border mb-1 ${selection.includes(i)?"bg-blue-100":""}`}
              onClick={()=>toggleSelect(i)}
            >

              <div style={{
                backgroundColor: couleurCollier(c.id),
                color: "white",
                padding: "4px",
                borderRadius: "4px"
              }}>
                #{c.id}
              </div>

              <div>{c.sexe}</div>
              <div>{ageJours(c.naissance)} j</div>
              <div>{c.lot}</div>

              <div>
                {c.poids ? parseFloat(c.poids).toFixed(2) : "-"} kg
              </div>

              <div>{statutPesee(c)}</div>
              <div>{statutTraitement(c)}</div>
              <div>{c.mere || "-"}</div>
              <div>{c.pere || "-"}</div>

              <input
                placeholder="Poids"
                onBlur={(e)=>ajouterPesee(i,e.target.value)}
              />

            </div>
          ))}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-2">
        <button onClick={traiter}>Traiter Vecoxan</button>
        <button onClick={()=>changerLot("Nurserie 1")}>Lot N1</button>
        <button onClick={()=>changerLot("Nurserie 2")}>Lot N2</button>
      </div>

    </div>
  );
}