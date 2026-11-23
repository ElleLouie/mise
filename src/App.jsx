import { lazy, Suspense } from 'react';
import {
  BrowserRouter, Link, NavLink, Navigate, Route, Routes, useParams,
} from 'react-router-dom';
import Discover from './pages/Discover';
import Saved from './pages/Saved';
import Vibe from './pages/Vibe';
import Recipes from './pages/Recipes';
import Ideas from './pages/Ideas';
import Idea from './pages/Idea';
import Recipe from './pages/Recipe';
import EditRecipe from './pages/EditRecipe';
import Settings from './pages/Settings';
import Soon from './pages/Soon';
import Icon from './components/Icon';

// planning is an add-on: its pages load when you first open a plan
const Party = lazy(() => import('./pages/Party'));
const PartyForm = lazy(() => import('./pages/PartyForm'));

const tabs = [
  { to: '/', label: 'Discover', icon: 'reroll' },
  { to: '/saved', label: 'Saved', icon: 'heart' },
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

// a party is now a vibe with a plan, under the same id
function PartyRedirect({ edit = false }) {
  const { id } = useParams();
  return <Navigate to={`/vibe/${id}/plan${edit ? '/edit' : ''}`} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <div className="shell">
        <Navigation />
        <main className="app">
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Discover />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/vibe/:id" element={<Vibe />} />
              <Route path="/vibe/:id/plan" element={<Party />} />
              <Route path="/vibe/:id/plan/edit" element={<PartyForm />} />
              <Route path="/plan/new" element={<PartyForm />} />
              <Route path="/ideas" element={<Ideas />} />
              <Route path="/ideas/:id" element={<Idea />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/recipes/new" element={<EditRecipe />} />
              <Route path="/recipe/:id" element={<Recipe />} />
              <Route path="/recipe/:id/edit" element={<EditRecipe />} />
              <Route path="/settings" element={<Settings />} />
              {/* links from before vibes */}
              <Route path="/party/new" element={<Navigate to="/plan/new" replace />} />
              <Route path="/party/:id" element={<PartyRedirect />} />
              <Route path="/party/:id/edit" element={<PartyRedirect edit />} />
              <Route path="/discover" element={<Navigate to="/" replace />} />
              <Route path="/new" element={<Navigate to="/recipes/new" replace />} />
              {['/plan', '/table', '/groceries', '/shopping', '/list', '/pantry', '/larder'].map((path) => <Route key={path} path={path} element={<Navigate to="/" replace />} />)}
              <Route path="*" element={<Soon title="Not found" text="This page doesn't exist." />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
