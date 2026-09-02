/**
 * Resolves a public asset path against the deploy base.
 *
 * GitHub Pages serves this site under /Viktor_Nedev/ while Vercel and dev serve
 * it at /. Vite rewrites paths in imported modules and index.html, but NOT
 * strings assembled at runtime - so every runtime asset path must go through
 * here. A raw "/certificates/x.webp" works locally and 404s on Pages.
 */
export const asset = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`;
