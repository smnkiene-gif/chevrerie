"use client";

import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

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

  if (diff > 7) return "🔴";
  if (diff >= 6) return "🟡";
  return "🟢";
}

function couleurCollier(id) {
  if (!/^[1-9][0-9]?$/.test(id)) return { bg:null, text:"black" };

  const couleurs = {
    1:"red",2:"blue",3:"green",4:"yellow",
    5:"orange",6:"purple",7:"pink",8:"brown",
    9:"black",10:"gray",11:"cyan",12:"magenta",
    13:"lime",14:"teal",15:"gold",16:"navy"
  };

  const bg = couleurs[parseInt(id)] || "lightgray";
  const dark = ["black","blue","purple","brown","navy","green"];

  return { bg, text: dark.includes(bg) ? "white" : "black" };
}

// ===== RATIONS =====

function rationLait(age) {
  if (age <= 3) return { l:1, repas:3 };
  if (age <= 7) return { l:1, repas:2 };
  if (age <= 15) return { l:1.5, repas:2 };
  if (age <= 45) return { l:2.5, repas:2 };
  return { l:1, repas:1 };
}

function rationGrain(age) {
  if (age < 30) return { type:"poignee" };
  if (age < 60) return { mais:75, luzerne:25, tourteau:25 };
  if (age < 90) return { mais:150, luzerne:50, tourteau:50 };
  if (age < 120) return { mais:200, luzerne:100, tourteau:75 };
  if (age < 150) return { mais:225, luzerne:150, tourteau:75 };
  if (age < 180) return { mais:275, luzerne:175, tourteau:75 };
  if (age < 210) return { mais:300, luzerne:200, tourteau:75 };
  return { mais:325, luzerne:225, tourteau:75 };
}

// ===== APP =====

export default function App() {

  const [chevreaux, setChevreaux] = useState([]);
  const [fiche, setFiche] = useState(null);
  const [tri, setTri] = useState("");

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
      traitements: [],
      vecoxan:null
    }]);

    setNouveau({
      id:"", sexe:"", naissance:"", lot:"Couveuse",
      poids:"", mere:"", pere:""
    });
  };

  const ajouterPesee = (i) => {
    const poids = prompt("Poids ?");
    if (!poids) return;

    const dateInput = prompt("Date YYYY-MM-DD ?");
    const date = dateInput ? new Date(dateInput) : new Date();

    const copy = [...chevreaux];
    copy[i].poids = parseFloat(poids);

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

    copy[i].traitements.push({ produit, debut:now, fin });

    setChevreaux(copy);
  };

  const ajouterVecoxan = (i) => {
    const now = new Date();
    const fin = new Date(now.getTime() + 21*86400000);

    const copy = [...chevreaux];
    copy[i].vecoxan = { debut:now, fin };

    setChevreaux(copy);
  };

  // ===== TRI =====

  let liste = [...chevreaux];

  if (tri==="poids") liste.sort((a,b)=>(a.poids||0)-(b.poids||0));
  if (tri==="age") liste.sort((a,b)=>ageJours(a.naissance)-ageJours(b.naissance));

  // ===== LOTS =====

  const lots = {};
  chevreaux.forEach(c=>{
    if(!lots[c.lot]) lots[c.lot]=[];
    lots[c.lot].push(c);
  });

  // ===== LAIT =====

  let totalLait = 0;
  let totalPoudre = 0;

  const lait = Object.entries(lots).map(([lot,list])=>{
    let l = 0;
    list.forEach(c=>{
      l += rationLait(ageJours(c.naissance)).l;
    });

    totalLait += l;
    totalPoudre += l*0.16;

    return { lot, l, poudre:l*0.16 };
  });

  // ===== GRAIN =====

  const grain = Object.entries(lots).map(([lot,list])=>{
    const maxAge = Math.max(...list.map(c=>ageJours(c.naissance)));
    const r = rationGrain(maxAge);

    if (r.type==="poignee") return { lot, type:"poignee" };

    return {
      lot,
      mais:r.mais*list.length,
      luzerne:r.luzerne*list.length,
      tourteau:r.tourteau*list.length
    };
  });

  return (
    <div className="p-4 grid gap-4">

      <h1>🐐 Gestion élevage PRO MAX</h1>

      {/* AJOUT */}
      <div className="border p-2">
        <input placeholder="ID"
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

        <button onClick={ajouterChevreau}>Ajouter</button>
      </div>

      {/* TRI */}
      <div>
        <button onClick={()=>setTri("poids")}>Tri poids</button>
        <button onClick={()=>setTri("age")}>Tri âge</button>
      </div>

      {/* TABLEAU */}
      {liste.map((c,i)=>{
        const col = couleurCollier(c.id);

        return (
          <div key={i} className="border p-2 grid grid-cols-8">

            <div
              style={{backgroundColor:col.bg,color:col.text}}
              onClick={()=>setFiche(c)}
            >
              #{c.id}
            </div>

            <div>{c.sexe}</div>
            <div>{ageJours(c.naissance)} j</div>
            <div>{c.lot}</div>
            <div>{c.poids ? c.poids.toFixed(2) : "-"}</div>
            <div>{c.mere}</div>
            <div>{c.pere}</div>

            <div>
              <button onClick={()=>ajouterPesee(i)}>⚖️</button>
              <button onClick={()=>ajouterTraitement(i)}>💊</button>
              <button onClick={()=>ajouterVecoxan(i)}>V</button>
            </div>

          </div>
        );
      })}

      {/* LAIT */}
      <div>
        <h2>🍼 Lait</h2>
        {lait.map(l=>(
          <div key={l.lot}>
            {l.lot} : {l.l.toFixed(1)} L + {l.poudre.toFixed(2)} kg
          </div>
        ))}
        <b>Total : {totalLait.toFixed(1)} L + {totalPoudre.toFixed(2)} kg</b>
      </div>

      {/* GRAIN */}
      <div>
        <h2>🌽 Grain</h2>
        {grain.map(g=>(
          <div key={g.lot}>
            {g.type==="poignee"
              ? `${g.lot} : poignée`
              : `${g.lot} : ${g.mais}g maïs / ${g.luzerne}g / ${g.tourteau}g`
            }
          </div>
        ))}
      </div>

      {/* FICHE */}
      {fiche && (
        <div className="border p-3">
          <h2>Fiche #{fiche.id}</h2>

          <LineChart width={300} height={200} data={[
            ...(fiche.pesees||[]).map(p=>({
              jour: ageJours(p.date),
              poids: p.poids
            })),
            {jour:0,poids:3},
            {jour:60,poids:14}
          ]}>
            <XAxis dataKey="jour"/>
            <YAxis/>
            <Tooltip/>
            <Line dataKey="poids"/>
          </LineChart>

          <button onClick={()=>setFiche(null)}>Fermer</button>
        </div>
      )}

    </div>
  );
}