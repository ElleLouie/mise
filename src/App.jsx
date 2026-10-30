import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Recipe from './pages/Recipe';
import EditRecipe from './pages/EditRecipe';
import Cook from './pages/Cook';
import Settings from './pages/Settings';
import Soon from './pages/Soon';

const tabs = [
  { to: '/', label: 'Recipes' },
  { to: '/table', label: 'Table' },
  { to: '/larder', label: 'Larder' },
  { to: '/list', label: 'List' },
];

// The masthead with the navigation: across the top on wide screens, a tab bar on phones.
function Masthead() {
  // cook mode takes over the whole screen
  if (useLocation().pathname.endsWith('/cook')) return null;
  return (
    <header className="masthead">
      <Link to="/" className="wordmark">
        mise
        <span className="wordmark_tagline label">Provisions &amp; recipes</span>
      </Link>
      <nav className="tabs label" aria-label="Main">
        {tabs.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className="tab">{label}</NavLink>
        ))}
      </nav>
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
          <Route path="/table" element={<Soon title="Table" text="Plan the week's meals here, and turn them into a shopping list. Coming in a later step." />} />
          <Route path="/larder" element={<Soon title="Larder" text="Keep track of what's in your kitchen and see what you can make with it. Coming in the next step." />} />
          <Route path="/list" element={<Soon title="List" text="Your shopping list, sorted by where things are in the shop. Coming in a later step." />} />
          {/* earlier names for these screens */}
          <Route path="/plan" element={<Navigate to="/table" replace />} />
          <Route path="/pantry" element={<Navigate to="/larder" replace />} />
          <Route path="*" element={<Soon title="Not found" text="There's nothing on this shelf." />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
