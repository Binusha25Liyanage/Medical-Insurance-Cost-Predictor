import { Bell, ChartColumnBig, ChartSpline, FlaskConical, LayoutDashboard, Settings, UserRound, WandSparkles } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'DASHBOARD', topLabel: 'Dashboard', icon: LayoutDashboard },
  { path: '/eda', label: 'EDA', topLabel: 'EDA', icon: FlaskConical },
  { path: '/model-comparison', label: 'COMPARISON', topLabel: 'Comparison', icon: ChartSpline },
  { path: '/feature-importance', label: 'IMPORTANCE', topLabel: 'Importance', icon: ChartColumnBig },
  { path: '/predict', label: 'PREDICT', topLabel: 'Predict', icon: WandSparkles }
];

function Navbar() {
  const location = useLocation();
  const active = navItems.find((item) => item.path === location.pathname) || navItems[0];

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>CLINICAL ARCHITECT</h2>
          <p>PRECISION ANALYTICS</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button type="button" className="new-analysis-btn">+ New Analysis</button>
          <a className="sidebar-meta-link" href="#support">
            <Bell size={15} />
            SUPPORT
          </a>
          <a className="sidebar-meta-link" href="#account">
            <UserRound size={15} />
            ACCOUNT
          </a>
        </div>
      </aside>

      <header className="topbar">
        <div className="topbar-title-wrap">
          <span className="topbar-accent" aria-hidden="true" />
          <h1>{active.topLabel}</h1>
        </div>

        <div className="topbar-right">
          <nav className="topbar-links">
            {navItems.map((item) => (
              <NavLink
                key={`top-${item.path}`}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `topbar-link${isActive ? ' active' : ''}`}
              >
                {item.topLabel}
              </NavLink>
            ))}
          </nav>

          <button type="button" className="icon-btn" aria-label="Notifications">
            <Bell size={16} />
          </button>
          <button type="button" className="icon-btn" aria-label="Settings">
            <Settings size={16} />
          </button>
          <div className="avatar-circle" aria-hidden="true">CA</div>
        </div>
      </header>
    </>
  );
}

export default Navbar;
