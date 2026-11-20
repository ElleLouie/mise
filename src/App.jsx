import { BrowserRouter, Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Parties from './pages/Parties';
import Party from './pages/Party';
import PartyForm from './pages/PartyForm';
import Recipes from './pages/Recipes';
import Ideas from './pages/Ideas';
import Idea from './pages/Idea';
import Recipe from './pages/Recipe';
import EditRecipe from './pages/EditRecipe';
import Settings from './pages/Settings';
import Soon from './pages/Soon';
import Icon from './components/Icon';

const tabs = [
  { to: '/', label: 'Parties', icon: 'table' },
  { to: '/ideas', label: 'Ideas', icon: 'spark' },
  { to: '/recipes', label: 'Recipes', icon: 'book' },
];

// A sidebar on wide screens, a tab bar along the bottom on phones.
function Navigation() {
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
            <Route path="/" element={<Parties />} />
            <Route path="/party/new" element={<PartyForm />} />
            <Route path="/party/:id" element={<Party />} />
            <Route path="/party/:id/edit" element={<PartyForm />} />
            <Route path="/ideas" element={<Ideas />} />
            <Route path="/ideas/:id" element={<Idea />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipes/new" element={<EditRecipe />} />
            <Route path="/recipe/:id" element={<Recipe />} />
            <Route path="/recipe/:id/edit" element={<EditRecipe />} />
            <Route path="/settings" element={<Settings />} />
            {/* pages from the first version */}
            <Route path="/new" element={<Navigate to="/recipes/new" replace />} />
            {['/plan', '/table', '/groceries', '/shopping', '/list', '/pantry', '/larder'].map((path) => <Route key={path} path={path} element={<Navigate to="/" replace />} />)}
            <Route path="*" element={<Soon title="Not found" text="This page doesn't exist." />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
