import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Recipe from './pages/Recipe';
import EditRecipe from './pages/EditRecipe';
import Cook from './pages/Cook';
import Settings from './pages/Settings';
import Soon from './pages/Soon';

const tabs = [
  { to: '/', label: 'Recipes' },
  { to: '/plan', label: 'Plan' },
  { to: '/pantry', label: 'Pantry' },
  { to: '/list', label: 'List' },
];

function TabBar() {
  // cook mode takes over the whole screen
  if (useLocation().pathname.endsWith('/cook')) return null;
  return (
    <nav className="tabs" aria-label="Main">
      {tabs.map(({ to, label }) => (
        <NavLink key={to} to={to} end={to === '/'} className="tab">{label}</NavLink>
      ))}
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <main className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new" element={<EditRecipe />} />
          <Route path="/recipe/:id" element={<Recipe />} />
          <Route path="/recipe/:id/edit" element={<EditRecipe />} />
          <Route path="/recipe/:id/cook" element={<Cook />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/plan" element={<Soon title="Plan" text="This week's tickets will hang on the rail here. Coming in a later step." />} />
          <Route path="/pantry" element={<Soon title="Pantry" text="Mark what you have and see what you can make. Coming in the next step." />} />
          <Route path="/list" element={<Soon title="List" text="Your shopping list prints here like a receipt. Coming in a later step." />} />
          <Route path="*" element={<Soon title="86'd" text="That page isn't on the menu." />} />
        </Routes>
      </main>
      <TabBar />
    </BrowserRouter>
  );
}

export default App;
