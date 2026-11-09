// One-file preview: renders the home page (with the lesson below it) entirely in the browser.
// Used only for hosts that need a single self-contained HTML file. The real site is the Next.js build.
import { createRoot } from 'react-dom/client';
import Home from '@/app/page';

createRoot(document.getElementById('root')!).render(<Home />);
