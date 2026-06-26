import { useState, useEffect } from "react";

const DEFAULT_SITES = [
  { id: "yard", name: "Entrepôt Principal", type: "yard" },
  { id: "hitachi", name: "Hitachi", type: "site" },
  { id: "sartelon", name: "Sartelon", type: "site" },
  { id: "abb", name: "ABB", type: "site" },
  { id: "franklin", name: "Franklin", type: "site" },
  { id: "molson", name: "Molson", type: "site" },
];

const DEFAULT_FORM_TYPES = [
  { key: "feller", label: "Cage à Feller", group: "feller", unit: "unité" },
  { key: "dock2", label: "2 Dock", group: "dock", unit: "pi.li." },
  { key: "dock3", label: "3 Dock", group: "dock", unit: "pi.li." },
  { key: "dock4", label: "4 Dock", group: "dock", unit: "pi.li." },
  { key: "dock5", label: "5 Dock", group: "dock", unit: "pi.li." },
  { key: "dock6", label: "6 Dock", group: "dock", unit: "pi.li." },
  { key: "dock7", label: "7 Dock", group: "dock", unit: "pi.li." },
  { key: "braise", label: "Cage à Braise", group: "braise", unit: "unité" },
  { key: "footing", label: "Cage à Footing", group: "footing", unit: "unité" },
  { key: "plywood", label: "Cage à Plywood Double", group: "plywood", unit: "unité" },
  { key: "grosfeller", label: "Cage à Gros Feller", group: "feller", unit: "unité" },
  { key: "boutte", label: "Cage à Boutte", group: null, unit: "unité" },
  { key: "braiselongue", label: "Cage à Braise longue", group: null, unit: "unité" },
  { key: "crampe", label: "Cage à crampe", group: null, unit: "unité" },
];

const UNIT_OPTIONS = [
  { value: "unité", label: "Unité" },
  { value: "pi.li.", label: "Pied linéaire" },
];

const DEFAULT_GROUPS = [
  { id: "feller", label: "Feller" },
  { id: "dock", label: "Dock" },
  { id: "braise", label: "Braise" },
  { id: "footing", label: "Footing" },
  { id: "plywood", label: "Plywood" },
];

const C = {
  bg: "#080d1a", surface: "#0d1528", card: "#111e36",
  border: "#1e3158", accent: "#f26522", accentGlow: "#f2652240",
  text: "#e6edf8", muted: "#5a7aaa", mutedLight: "#8aa4cc",
  green: "#2ecc8a", red: "#f05f5f", blue: "#3b82f6",
  blueDim: "#1e3a6e", navy: "#0a1628",
};

const STORAGE_KEY = "beliveau_duraform_v5";

// Editable text — click to rename
function EditableLabel({ value, onChange, style = {}, placeholder = "" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const commit = () => {
    if (draft.trim()) onChange(draft.trim());
    setEditing(false);
  };
  if (editing) return (
    <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={commit} onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
      placeholder={placeholder}
      style={{ fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit", background: C.surface, border: `1px solid ${C.accent}`, borderRadius: 6, color: C.text, padding: "3px 8px", outline: "none", boxShadow: `0 0 0 2px ${C.accentGlow}`, width: "100%", ...style }}
    />
  );
  return (
    <span onClick={() => { setDraft(value); setEditing(true); }} title="Cliquer pour renommer"
      style={{ cursor: "pointer", borderRadius: 5, padding: "2px 4px", border: "1px solid transparent", transition: "all 0.15s", display: "inline-block", ...style }}
      onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${C.border}`; e.currentTarget.style.background = C.surface; }}
      onMouseLeave={e => { e.currentTarget.style.border = "1px solid transparent"; e.currentTarget.style.background = "transparent"; }}
    >{value}</span>
  );
}

// Editable number — click to edit
function EditableCell({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const commit = () => { onChange(Math.max(0, parseInt(draft, 10) || 0)); setEditing(false); };
  if (editing) return (
    <input autoFocus type="number" min={0} value={draft}
      onChange={e => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
      style={{ width: 64, textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 600, background: C.surface, border: `1px solid ${C.accent}`, borderRadius: 6, color: C.text, padding: "4px 6px", outline: "none", boxShadow: `0 0 0 2px ${C.accentGlow}` }}
    />
  );
  return (
    <span onClick={() => { setDraft(value); setEditing(true); }} title="Cliquer pour modifier"
      style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 600, color: value > 0 ? C.text : C.border, cursor: "pointer", padding: "4px 8px", borderRadius: 6, border: "1px solid transparent", transition: "all 0.15s", display: "inline-block", minWidth: 36, textAlign: "center" }}
      onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${C.border}`; e.currentTarget.style.background = C.surface; }}
      onMouseLeave={e => { e.currentTarget.style.border = "1px solid transparent"; e.currentTarget.style.background = "transparent"; }}
    >{value}</span>
  );
}

export default function App() {
  const [sites, setSites] = useState(DEFAULT_SITES);
  const [formTypes, setFormTypes] = useState(DEFAULT_FORM_TYPES);
  const [groups, setGroups] = useState(DEFAULT_GROUPS);
  const [activeGroup, setActiveGroup] = useState("all");
  const [inventory, setInventory] = useState(() => Object.fromEntries(DEFAULT_SITES.map(s => [s.id, Object.fromEntries(DEFAULT_FORM_TYPES.map(f => [f.key, 0]))])));
  const [movements, setMovements] = useState([]);
  const [view, setView] = useState("dashboard");
  const [editMode, setEditMode] = useState(false);
  const [transfer, setTransfer] = useState(false);
  const [txForm, setTxForm] = useState({ from: "yard", to: "hitachi", items: {}, date: new Date().toISOString().slice(0, 10), note: "" });
  const [saveMsg, setSaveMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null); // {type: 'site'|'form'|'group'|'team'|'assignment', id, label}
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // Teams
  const [teams, setTeams] = useState([]); // {id, name, members: [string]}
  const [assignments, setAssignments] = useState([]); // {id, teamId, siteId, startDate, endDate}
  const [addingTeam, setAddingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [assigningTeam, setAssigningTeam] = useState(null); // teamId being assigned, or null
  const [assignForm, setAssignForm] = useState({ siteId: "", startDate: new Date().toISOString().slice(0, 10), endDate: "" });
  const [memberDraft, setMemberDraft] = useState({}); // {teamId: "new member name"}

  const emptyInv = (fts = formTypes) => Object.fromEntries(fts.map(f => [f.key, 0]));

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.sites) setSites(d.sites);
        if (d.formTypes) setFormTypes(d.formTypes);
        if (d.groups) setGroups(d.groups);
        if (d.inventory) setInventory(d.inventory);
        if (d.movements) setMovements(d.movements);
        if (d.teams) setTeams(d.teams);
        if (d.assignments) setAssignments(d.assignments);
      }
    } catch (e) {}
  }, []);

  // Auto-save
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ sites, formTypes, groups, inventory, movements, teams, assignments })); } catch (e) {}
  }, [sites, formTypes, groups, inventory, movements, teams, assignments]);

  const totalByType = key => Object.values(inventory).reduce((s, inv) => s + (inv[key] || 0), 0);
  const siteTotal = id => formTypes.reduce((s, f) => s + (inventory[id]?.[f.key] || 0), 0);
  const grandTotal = () => sites.reduce((s, site) => s + siteTotal(site.id), 0);
  const siteName = id => sites.find(s => s.id === id)?.name || id;
  const updateCell = (siteId, key, val) => setInventory(prev => ({ ...prev, [siteId]: { ...prev[siteId], [key]: val } }));

  // Rename site
  const renameSite = (id, name) => setSites(prev => prev.map(s => s.id === id ? { ...s, name } : s));

  // Delete site (with confirmation)
  const deleteSite = (id) => {
    setSites(prev => prev.filter(s => s.id !== id));
    setInventory(prev => { const n = { ...prev }; delete n[id]; return n; });
    setConfirmDelete(null);
  };

  // Add site
  const addSite = () => {
    const id = "site_" + Date.now();
    const name = "Nouveau Chantier";
    setSites(prev => [...prev, { id, name, type: "site" }]);
    setInventory(prev => ({ ...prev, [id]: emptyInv() }));
    flash("✓ Chantier ajouté — cliquez sur le nom pour le renommer");
  };

  // Rename form type
  const renameFormType = (key, label) => setFormTypes(prev => prev.map(f => f.key === key ? { ...f, label } : f));

  // Delete form type
  const deleteFormType = (key) => {
    setFormTypes(prev => prev.filter(f => f.key !== key));
    setInventory(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      Object.keys(n).forEach(siteId => { delete n[siteId][key]; });
      return n;
    });
    setConfirmDelete(null);
  };

  // Add form type
  const addFormType = (group = groups[0]?.id || null) => {
    const key = "form_" + Date.now();
    const label = "Nouveau Type";
    setFormTypes(prev => [...prev, { key, label, group, unit: "unité" }]);
    setInventory(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      Object.keys(n).forEach(siteId => { n[siteId][key] = 0; });
      return n;
    });
    flash("✓ Type ajouté — cliquez sur le nom pour le renommer");
  };

  // Change a form type's group
  const setFormTypeGroup = (key, groupId) => setFormTypes(prev => prev.map(f => f.key === key ? { ...f, group: groupId } : f));

  // Change a form type's unit
  const setFormTypeUnit = (key, unit) => setFormTypes(prev => prev.map(f => f.key === key ? { ...f, unit } : f));

  // Add group
  const addGroup = () => {
    if (!newGroupName.trim()) return;
    const id = "group_" + Date.now();
    setGroups(prev => [...prev, { id, label: newGroupName.trim() }]);
    setNewGroupName(""); setAddingGroup(false);
    flash("✓ Groupe ajouté");
  };

  // Rename group
  const renameGroup = (id, label) => setGroups(prev => prev.map(g => g.id === id ? { ...g, label } : g));

  // Delete group — un-assigns form types (they become "Sans groupe")
  const deleteGroup = (id) => {
    setGroups(prev => prev.filter(g => g.id !== id));
    setFormTypes(prev => prev.map(f => f.group === id ? { ...f, group: null } : f));
    if (activeGroup === id) setActiveGroup("all");
    setConfirmDelete(null);
  };

  // ---- TEAMS ----

  const addTeam = () => {
    if (!newTeamName.trim()) return;
    const id = "team_" + Date.now();
    setTeams(prev => [...prev, { id, name: newTeamName.trim(), members: [] }]);
    setNewTeamName(""); setAddingTeam(false);
    flash("✓ Équipe créée");
  };

  const renameTeam = (id, name) => setTeams(prev => prev.map(t => t.id === id ? { ...t, name } : t));

  const deleteTeam = (id) => {
    setTeams(prev => prev.filter(t => t.id !== id));
    setAssignments(prev => prev.filter(a => a.teamId !== id));
    setConfirmDelete(null);
  };

  const addMember = (teamId) => {
    const name = (memberDraft[teamId] || "").trim();
    if (!name) return;
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, members: [...t.members, name] } : t));
    setMemberDraft(prev => ({ ...prev, [teamId]: "" }));
  };

  const removeMember = (teamId, idx) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, members: t.members.filter((_, i) => i !== idx) } : t));
  };

  // Assignments: a team assigned to a site for a date range
  const openAssignTeam = (teamId) => {
    setAssignForm({ siteId: sites.find(s => s.type === "site")?.id || "", startDate: new Date().toISOString().slice(0, 10), endDate: "" });
    setAssigningTeam(teamId);
  };

  const submitAssignment = () => {
    if (!assignForm.siteId) return alert("Choisis un chantier.");
    if (!assignForm.startDate) return alert("Choisis une date de début.");
    if (assignForm.endDate && assignForm.endDate < assignForm.startDate) return alert("La date de fin doit être après la date de début.");
    setAssignments(prev => [...prev, {
      id: "assign_" + Date.now(),
      teamId: assigningTeam,
      siteId: assignForm.siteId,
      startDate: assignForm.startDate,
      endDate: assignForm.endDate || null,
    }]);
    setAssigningTeam(null);
    flash("✓ Équipe assignée");
  };

  const deleteAssignment = (id) => setAssignments(prev => prev.filter(a => a.id !== id));

  const teamName = (id) => teams.find(t => t.id === id)?.name || "—";

  const todayStr = () => new Date().toISOString().slice(0, 10);

  // Status of an assignment relative to today
  const assignmentStatus = (a) => {
    const today = todayStr();
    if (a.startDate > today) return "future";
    if (a.endDate && a.endDate < today) return "past";
    return "current";
  };

  // Assignments for a given site, sorted by start date
  const assignmentsForSite = (siteId) => assignments.filter(a => a.siteId === siteId).sort((a, b) => a.startDate.localeCompare(b.startDate));

  // Export
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ sites, formTypes, groups, inventory, movements, teams, assignments, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `beliveau-duraform-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url); flash("✓ Données exportées !");
  };

  // Import
  const importData = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target.result);
        if (d.sites) setSites(d.sites);
        if (d.formTypes) setFormTypes(d.formTypes);
        if (d.groups) setGroups(d.groups);
        if (d.inventory) setInventory(d.inventory);
        if (d.movements) setMovements(d.movements);
        if (d.teams) setTeams(d.teams);
        if (d.assignments) setAssignments(d.assignments);
        flash("✓ Données importées !");
      } catch { alert("Fichier invalide."); }
    };
    reader.readAsText(file); e.target.value = "";
  };

  const flash = (msg) => { setSaveMsg(msg); setTimeout(() => setSaveMsg(""), 3000); };

  const openTransfer = () => {
    setTxForm({ from: "yard", to: sites.find(s => s.id !== "yard")?.id || sites[1]?.id, items: emptyInv(), date: new Date().toISOString().slice(0, 10), note: "" });
    setTransfer(true);
  };

  const submitTransfer = () => {
    const { from, to, items, date, note } = txForm;
    if (from === to) return alert("La source et la destination doivent être différentes.");
    const hasAny = Object.values(items).some(v => v > 0);
    if (!hasAny) return alert("Sélectionnez au moins un article.");
    for (const [key, qty] of Object.entries(items)) {
      if ((inventory[from]?.[key] || 0) < qty) return alert(`Pas assez de "${formTypes.find(f => f.key === key)?.label}" à la source.`);
    }
    setInventory(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next[to]) next[to] = emptyInv();
      for (const [key, qty] of Object.entries(items)) {
        next[from][key] = (next[from][key] || 0) - qty;
        next[to][key] = (next[to][key] || 0) + qty;
      }
      return next;
    });
    setMovements(prev => [...prev, { id: Date.now(), date, from, to, items: { ...items }, note }]);
    setTransfer(false);
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:${C.bg};}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}
    input,select{outline:none;}
    .btn{cursor:pointer;border:none;font-family:inherit;font-weight:600;border-radius:8px;transition:all 0.18s;}
    .btn:active{transform:scale(0.97);}
    .btn-accent{background:linear-gradient(135deg,${C.accent},#e05510);color:#fff;padding:10px 22px;font-size:14px;box-shadow:0 2px 12px ${C.accentGlow};}
    .btn-accent:hover{filter:brightness(1.08);box-shadow:0 4px 20px ${C.accentGlow};}
    .btn-ghost{background:transparent;color:${C.mutedLight};padding:10px 18px;font-size:14px;border:1px solid ${C.border};}
    .btn-ghost:hover{color:${C.text};border-color:${C.muted};background:${C.surface};}
    .btn-edit{background:${C.surface};color:${C.mutedLight};padding:7px 14px;font-size:13px;border:1px solid ${C.border};}
    .btn-edit.active{background:#1a2e10;color:${C.green};border-color:${C.green}40;}
    .btn-sm{padding:7px 14px;font-size:13px;}
    .btn-danger{background:#2a0a0a;color:${C.red};border:1px solid ${C.red}30;padding:7px 14px;font-size:13px;}
    .btn-danger:hover{background:#3a1010;border-color:${C.red}60;}
    .nav-tab{cursor:pointer;padding:8px 16px;border-radius:8px;font-size:14px;font-weight:500;transition:all 0.15s;color:${C.muted};background:transparent;border:none;font-family:inherit;}
    .nav-tab:hover{color:${C.text};background:${C.surface};}
    .nav-tab.active{background:${C.card};color:${C.accent};font-weight:600;border:1px solid ${C.border};}
    .card{background:${C.card};border:1px solid ${C.border};border-radius:14px;}
    .input{background:${C.surface};border:1px solid ${C.border};border-radius:8px;color:${C.text};padding:9px 13px;font-size:14px;font-family:inherit;width:100%;transition:border 0.15s;}
    .input:focus{border-color:${C.accent};box-shadow:0 0 0 2px ${C.accentGlow};}
    .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;}
    .badge-yard{background:${C.blueDim};color:#60a5fa;}
    .badge-site{background:#0d2e1e;color:${C.green};}
    .overlay{position:fixed;inset:0;background:rgba(0,5,20,0.85);backdrop-filter:blur(4px);z-index:50;display:flex;align-items:center;justify-content:center;padding:20px;}
    .modal{background:${C.card};border:1px solid ${C.border};border-radius:18px;width:100%;max-width:620px;max-height:90vh;overflow-y:auto;padding:30px;box-shadow:0 24px 80px rgba(0,0,0,0.6);}
    table{width:100%;border-collapse:collapse;}
    th{color:${C.muted};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;padding:11px 14px;text-align:left;border-bottom:1px solid ${C.border};background:${C.surface};white-space:nowrap;}
    td{padding:10px 14px;font-size:14px;border-bottom:1px solid ${C.border}20;vertical-align:middle;}
    tr:last-child td{border-bottom:none;}
    tr:hover td{background:${C.surface}30;}
    .mono{font-family:'JetBrains Mono',monospace;}
    .del-btn{opacity:0;cursor:pointer;background:none;border:none;color:${C.red};font-size:14px;padding:2px 5px;border-radius:4px;transition:all 0.15s;line-height:1;}
    .del-btn:hover{background:${C.red}20;}
    tr:hover .del-btn, .card:hover .del-btn{opacity:0.6;}
    .del-btn:hover{opacity:1!important;}
    .site-card:hover .del-btn{opacity:0.6;}
    .group-tab{cursor:pointer;padding:8px 16px;border-radius:20px;font-size:13px;font-weight:600;transition:all 0.15s;color:${C.muted};background:${C.surface};border:1px solid ${C.border};white-space:nowrap;}
    .group-tab:hover{color:${C.text};border-color:${C.muted};}
    .group-tab.active{background:${C.accent}20;color:${C.accent};border-color:${C.accent}60;}
    .group-tab-add{cursor:pointer;padding:8px 14px;border-radius:20px;font-size:13px;font-weight:600;color:${C.muted};background:transparent;border:1px dashed ${C.border};}
    .group-tab-add:hover{color:${C.text};border-color:${C.muted};}
    .group-select{background:${C.surface};border:1px solid ${C.border};border-radius:6px;color:${C.mutedLight};font-size:10px;padding:2px 4px;font-family:inherit;}
  `;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Outfit', sans-serif" }}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: C.navy, padding: "0 20px", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 66, gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ width: 38, height: 38, background: `linear-gradient(135deg, ${C.accent}, #e05510)`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: `0 2px 12px ${C.accentGlow}` }}>🧱</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.03em" }}>Fondations <span style={{ color: C.accent }}>Béliveau</span> inc.</div>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>Gestion des Duraform</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {[{ key: "dashboard", label: "Tableau de bord" }, { key: "inventory", label: "Inventaire" }, { key: "movements", label: "Mouvements" }, { key: "teams", label: "Équipes" }].map(v => (
              <button key={v.key} className={`nav-tab ${view === v.key ? "active" : ""}`} onClick={() => setView(v.key)}>{v.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
            {saveMsg && <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>{saveMsg}</span>}
            <button className="btn btn-ghost btn-sm" onClick={exportData}>💾 Exporter</button>
            <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }}>
              📂 Importer<input type="file" accept=".json" onChange={importData} style={{ display: "none" }} />
            </label>
            <button className={`btn btn-edit ${editMode ? "active" : ""}`} onClick={() => setEditMode(e => !e)}>
              {editMode ? "✓ Édition ON" : "✏️ Modifier"}
            </button>
            <button className="btn btn-accent btn-sm" onClick={openTransfer}>⇄ Transfert</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "22px 20px" }}>

        {/* Status bar */}
        <div style={{ background: "#0a1e0f", border: `1px solid ${C.green}25`, borderRadius: 10, padding: "8px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <span style={{ color: C.green }}>●</span>
          <span style={{ color: C.muted }}>Sauvegarde automatique activée.</span>
          {editMode && <span style={{ color: C.green, fontWeight: 600, marginLeft: 8 }}>✏️ Mode Édition — Cliquez sur n'importe quel nom ou chiffre pour le modifier. Survolez une carte pour supprimer.</span>}
        </div>

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>Vue d'ensemble</h2>
            </div>

            {/* Hero */}
            <div style={{ background: `linear-gradient(135deg,#0d1e40,#111e36)`, border: `1px solid ${C.accent}30`, borderRadius: 16, padding: "20px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, boxShadow: `0 0 40px ${C.accentGlow}`, flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Total Flotte</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 50, fontWeight: 600, lineHeight: 1 }}>{grandTotal()}</div>
                <div style={{ color: C.muted, fontSize: 13, marginTop: 5 }}>{formTypes.length} types · {sites.length - 1} chantiers</div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {sites.filter(s => s.type === "site").map(site => (
                  <div key={site.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 16px", minWidth: 90, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, fontWeight: 600 }}>{site.name}</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 600 }}>{siteTotal(site.id)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Site cards */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: C.mutedLight, textTransform: "uppercase", letterSpacing: "0.07em" }}>Par Chantier</h3>
              <button className="btn btn-ghost btn-sm" onClick={addSite}>+ Ajouter un chantier</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))", gap: 14 }}>
              {sites.map(site => {
                const inv = inventory[site.id] || {};
                return (
                  <div key={site.id} className="card site-card" style={{ padding: "18px 20px", position: "relative" }}>
                    {/* Delete site button — only in edit mode, only for non-yard sites */}
                    {editMode && site.type !== "yard" && (
                      <button className="del-btn" style={{ position: "absolute", top: 10, right: 10, opacity: 0.5 }}
                        onClick={() => setConfirmDelete({ type: "site", id: site.id, label: site.name })}>✕</button>
                    )}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ flex: 1, paddingRight: 28 }}>
                        {editMode
                          ? <EditableLabel value={site.name} onChange={n => renameSite(site.id, n)} style={{ fontWeight: 700, fontSize: 15 }} />
                          : <div style={{ fontWeight: 700, fontSize: 15 }}>{site.name}</div>
                        }
                        <span className={`badge badge-${site.type}`} style={{ marginTop: 5 }}>{site.type === "yard" ? "Entrepôt" : "Chantier"}</span>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 26, fontWeight: 600, color: siteTotal(site.id) > 0 ? C.text : C.muted }}>{siteTotal(site.id)}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>pcs total</div>
                      </div>
                    </div>
                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 14px" }}>
                      {formTypes.map(ft => (
                        <div key={ft.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                          <span style={{ color: C.muted, fontSize: 12 }}>{ft.label} <span style={{ fontSize: 10, opacity: 0.7 }}>({ft.unit || "unité"})</span></span>
                          {editMode
                            ? <EditableCell value={inv[ft.key] || 0} onChange={v => updateCell(site.id, ft.key, v)} />
                            : <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: inv[ft.key] > 0 ? C.text : C.border }}>{inv[ft.key] || 0}</span>
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* INVENTORY TABLE */}
        {view === "inventory" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>Inventaire Détaillé</h2>
                <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
                  {editMode ? <span style={{ color: C.green }}>✏️ Cliquez sur un nom ou un chiffre pour le modifier · ✕ pour supprimer</span> : "Activez le mode édition pour modifier"}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {editMode && <button className="btn btn-ghost btn-sm" onClick={() => addFormType(activeGroup !== "all" ? activeGroup : groups[0]?.id)}>+ Ajouter un type de forme</button>}
                <button className="btn btn-ghost btn-sm" onClick={addSite}>+ Ajouter un chantier</button>
              </div>
            </div>

            {/* Group tabs */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 18 }}>
              <button className={`group-tab ${activeGroup === "all" ? "active" : ""}`} onClick={() => setActiveGroup("all")}>Tous</button>
              {groups.map(g => (
                <div key={g.id} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                  <button className={`group-tab ${activeGroup === g.id ? "active" : ""}`} onClick={() => setActiveGroup(g.id)} style={{ paddingRight: editMode ? 26 : 16 }}>
                    {editMode ? <EditableLabel value={g.label} onChange={l => renameGroup(g.id, l)} style={{ fontSize: 13, fontWeight: 600, color: activeGroup === g.id ? C.accent : C.muted }} /> : g.label}
                  </button>
                  {editMode && (
                    <button className="del-btn" style={{ opacity: 0.5, position: "absolute", right: 6 }}
                      onClick={() => setConfirmDelete({ type: "group", id: g.id, label: g.label })}>✕</button>
                  )}
                </div>
              ))}
              {editMode && !addingGroup && (
                <button className="group-tab-add" onClick={() => setAddingGroup(true)}>+ Onglet</button>
              )}
              {editMode && addingGroup && (
                <input autoFocus className="input" style={{ width: 140, padding: "6px 12px", fontSize: 13 }}
                  placeholder="Nom du groupe" value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addGroup(); if (e.key === "Escape") { setAddingGroup(false); setNewGroupName(""); } }}
                  onBlur={() => { if (newGroupName.trim()) addGroup(); else setAddingGroup(false); }}
                />
              )}
            </div>

            <div className="card" style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ position: "sticky", left: 0, background: C.surface, zIndex: 2, minWidth: 160 }}>Chantier</th>
                    {formTypes.filter(ft => activeGroup === "all" || ft.group === activeGroup).map(ft => (
                      <th key={ft.key} style={{ textAlign: "center", minWidth: 100 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          {editMode
                            ? <EditableLabel value={ft.label} onChange={l => renameFormType(ft.key, l)} style={{ fontSize: 11, color: C.muted, fontWeight: 700, textAlign: "center" }} />
                            : <span>{ft.label}</span>
                          }
                          {!editMode && <span style={{ fontSize: 9, color: C.muted, fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>({ft.unit || "unité"})</span>}
                          {editMode && (
                            <>
                              <select className="group-select" value={ft.group || ""} onChange={e => setFormTypeGroup(ft.key, e.target.value || null)}>
                                <option value="">Sans groupe</option>
                                {groups.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                              </select>
                              <select className="group-select" value={ft.unit || "unité"} onChange={e => setFormTypeUnit(ft.key, e.target.value)}>
                                {UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                              </select>
                              <button className="del-btn" style={{ opacity: 0.5, fontSize: 11 }}
                                onClick={() => setConfirmDelete({ type: "form", id: ft.key, label: ft.label })}>✕ suppr.</button>
                            </>
                          )}
                        </div>
                      </th>
                    ))}
                    <th style={{ textAlign: "center", minWidth: 80 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map(site => {
                    const inv = inventory[site.id] || {};
                    const visibleTypes = formTypes.filter(ft => activeGroup === "all" || ft.group === activeGroup);
                    const visibleTotal = visibleTypes.reduce((s, ft) => s + (inv[ft.key] || 0), 0);
                    return (
                      <tr key={site.id}>
                        <td style={{ position: "sticky", left: 0, background: C.card, zIndex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {editMode && site.type !== "yard"
                              ? <EditableLabel value={site.name} onChange={n => renameSite(site.id, n)} style={{ fontWeight: 600 }} />
                              : <span style={{ fontWeight: 600 }}>{site.name}</span>
                            }
                            {editMode && site.type !== "yard" && (
                              <button className="del-btn" style={{ opacity: 0.4 }}
                                onClick={() => setConfirmDelete({ type: "site", id: site.id, label: site.name })}>✕</button>
                            )}
                          </div>
                          <span className={`badge badge-${site.type}`} style={{ marginTop: 4 }}>{site.type === "yard" ? "Entrepôt" : "Chantier"}</span>
                        </td>
                        {visibleTypes.map(ft => (
                          <td key={ft.key} style={{ textAlign: "center" }}>
                            {editMode
                              ? <EditableCell value={inv[ft.key] || 0} onChange={v => updateCell(site.id, ft.key, v)} />
                              : <span style={{ fontFamily: "'JetBrains Mono',monospace", color: inv[ft.key] > 0 ? C.text : C.border }}>{inv[ft.key] || 0}</span>
                            }
                          </td>
                        ))}
                        <td style={{ textAlign: "center" }}>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: C.accent }}>{activeGroup === "all" ? siteTotal(site.id) : visibleTotal}</span>
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: C.surface }}>
                    <td style={{ fontWeight: 800, color: C.accent, fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase" }}>Total Flotte</td>
                    {formTypes.filter(ft => activeGroup === "all" || ft.group === activeGroup).map(ft => (
                      <td key={ft.key} style={{ textAlign: "center" }}>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: C.accent }}>{totalByType(ft.key)}</span>
                      </td>
                    ))}
                    <td style={{ textAlign: "center" }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: C.accent, fontSize: 15 }}>
                        {activeGroup === "all" ? grandTotal() : sites.reduce((s, site) => s + formTypes.filter(ft => ft.group === activeGroup).reduce((s2, ft) => s2 + (inventory[site.id]?.[ft.key] || 0), 0), 0)}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {editMode && (
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => addFormType(activeGroup !== "all" ? activeGroup : groups[0]?.id)}>+ Ajouter un type de forme</button>
              </div>
            )}
          </div>
        )}

        {/* MOVEMENTS */}
        {view === "movements" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>Journal des Mouvements</h2>
                <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Historique de tous les transferts</p>
              </div>
              <button className="btn btn-accent btn-sm" onClick={openTransfer}>⇄ Nouveau Transfert</button>
            </div>
            <div className="card" style={{ overflow: "hidden" }}>
              <table>
                <thead><tr><th>Date</th><th>De</th><th>Vers</th><th>Articles</th><th>Note</th></tr></thead>
                <tbody>
                  {[...movements].reverse().map(m => {
                    const items = Object.entries(m.items).filter(([, v]) => v > 0);
                    return (
                      <tr key={m.id}>
                        <td><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.muted }}>{m.date}</span></td>
                        <td><span className={`badge badge-${sites.find(s => s.id === m.from)?.type || "yard"}`}>{siteName(m.from)}</span></td>
                        <td><span className={`badge badge-${sites.find(s => s.id === m.to)?.type || "site"}`}>{siteName(m.to)}</span></td>
                        <td>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {items.map(([key, qty]) => {
                              const ft = formTypes.find(f => f.key === key);
                              return (
                                <span key={key} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 9px", fontSize: 12 }}>
                                  <span style={{ fontFamily: "'JetBrains Mono',monospace", color: C.accent, fontWeight: 600 }}>{qty}</span>
                                  <span style={{ color: C.muted, marginLeft: 4 }}>{ft?.label || key} <span style={{ opacity: 0.7 }}>({ft?.unit || "unité"})</span></span>
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td style={{ color: C.muted, fontSize: 13 }}>{m.note || "—"}</td>
                      </tr>
                    );
                  })}
                  {movements.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: "center", color: C.muted, padding: "48px 20px" }}>
                      <div style={{ fontSize: 30, marginBottom: 8 }}>📋</div>
                      <div>Aucun mouvement enregistré pour l'instant.</div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TEAMS */}
        {view === "teams" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>Équipes de Travail</h2>
                <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Gère tes équipes et leurs assignations aux chantiers</p>
              </div>
              {!addingTeam && <button className="btn btn-accent btn-sm" onClick={() => setAddingTeam(true)}>+ Nouvelle Équipe</button>}
            </div>

            {addingTeam && (
              <div className="card" style={{ padding: "16px 20px", marginBottom: 18, display: "flex", gap: 10, alignItems: "center" }}>
                <input autoFocus className="input" style={{ maxWidth: 280 }} placeholder="Nom de l'équipe (ex: Équipe Jean)"
                  value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addTeam(); if (e.key === "Escape") { setAddingTeam(false); setNewTeamName(""); } }} />
                <button className="btn btn-accent btn-sm" onClick={addTeam}>Créer</button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setAddingTeam(false); setNewTeamName(""); }}>Annuler</button>
              </div>
            )}

            {teams.length === 0 && !addingTeam && (
              <div className="card" style={{ padding: "48px 20px", textAlign: "center", color: C.muted }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>👷</div>
                <div>Aucune équipe créée pour l'instant.</div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(360px,1fr))", gap: 16 }}>
              {teams.map(team => {
                const teamAssignments = assignments.filter(a => a.teamId === team.id).sort((a, b) => a.startDate.localeCompare(b.startDate));
                return (
                  <div key={team.id} className="card" style={{ padding: "20px 22px", position: "relative" }}>
                    <button className="del-btn" style={{ position: "absolute", top: 14, right: 14, opacity: 0.5 }}
                      onClick={() => setConfirmDelete({ type: "team", id: team.id, label: team.name })}>✕</button>

                    {/* Team name */}
                    <div style={{ marginBottom: 14, paddingRight: 24 }}>
                      <EditableLabel value={team.name} onChange={n => renameTeam(team.id, n)} style={{ fontWeight: 700, fontSize: 16 }} />
                    </div>

                    {/* Members */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: C.mutedLight, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Membres ({team.members.length})</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                        {team.members.map((m, idx) => (
                          <span key={idx} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "4px 10px 4px 12px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                            {m}
                            <button onClick={() => removeMember(team.id, idx)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 12, padding: 0, opacity: 0.6 }}>✕</button>
                          </span>
                        ))}
                        {team.members.length === 0 && <span style={{ color: C.muted, fontSize: 12 }}>Aucun membre ajouté</span>}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input className="input" style={{ fontSize: 13, padding: "6px 10px" }} placeholder="Nom de l'employé"
                          value={memberDraft[team.id] || ""}
                          onChange={e => setMemberDraft(prev => ({ ...prev, [team.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === "Enter") addMember(team.id); }} />
                        <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }} onClick={() => addMember(team.id)}>+ Ajouter</button>
                      </div>
                    </div>

                    {/* Assignments */}
                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ fontSize: 11, color: C.mutedLight, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Assignations</div>
                        <button className="btn btn-ghost btn-sm" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => openAssignTeam(team.id)}>+ Assigner à un chantier</button>
                      </div>
                      {teamAssignments.length === 0 && <div style={{ color: C.muted, fontSize: 12 }}>Aucune assignation.</div>}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {teamAssignments.map(a => {
                          const status = assignmentStatus(a);
                          const statusColor = status === "current" ? C.green : status === "future" ? C.blue : C.muted;
                          const statusLabel = status === "current" ? "En cours" : status === "future" ? "À venir" : "Terminée";
                          return (
                            <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor, flexShrink: 0 }}></span>
                                <span style={{ fontWeight: 600 }}>{siteName(a.siteId)}</span>
                                <span style={{ color: C.muted, fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>
                                  {a.startDate} → {a.endDate || "indéterminé"}
                                </span>
                                <span style={{ color: statusColor, fontSize: 11, fontWeight: 600 }}>{statusLabel}</span>
                              </div>
                              <button className="del-btn" style={{ opacity: 0.5 }} onClick={() => deleteAssignment(a.id)}>✕</button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* By-site overview */}
            {teams.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: C.mutedLight, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Vue par Chantier</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
                  {sites.filter(s => s.type === "site").map(site => {
                    const siteAssignments = assignmentsForSite(site.id);
                    return (
                      <div key={site.id} className="card" style={{ padding: "16px 18px" }}>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{site.name}</div>
                        {siteAssignments.length === 0 && <div style={{ color: C.muted, fontSize: 12 }}>Aucune équipe assignée.</div>}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {siteAssignments.map(a => {
                            const status = assignmentStatus(a);
                            const statusColor = status === "current" ? C.green : status === "future" ? C.blue : C.muted;
                            return (
                              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, flexShrink: 0 }}></span>
                                <span style={{ fontWeight: 600 }}>{teamName(a.teamId)}</span>
                                <span style={{ color: C.muted, fontSize: 11 }}>({a.startDate} → {a.endDate || "indéterminé"})</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TRANSFER MODAL */}
      {transfer && (
        <div className="overlay" onClick={() => setTransfer(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>Transfert de Formes</h3>
                <p style={{ color: C.muted, fontSize: 13, marginTop: 3 }}>Déplacer les Duraform entre chantiers</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setTransfer(false)}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "end", marginBottom: 18 }}>
              <div>
                <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>De</label>
                <select className="input" value={txForm.from} onChange={e => setTxForm(p => ({ ...p, from: e.target.value }))}>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ color: C.accent, fontSize: 22, paddingBottom: 8, textAlign: "center" }}>⇄</div>
              <div>
                <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Vers</label>
                <select className="input" value={txForm.to} onChange={e => setTxForm(p => ({ ...p, to: e.target.value }))}>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Quantités</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              {formTypes.map(ft => {
                const avail = inventory[txForm.from]?.[ft.key] || 0;
                return (
                  <div key={ft.key} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{ft.label} <span style={{ fontSize: 10, color: C.muted, fontWeight: 400 }}>({ft.unit || "unité"})</span></span>
                      <span style={{ fontSize: 11, color: C.muted }}>dispo: <span style={{ fontFamily: "'JetBrains Mono',monospace", color: avail > 0 ? C.green : C.muted }}>{avail}</span></span>
                    </div>
                    <input type="number" min={0} max={avail} className="input" style={{ padding: "6px 10px", fontSize: 14 }}
                      value={txForm.items[ft.key] || ""} placeholder="0"
                      onChange={e => setTxForm(p => ({ ...p, items: { ...p.items, [ft.key]: Math.min(Number(e.target.value), avail) } }))} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Date</label>
                <input type="date" className="input" value={txForm.date} onChange={e => setTxForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Note (optionnel)</label>
                <input type="text" className="input" placeholder="ex: Retour après coulée #3" value={txForm.note} onChange={e => setTxForm(p => ({ ...p, note: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setTransfer(false)}>Annuler</button>
              <button className="btn btn-accent" onClick={submitTransfer}>Confirmer le Transfert</button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN TEAM MODAL */}
      {assigningTeam && (
        <div className="overlay" onClick={() => setAssigningTeam(null)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Assigner {teamName(assigningTeam)}</h3>
                <p style={{ color: C.muted, fontSize: 13, marginTop: 3 }}>Choisis le chantier et la période</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setAssigningTeam(null)}>✕</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Chantier</label>
              <select className="input" value={assignForm.siteId} onChange={e => setAssignForm(p => ({ ...p, siteId: e.target.value }))}>
                <option value="">— Choisir —</option>
                {sites.filter(s => s.type === "site").map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Date de début</label>
                <input type="date" className="input" value={assignForm.startDate} onChange={e => setAssignForm(p => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Date de fin prévue</label>
                <input type="date" className="input" value={assignForm.endDate} onChange={e => setAssignForm(p => ({ ...p, endDate: e.target.value }))} />
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Laisse vide si indéterminée</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setAssigningTeam(null)}>Annuler</button>
              <button className="btn btn-accent" onClick={submitAssignment}>Confirmer l'Assignation</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete && (
        <div className="overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Confirmer la suppression</h3>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>
                {confirmDelete.type === "site" && <>Supprimer le chantier <strong style={{ color: C.text }}>"{confirmDelete.label}"</strong> et tout son inventaire?</>}
                {confirmDelete.type === "form" && <>Supprimer le type de forme <strong style={{ color: C.text }}>"{confirmDelete.label}"</strong> de tous les chantiers?</>}
                {confirmDelete.type === "group" && <>Supprimer l'onglet <strong style={{ color: C.text }}>"{confirmDelete.label}"</strong>? Les types de formes qu'il contient resteront, mais sans groupe.</>}
                {confirmDelete.type === "team" && <>Supprimer l'équipe <strong style={{ color: C.text }}>"{confirmDelete.label}"</strong> et toutes ses assignations?</>}
                <br /><span style={{ color: C.red, fontSize: 13, marginTop: 6, display: "block" }}>Cette action est irréversible.</span>
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Annuler</button>
              <button className="btn btn-danger"
                onClick={() => {
                  if (confirmDelete.type === "site") deleteSite(confirmDelete.id);
                  else if (confirmDelete.type === "form") deleteFormType(confirmDelete.id);
                  else if (confirmDelete.type === "group") deleteGroup(confirmDelete.id);
                  else if (confirmDelete.type === "team") deleteTeam(confirmDelete.id);
                }}>
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
