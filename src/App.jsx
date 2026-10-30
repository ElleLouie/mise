import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Recipe from './pages/Recipe';
import EditRecipe from './pages/EditRecipe';
import Cook from './pages/Cook';
import Settings from './pages/Settings';
import Soon from './pages/Soon';
import Larder from './pages/Larder';
import List from './pages/List';
import Discover from './pages/Discover';
import Table from './pages/Table';

const tabs = [
  { to: '/', label: 'Recipes' },
  { to: '/table', label: 'Table' },
  { to: '/discover', label: 'Discover' },
  { to: '/larder', label: 'Larder' },
  { to: '/list', label: 'List' },
];

// The masthead with the navigation: across the top on wide screens, a tab bar on phones.
function Masthead() {
  // cook mode takes over the whole screen
  if (useLocation().pathname.endsWith('/cook')) return null;
  return (
    <header className="masthead">
      <Link to="/" className="wordmark">mise</Link>
      <div className="masthead_right">
        <nav className="tabs label" aria-label="Main">
          {tabs.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className="tab">{label}</NavLink>
          ))}
        </nav>
        <NavLink to="/settings" className="icon_button" aria-label="Settings">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
            <circle cx="16" cy="7" r="2" />
            <circle cx="10" cy="17" r="2" />
          </svg>
        </NavLink>
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Masthead />
      <main className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new" element={<EditRecipe />} />
          <Route path="/recipe/:id" element={<Recipe />} />
          <Route path="/recipe/:id/edit" element={<EditRecipe />} />
          <Route path="/recipe/:id/cook" element={<Cook />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/table" element={<Table />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/larder" element={<Larder />} />
          <Route path="/list" element={<List />} />
          {/* earlier names for these screens */}
          <Route path="/plan" element={<Navigate to="/table" replace />} />
          <Route path="/pantry" element={<Navigate to="/larder" replace />} />
          <Route path="*" element={<Soon title="Not found" text="This page doesn't exist." />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
