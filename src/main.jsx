import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import PortalProvider from './providers/portal-provider.jsx'
// NOTE: React.StrictMode is intentionally omitted. Its dev-only double-mount
// destroys @fileverse-dev/dsheet's Y.Doc (use-editor-sync cleanup nulls
// ydocRef.current + destroys the doc with no restore), which leaves read-only
// published sheets stuck on the loading skeleton. Production is unaffected
// (no double-mount), so this only impacts the dev experience.
createRoot(document.getElementById('root')).render(
  <HashRouter>
    <PortalProvider>
      <App />
    </PortalProvider>
  </HashRouter>
)
