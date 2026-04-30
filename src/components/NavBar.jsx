import { NavLink } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="top-nav">
      <div className="nav-brand">
        <span className="sidebar-logo">DXB</span>
        <span className="nav-brand-text">RE Analyser</span>
      </div>
      <div className="nav-tabs">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-tab${isActive ? ' nav-tab-active' : ''}`}
        >
          Market Analysis
        </NavLink>
        <NavLink
          to="/compare"
          className={({ isActive }) => `nav-tab${isActive ? ' nav-tab-active' : ''}`}
        >
          Compare Buildings
        </NavLink>
      </div>
    </nav>
  );
}
