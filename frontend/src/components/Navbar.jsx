import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/eda', label: 'EDA' },
  { path: '/model-comparison', label: 'Model Comparison' },
  { path: '/feature-importance', label: 'Feature Importance' },
  { path: '/predict', label: 'Predict' }
];

function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">Insurance Cost Predictor</div>
      <nav className="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `nav-link${isActive ? ' nav-link-active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
