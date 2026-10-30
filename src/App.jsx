import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Recipe from './pages/Recipe';
import EditRecipe from './pages/EditRecipe';
import Cook from './pages/Cook';
import Settings from './pages/Settings';
import Soon from './pages/Soon';
import Groceries from './pages/Groceries';
import Discover from './pages/Discover';
import Table from './pages/Table';
import Icon from './components/Icon';

const tabs = [
  { to: '/', label: 'Recipes', icon: 'book' },
  { to: '/plan', label: 'Plan', icon: 'calendar' },
  { to: '/groceries', label: 'Groceries', icon: 'bag' },
];

// A sidebar on wide screens, a tab bar along the bottom on phones.
function Navigation() {
  // cook mode takes over the whole screen
  if (useLocation().pathname.endsWith('/cook')) return null;
  return (
    <aside className="sidebar">
      <Link to="/" className="wordmark">mise</Link>
      <nav className="tabs" aria-label="Main">
        {tabs.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className="tab">
            <Icon name={icon} size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <NavLink to="/settings" className="tab tab-settings">
        <Icon name="settings" size={22} />
        <span>Settings</span>
      </NavLink>
    </aside>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="shell">
        <Navigation />
        <main className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/new" element={<EditRecipe />} />
            <Route path="/recipe/:id" element={<Recipe />} />
            <Route path="/recipe/:id/edit" element={<EditRecipe />} />
            <Route path="/recipe/:id/cook" element={<Cook />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/plan" element={<Table />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/groceries" element={<Groceries />} />
            {/* earlier names for these pages */}
            {['/table'].map((path) => <Route key={path} path={path} element={<Navigate to="/plan" replace />} />)}
            {['/shopping', '/list', '/pantry', '/larder'].map((path) => <Route key={path} path={path} element={<Navigate to="/groceries" replace />} />)}
            <Route path="*" element={<Soon title="Not found" text="This page doesn't exist." />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
