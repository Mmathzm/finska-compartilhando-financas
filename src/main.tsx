import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handlers to avoid silent "white screen" failures and make errors visible
window.addEventListener('error', (ev) => {
	console.error('Global window.error', ev.error || ev.message || ev);
});
window.addEventListener('unhandledrejection', (ev) => {
	console.error('Global unhandledrejection', ev.reason || ev);
});

createRoot(document.getElementById("root")!).render(<App />);
