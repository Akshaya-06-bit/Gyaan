import "./Topbar.css";

export default function Topbar({ onMenuClick, title }) {
  return (
    <header className="topbar">
      <button className="menu-btn" onClick={onMenuClick}>☰</button>
      <h2 className="topbar-title">{title}</h2>
    </header>
  );
}
