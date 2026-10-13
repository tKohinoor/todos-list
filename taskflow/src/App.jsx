import { useMemo, useRef, useState } from "react";
import {
  Home, CalendarDays, Clock, Star, CheckCircle2, Settings, Plus, Search, Bell,
  Flag, Tag, ChevronLeft, ChevronRight, ChevronDown, MoreHorizontal, Check, Sun, Trash2,
} from "lucide-react";
import "./App.css";

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
const fmt = (s, o = { month: "short", day: "numeric", year: "numeric" }) => fromIso(s).toLocaleDateString("en-US", o);
const fmtTime = (t) => { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };

const LISTS = [
  { name: "Work", color: "#3b6cff" }, { name: "Personal", color: "#2fb67c" },
  { name: "Study", color: "#8b5cf6" }, { name: "Shopping", color: "#f59e0b" },
];
const PRIORITIES = ["Low", "Medium", "High"];
const NAV = [
  { id: "home", label: "Home", icon: Home }, { id: "today", label: "Today", icon: CalendarDays },
  { id: "upcoming", label: "Upcoming", icon: Clock }, { id: "important", label: "Important", icon: Star },
  { id: "completed", label: "Completed", icon: CheckCircle2 },
];
const QUOTE = { text: "Discipline is the bridge between goals and achievement.", by: "Jim Rohn" };

let nextId = 100;
const seed = () => {
  const t = addDays(0);
  return [
    { id: 1, title: "Finish project report", note: "Agile Project Management & Collaboration System", priority: "High", list: "Work", date: t, time: "10:00", done: false },
    { id: 2, title: "Gym workout", note: "Chest + Triceps", priority: "Low", list: "Personal", date: t, time: "18:00", done: true },
    { id: 3, title: "Prepare for placement interview", note: "DSA + System Design", priority: "Medium", list: "Study", date: t, time: "20:00", done: false },
    { id: 4, title: "Make payment for hostel fees", note: "", priority: "Medium", list: "Personal", date: t, time: "21:00", done: false },
    { id: 5, title: "Read 20 pages of Atomic Habits", note: "", priority: "Low", list: "Personal", date: t, time: "23:00", done: false },
    { id: 6, title: "Complete web development mini project", note: "", priority: "Medium", list: "Study", date: addDays(2), time: "", done: false },
    { id: 7, title: "Call Mom", note: "", priority: "Low", list: "Personal", date: addDays(3), time: "", done: false },
    { id: 8, title: "Buy groceries", note: "", priority: "Low", list: "Shopping", date: addDays(4), time: "", done: false },
    { id: 9, title: "Update LinkedIn profile", note: "", priority: "Medium", list: "Work", date: addDays(6), time: "", done: false },
  ];
};

function TaskRow({ task, onToggle, onDelete, detailed }) {
  const [menu, setMenu] = useState(false);
  return (
    <div className={`task ${detailed ? "" : "compact"} ${task.done ? "is-done" : ""}`}>
      <button className={`check ${task.done ? "on" : ""}`} onClick={() => onToggle(task.id)} aria-label={task.done ? "Mark as not done" : "Mark as done"}>
        {task.done && <Check size={14} strokeWidth={3} />}
      </button>
      <div className="task-main">
        <div className="task-title">{task.title}</div>
        {detailed && task.note && <div className="task-note">{task.note}</div>}
      </div>
      {!detailed && <span className="task-date">{fmt(task.date)}</span>}
      <span className={`badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
      {detailed && (
        <span className="task-time">{task.time && (<><Clock size={14} /> {fmtTime(task.time)}</>)}</span>
      )}
      <div className="more">
        <button className="icon-btn" onClick={() => setMenu(!menu)} aria-label="Task options"><MoreHorizontal size={18} /></button>
        {menu && <button className="menu-item" onClick={() => onDelete(task.id)}><Trash2 size={14} /> Delete task</button>}
      </div>
    </div>
  );
}

function Calendar({ selected, onSelect, tasks }) {
  const sel = fromIso(selected);
  const [view, setView] = useState(new Date(sel.getFullYear(), sel.getMonth(), 1));
  const y = view.getFullYear(), m = view.getMonth();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const total = Math.ceil((offset + new Date(y, m + 1, 0).getDate()) / 7) * 7;
  const cells = Array.from({ length: total }, (_, i) => new Date(y, m, 1 - offset + i));
  const withTasks = new Set(tasks.filter((t) => !t.done).map((t) => t.date));
  const shift = (n) => setView(new Date(y, m + n, 1));
  return (
    <section className="card">
      <div className="card-head">
        <h3>{view.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
        <div className="nav-arrows">
          <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft size={16} /></button>
          <button className="icon-btn" onClick={() => shift(1)} aria-label="Next month"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="cal-grid">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <span key={d} className="cal-dow">{d}</span>)}
        {cells.map((d) => {
          const k = iso(d), out = d.getMonth() !== m;
          return (
            <button key={k} onClick={() => onSelect(k)}
              className={`cal-day ${out ? "out" : ""} ${k === selected ? "sel" : ""} ${withTasks.has(k) ? "has" : ""}`}>
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Ring({ done, total }) {
  const r = 46, c = 2 * Math.PI * r, pct = total ? done / total : 0;
  return (
    <div className="ring">
      <svg viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} className="ring-bg" />
        <circle cx="55" cy="55" r={r} className="ring-fg" strokeDasharray={`${c * pct} ${c}`} transform="rotate(-90 55 55)" />
      </svg>
      <div className="ring-label"><strong>{done}/{total}</strong><span>tasks today</span></div>
    </div>
  );
}

export default function App() {
  const today = iso(new Date());
  const [tasks, setTasks] = useState(seed);
  const [view, setView] = useState("home");
  const [list, setList] = useState(null);
  const [selected, setSelected] = useState(today);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [draft, setDraft] = useState({ title: "", priority: "Medium", list: "Personal", date: today });
  const dateRef = useRef(null);

  const toggle = (id) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id) => setTasks((ts) => ts.filter((t) => t.id !== id));
  const add = () => {
    const title = draft.title.trim();
    if (!title) return;
    setTasks((ts) => [...ts, { id: nextId++, title, note: "", priority: draft.priority, list: draft.list, date: draft.date, time: "", done: false }]);
    setDraft({ ...draft, title: "" });
  };
  const cycle = (arr, v) => arr[(arr.indexOf(v) + 1) % arr.length];

  const visible = useMemo(() => tasks.filter((t) =>
    (!list || t.list === list) && t.title.toLowerCase().includes(query.toLowerCase())), [tasks, list, query]);

  const byTime = (a, b) => (a.time || "99").localeCompare(b.time || "99");
  const dayTasks = visible.filter((t) => t.date === selected && (filter === "All" || (filter === "Open" ? !t.done : t.done))).sort(byTime);
  const upcoming = visible.filter((t) => t.date > selected && !t.done).sort((a, b) => a.date.localeCompare(b.date));
  const important = visible.filter((t) => t.priority === "High" && !t.done);
  const completed = visible.filter((t) => t.done);

  const dayAll = tasks.filter((t) => t.date === selected);
  const doneCount = dayAll.filter((t) => t.done).length;
  const open = tasks.filter((t) => !t.done);
  const countOf = (p) => open.filter((t) => t.priority === p).length;
  const isToday = selected === today;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const section = (title, sub, rows, detailed, empty) => (
    <section className="section">
      <div className="section-head">
        <h2>{title} {sub && <small>{sub}</small>}</h2>
        {title !== "Upcoming" && view !== "completed" && view !== "important" && (
          <label className="select">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option>All</option><option>Open</option><option>Done</option>
            </select>
            <ChevronDown size={14} />
          </label>
        )}
      </div>
      <div className="task-list">
        {rows.length ? rows.map((t) => <TaskRow key={t.id} task={t} detailed={detailed} onToggle={toggle} onDelete={remove} />)
          : <p className="empty">{empty}</p>}
      </div>
    </section>
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><span className="logo"><Check size={18} strokeWidth={3} /></span>TaskFlow</div>
        <nav>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${view === id ? "active" : ""}`} onClick={() => setView(id)}>
              <Icon size={20} /> {label}
              {id === "today" && <span className="pill">{tasks.filter((t) => t.date === today && !t.done).length}</span>}
            </button>
          ))}
        </nav>
        <hr />
        <div className="lists-head"><span>Lists</span><Plus size={16} /></div>
        {LISTS.map((l) => (
          <button key={l.name} className={`list-item ${list === l.name ? "active" : ""}`} onClick={() => setList(list === l.name ? null : l.name)}>
            <i style={{ background: l.color }} /> {l.name}
            <span>{tasks.filter((t) => t.list === l.name && !t.done).length}</span>
          </button>
        ))}
        <button className="list-item muted"><Plus size={16} /> Create new list</button>
        <button className="nav-item settings"><Settings size={20} /> Settings</button>
      </aside>

      <main className="main">
        <header>
          <h1>{greeting}, Kishan <Sun size={22} className="sun" /></h1>
          <p>Small steps every day lead to big results.</p>
        </header>

        <div className="composer">
          <Plus size={20} className="plus" />
          <input value={draft.title} placeholder="Add a new task…" onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && add()} />
          <button className="icon-btn" title={`Due ${fmt(draft.date)}`} onClick={() => dateRef.current?.showPicker?.()}><CalendarDays size={18} /></button>
          <input ref={dateRef} type="date" className="hidden-date" value={draft.date} onChange={(e) => e.target.value && setDraft({ ...draft, date: e.target.value })} />
          <button className={`icon-btn p-${draft.priority.toLowerCase()}`} title={`Priority: ${draft.priority}`} onClick={() => setDraft({ ...draft, priority: cycle(PRIORITIES, draft.priority) })}><Flag size={18} /></button>
          <button className="icon-btn" title={`List: ${draft.list}`} onClick={() => setDraft({ ...draft, list: cycle(LISTS.map((l) => l.name), draft.list) })}><Tag size={18} /></button>
          <button className="add" onClick={add}>Add</button>
        </div>
        <p className="composer-hint">{draft.priority} priority · {draft.list} · due {fmt(draft.date, { month: "short", day: "numeric" })}</p>

        {(view === "home" || view === "today") && section(isToday ? "Today" : "Tasks", fmt(selected), dayTasks, true, "Nothing planned for this day. Add a task above.")}
        {(view === "home" || view === "upcoming") && section("Upcoming", "", upcoming, false, "No upcoming tasks.")}
        {view === "important" && section("Important", "High priority", important, true, "No high-priority tasks open.")}
        {view === "completed" && section("Completed", "", completed, true, "Finished tasks will show up here.")}
      </main>

      <aside className="rail">
        <div className="topbar">
          <label className="search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks…" /></label>
          <button className="icon-btn" aria-label="Notifications"><Bell size={20} /></button>
          <span className="avatar">K</span>
        </div>
        <Calendar selected={selected} onSelect={setSelected} tasks={tasks} />
        <section className="card">
          <div className="card-head"><h3>Progress</h3><a href="#completed" onClick={(e) => { e.preventDefault(); setView("completed"); }}>View all</a></div>
          <div className="progress">
            <Ring done={doneCount} total={dayAll.length} />
            <ul className="legend">
              <li><i className="g" /> Completed <b>{doneCount}</b></li>
              <li><i className="m" /> Remaining <b>{dayAll.length - doneCount}</b></li>
            </ul>
          </div>
        </section>
        <section className="card">
          <h3>Priority</h3>
          <ul className="legend prio">
            <li><i className="r" /> High <b>{countOf("High")}</b></li>
            <li><i className="o" /> Medium <b>{countOf("Medium")}</b></li>
            <li><i className="g" /> Low <b>{countOf("Low")}</b></li>
          </ul>
        </section>
        <section className="card quote">
          <span className="qmark">“</span>
          <p>{QUOTE.text}</p>
          <small>— {QUOTE.by}</small>
        </section>
      </aside>
    </div>
  );
}