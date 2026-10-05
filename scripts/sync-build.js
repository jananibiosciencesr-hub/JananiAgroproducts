const fs = require('fs');
const path = require('path');

function syncBuild() {
  console.log('[sync-build] Starting asset synchronization...');

  const rootDir = path.resolve(__dirname, '..');
  const clientAssetsDir = path.join(rootDir, 'frontend', 'dist', 'client', 'assets');
  const serverAssetsDir = path.join(rootDir, 'frontend', 'dist', 'server', 'assets');
  const rootAssetsDir = path.join(rootDir, 'assets');
  const distAssetsDir = path.join(rootDir, 'dist', 'assets');
  const rootIndexHtml = path.join(rootDir, 'index.html');
  const distIndexHtml = path.join(rootDir, 'dist', 'index.html');

  if (!fs.existsSync(clientAssetsDir)) {
    console.error('[sync-build] Error: frontend/dist/client/assets directory does not exist. Run frontend build first.');
    process.exit(1);
  }

  // 1. Copy client assets to root assets/ and dist/assets/
  fs.mkdirSync(rootAssetsDir, { recursive: true });
  fs.cpSync(clientAssetsDir, rootAssetsDir, { recursive: true });
  console.log(`[sync-build] Copied ${fs.readdirSync(clientAssetsDir).length} files to assets/`);

  if (fs.existsSync(path.join(rootDir, 'dist'))) {
    fs.mkdirSync(distAssetsDir, { recursive: true });
    fs.cpSync(clientAssetsDir, distAssetsDir, { recursive: true });
  }

  // 2. Find CSS bundle and JS entry bundle in client assets
  const clientFiles = fs.readdirSync(clientAssetsDir);
  const cssFile = clientFiles.find(f => f.startsWith('styles-') && f.endsWith('.css'));
  const jsEntryFile = clientFiles.find(f => f.startsWith('index-') && f.endsWith('.js'));

  if (!cssFile || !jsEntryFile) {
    console.error('[sync-build] Error: Could not locate styles-*.css or index-*.js in client assets.');
    process.exit(1);
  }
  console.log(`[sync-build] Current CSS: ${cssFile}`);
  console.log(`[sync-build] Current JS Entry: ${jsEntryFile}`);

  // 3. Find and parse TanStack Start manifest in server assets
  let preloads = [];
  let scriptSrc = `/assets/${jsEntryFile}`;

  if (fs.existsSync(serverAssetsDir)) {
    const serverFiles = fs.readdirSync(serverAssetsDir);
    const manifestFile = serverFiles.find(f => f.startsWith('_tanstack-start-manifest'));
    if (manifestFile) {
      const manifestPath = path.join(serverAssetsDir, manifestFile);
      let manifestCode = fs.readFileSync(manifestPath, 'utf8');
      manifestCode = manifestCode.replace(/export\s*\{[^}]*\};?/g, '');
      try {
        const fn = new Function(manifestCode + '; return tsrStartManifest();');
        const manifest = fn();
        if (manifest?.routes?.__root__?.preloads) {
          preloads = manifest.routes.__root__.preloads;
          console.log(`[sync-build] Loaded ${preloads.length} preloads from ${manifestFile}`);
        }
        if (manifest?.routes?.__root__?.scripts?.[0]?.attrs?.src) {
          scriptSrc = manifest.routes.__root__.scripts[0].attrs.src;
        }
      } catch (e) {
        console.warn('[sync-build] Warning: Could not evaluate manifest, falling back to default preloads:', e.message);
      }
    }
  }

  if (preloads.length === 0) {
    preloads = [
      `/assets/${jsEntryFile}`,
      ...clientFiles
        .filter(f => f.endsWith('.js') && f !== jsEntryFile)
        .map(f => `/assets/${f}`)
    ];
  }

  // 4. Update index.html
  if (!fs.existsSync(rootIndexHtml)) {
    console.error('[sync-build] Error: Root index.html does not exist.');
    process.exit(1);
  }

  let html = fs.readFileSync(rootIndexHtml, 'utf8');

  // Replace CSS link
  // Matches <link rel="stylesheet" href="/assets/styles-...css"/>
  html = html.replace(/<link rel="stylesheet" href="\/assets\/styles-[^"]+\.css"\/>/g, `<link rel="stylesheet" href="/assets/${cssFile}"/>`);
  // Remove any stale /assets/styles.css link if present
  html = html.replace(/<link rel="stylesheet" href="\/assets\/styles\.css"[^>]*\/>/g, '');

  // Replace modulepreload tags in head
  const preloadTags = preloads.map(p => `<link rel="modulepreload" href="${p}"/>`).join('');
  // Replace the block of <link rel="modulepreload" ... />
  html = html.replace(/(<link rel="modulepreload" href="\/assets\/[^"]+"\/>)+/g, preloadTags);

  // Update $tsr preloads array and script tag inside inline script if present
  const preloadsJson = JSON.stringify(preloads);
  html = html.replace(/preloads:\$R\[\d+\]=\[[^\]]*\]/g, `preloads:$R[4]=${preloadsJson}`);
  html = html.replace(/src:"\/assets\/index-[^"]+\.js"/g, `src:"${scriptSrc}"`);

  // Update bottom entry script tag: <script type="module" async="" src="/assets/index-...js"></script>
  html = html.replace(/<script type="module" async="" src="\/assets\/index-[^"]+\.js"><\/script>/g, `<script type="module" async="" src="${scriptSrc}"></script>`);

  fs.writeFileSync(rootIndexHtml, html, 'utf8');
  console.log('[sync-build] Updated root index.html successfully.');

  if (fs.existsSync(path.join(rootDir, 'dist'))) {
    fs.writeFileSync(distIndexHtml, html, 'utf8');
    console.log('[sync-build] Updated dist/index.html successfully.');
  }

  // 5. Verification check
  const assetRefs = [...html.matchAll(/\/assets\/[a-zA-Z0-9_\-\.]+/g)].map(m => m[0]);
  const uniqueRefs = [...new Set(assetRefs)];
  const missing = [];
  for (const ref of uniqueRefs) {
    const localFile = path.join(rootDir, ref.replace(/^\//, ''));
    if (!fs.existsSync(localFile)) {
      missing.push(ref);
    }
  }

  if (missing.length > 0) {
    console.error('[sync-build] WARNING: Missing assets referenced in index.html:', missing);
    process.exit(1);
  } else {
    console.log(`[sync-build] All ${uniqueRefs.length} asset references verified and present on disk!`);
  }
}

syncBuild();
