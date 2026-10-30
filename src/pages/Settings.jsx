import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { exportRecipes, importRecipes } from '../lib/db';
import { themes, getTheme, applyTheme } from '../lib/theme';

function Settings() {
  const [theme, setTheme] = useState(getTheme);
  const [message, setMessage] = useState('');
  const fileInput = useRef(null);

  const download = async () => {
    const blob = new Blob([await exportRecipes()], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mise-recipes-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const count = await importRecipes(await file.text());
      setMessage(`Imported ${count} recipes.`);
    } catch (error) {
      setMessage(error.message);
    }
    e.target.value = '';
  };

  return (
    <div className="page">
      <header className="subhead">
        <Link to="/" className="mono_label">&larr; Recipe box</Link>
      </header>
      <div className="order">
        <div className="order_top"><span>Settings</span></div>

        <h2 className="order_section">Colors</h2>
        <div className="themes" role="radiogroup" aria-label="Color theme">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={theme === t.id}
              className={`theme ${theme === t.id ? 'theme-on' : ''}`}
              onClick={() => {
                applyTheme(t.id);
                setTheme(t.id);
              }}
            >
              <span className="theme_swatch" aria-hidden="true">
                {t.swatch.map((c) => <i key={c} style={{ background: c }} />)}
              </span>
              <span className="mono_label">{t.name}</span>
            </button>
          ))}
        </div>

        <h2 className="order_section">Backup</h2>
        <p className="small">Recipes are saved in this browser on this device. Download a backup now and then, or to move your recipes to another device.</p>
        <div className="form_actions form_actions-left">
          <button type="button" className="button" onClick={download}>Download backup</button>
          <button type="button" className="button button-ghost" onClick={() => fileInput.current.click()}>Import backup</button>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={upload} />
        </div>
        {message && <p className="small" role="status">{message}</p>}
      </div>
    </div>
  );
}

export default Settings;
