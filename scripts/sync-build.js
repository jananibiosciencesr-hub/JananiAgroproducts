const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

async function syncBuild() {
  console.log('[sync-build] Starting asset synchronization...');

  const rootDir = path.resolve(__dirname, '..');
  const clientAssetsDir = path.join(rootDir, 'frontend', 'dist', 'client', 'assets');
  const serverJsFile = path.join(rootDir, 'frontend', 'dist', 'server', 'server.js');
  const serverAssetsDir = path.join(rootDir, 'frontend', 'dist', 'server', 'assets');
  const rootAssetsDir = path.join(rootDir, 'assets');
  const distAssetsDir = path.join(rootDir, 'dist', 'assets');
  const rootIndexHtml = path.join(rootDir, 'index.html');
  const distIndexHtml = path.join(rootDir, 'dist', 'index.html');

  if (!fs.existsSync(clientAssetsDir)) {
    console.error('[sync-build] Error: frontend/dist/client/assets directory does not exist. Run frontend build first.');
    process.exit(1);
  }

  // 1. Clean stale chunks from root assets/ to keep repository small, then copy
  if (fs.existsSync(rootAssetsDir)) {
    const existingRootFiles = fs.readdirSync(rootAssetsDir);
    const activeClientSet = new Set(fs.readdirSync(clientAssetsDir));
    for (const file of existingRootFiles) {
      if (!activeClientSet.has(file)) {
        try {
          fs.rmSync(path.join(rootAssetsDir, file), { recursive: true, force: true });
        } catch (e) {}
      }
    }
  }
  fs.mkdirSync(rootAssetsDir, { recursive: true });
  fs.cpSync(clientAssetsDir, rootAssetsDir, { recursive: true });
  console.log(`[sync-build] Cleaned and synchronized ${fs.readdirSync(clientAssetsDir).length} files to assets/`);

  if (fs.existsSync(path.join(rootDir, 'dist'))) {
    fs.mkdirSync(distAssetsDir, { recursive: true });
    fs.cpSync(clientAssetsDir, distAssetsDir, { recursive: true });
  }

  // Synchronize frontend/public/products and frontend/public/banners to root directories for Hostinger static serving
  const publicProductsDir = path.join(rootDir, 'frontend', 'public', 'products');
  const rootProductsDir = path.join(rootDir, 'products');
  if (fs.existsSync(publicProductsDir)) {
    fs.mkdirSync(rootProductsDir, { recursive: true });
    fs.cpSync(publicProductsDir, rootProductsDir, { recursive: true });
    console.log(`[sync-build] Synchronized products images to root products/`);
  }

  const publicBannersDir = path.join(rootDir, 'frontend', 'public', 'banners');
  const rootBannersDir = path.join(rootDir, 'banners');
  if (fs.existsSync(publicBannersDir)) {
    fs.mkdirSync(rootBannersDir, { recursive: true });
    fs.cpSync(publicBannersDir, rootBannersDir, { recursive: true });
    console.log(`[sync-build] Synchronized banners to root banners/`);
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

  // 3. Render fresh SSR HTML using server.js for all routes to eliminate React #418 hydration mismatch
  let generatedHtml = null;

  if (fs.existsSync(serverJsFile)) {
    try {
      const serverUrl = pathToFileURL(serverJsFile).href;
      const serverModule = await import(serverUrl);
      if (serverModule?.default?.fetch) {
        const routes = [
          { path: '/', destDir: null },
          { path: '/admin', destDir: 'admin' },
          { path: '/login', destDir: 'login' },
          { path: '/cart', destDir: 'cart' },
          { path: '/wishlist', destDir: 'wishlist' },
          { path: '/categories', destDir: 'categories' },
          { path: '/products', destDir: 'products' },
          { path: '/about', destDir: 'about' },
          { path: '/contact', destDir: 'contact' },
          { path: '/checkout', destDir: 'checkout' },
          { path: '/dashboard', destDir: 'dashboard' },
          { path: '/faq', destDir: 'faq' },
          { path: '/services', destDir: 'services' },
          { path: '/track-order', destDir: 'track-order' },
          { path: '/become-distributor', destDir: 'become-distributor' },
          { path: '/privacy', destDir: 'privacy' },
          { path: '/terms', destDir: 'terms' },
          { path: '/shipping-policy', destDir: 'shipping-policy' },
          { path: '/return-policy', destDir: 'return-policy' },
        ];

        for (const route of routes) {
          try {
            const req = new Request(`http://localhost${route.path}`);
            const res = await serverModule.default.fetch(req);
            if (res.ok) {
              const html = await res.text();
              if (route.destDir === null) {
                generatedHtml = html;
                console.log(`[sync-build] Successfully rendered SSR HTML (${html.length} bytes) for /`);
              } else {
                const targetDir = path.join(rootDir, route.destDir);
                fs.mkdirSync(targetDir, { recursive: true });
                fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');

                const distTargetDir = path.join(rootDir, 'dist', route.destDir);
                fs.mkdirSync(distTargetDir, { recursive: true });
                fs.writeFileSync(path.join(distTargetDir, 'index.html'), html, 'utf8');

                console.log(`[sync-build] Pre-rendered and saved SSR HTML for ${route.path} -> ${route.destDir}/index.html`);
              }
            }
          } catch (rErr) {
            console.warn(`[sync-build] Could not pre-render ${route.path}:`, rErr.message);
          }
        }
      }
    } catch (ssrErr) {
      console.warn('[sync-build] Warning: SSR execution encountered error, falling back to manifest string replacement:', ssrErr.message);
    }
  }

  // 4. Fallback or manifest patching if SSR render was not used
  if (!generatedHtml) {
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

    if (!fs.existsSync(rootIndexHtml)) {
      console.error('[sync-build] Error: Root index.html does not exist.');
      process.exit(1);
    }

    let html = fs.readFileSync(rootIndexHtml, 'utf8');

    html = html.replace(/<link rel="stylesheet" href="\/assets\/styles-[^"]+\.css"\/>/g, `<link rel="stylesheet" href="/assets/${cssFile}"/>`);
    html = html.replace(/<link rel="stylesheet" href="\/assets\/styles\.css"[^>]*\/>/g, '');

    const preloadTags = preloads.map(p => `<link rel="modulepreload" href="${p}"/>`).join('');
    html = html.replace(/(<link rel="modulepreload" href="\/assets\/[^"]+"\/>)+/g, preloadTags);

    const preloadsJson = JSON.stringify(preloads);
    html = html.replace(/preloads:\$R\[\d+\]=\[[^\]]*\]/g, `preloads:$R[4]=${preloadsJson}`);
    html = html.replace(/src:"\/assets\/index-[^"]+\.js"/g, `src:"${scriptSrc}"`);
    html = html.replace(/<script type="module" async="" src="\/assets\/index-[^"]+\.js"><\/script>/g, `<script type="module" async="" src="${scriptSrc}"></script>`);

    generatedHtml = html;
  }

  // 5. Save HTML
  fs.writeFileSync(rootIndexHtml, generatedHtml, 'utf8');
  console.log('[sync-build] Updated root index.html successfully.');

  if (fs.existsSync(path.join(rootDir, 'dist'))) {
    fs.writeFileSync(distIndexHtml, generatedHtml, 'utf8');
    console.log('[sync-build] Updated dist/index.html successfully.');
  }

  // 6. Verification check
  const assetRefs = [...generatedHtml.matchAll(/\/assets\/[a-zA-Z0-9_\-\.]+/g)].map(m => m[0]);
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

syncBuild().catch(err => {
  console.error('[sync-build] Fatal error during sync:', err);
  process.exit(1);
});
