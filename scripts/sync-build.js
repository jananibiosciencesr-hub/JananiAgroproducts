const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

async function syncBuild() {
  console.log('[sync-build] Starting asset synchronization...');

  const rootDir = path.resolve(__dirname, '..');

  // Regenerate XML sitemaps before copying public assets
  const generateSitemapsScript = path.join(rootDir, 'scratch', 'generate-sitemaps.cjs');
  if (fs.existsSync(generateSitemapsScript)) {
    try {
      require(generateSitemapsScript);
      console.log('[sync-build] Generated latest XML sitemaps via generate-sitemaps.cjs');
    } catch (e) {
      console.warn('[sync-build] Warning generating sitemaps:', e.message);
    }
  }

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

  // 1. Locate current CSS and JS entry bundles
  const clientFiles = fs.readdirSync(clientAssetsDir);
  const cssFile = clientFiles.find(f => f.startsWith('styles-') && f.endsWith('.css'));
  const jsEntryFile = clientFiles.find(f => f.startsWith('index-') && f.endsWith('.js'));

  if (!cssFile || !jsEntryFile) {
    console.error('[sync-build] Error: Could not locate styles-*.css or index-*.js in client assets.');
    process.exit(1);
  }
  console.log(`[sync-build] Current CSS: ${cssFile}`);
  console.log(`[sync-build] Current JS Entry: ${jsEntryFile}`);

  // 2. Synchronize assets:
  // Copy all client files to root assets/ and dist/assets/
  fs.mkdirSync(rootAssetsDir, { recursive: true });
  fs.cpSync(clientAssetsDir, rootAssetsDir, { recursive: true });

  if (fs.existsSync(path.join(rootDir, 'dist'))) {
    fs.mkdirSync(distAssetsDir, { recursive: true });
    fs.cpSync(clientAssetsDir, distAssetsDir, { recursive: true });
  }

  // Resilient CSS Fallbacks:
  // Create /assets/styles.css and preserve previous known hashes so cached pages never 404
  const fallbackCssNames = [
    'styles.css',
    'styles-DFfgPKmU.css',
    'styles-Ct87HUqo.css',
    'styles-D59zbkOm.css',
    'styles-latest.css'
  ];
  for (const fallbackName of fallbackCssNames) {
    try {
      fs.copyFileSync(path.join(clientAssetsDir, cssFile), path.join(rootAssetsDir, fallbackName));
      if (fs.existsSync(distAssetsDir)) {
        fs.copyFileSync(path.join(clientAssetsDir, cssFile), path.join(distAssetsDir, fallbackName));
      }
    } catch (e) {}
  }
  console.log(`[sync-build] Created CSS fallback aliases: ${fallbackCssNames.join(', ')}`);

  // 3. Synchronize public static assets to root directories for Hostinger static serving
  const publicDirs = [
    { src: path.join(rootDir, 'frontend', 'public', 'products'), dest: path.join(rootDir, 'products') },
    { src: path.join(rootDir, 'frontend', 'public', 'banners'), dest: path.join(rootDir, 'banners') },
    { src: path.join(rootDir, 'frontend', 'public', 'images'), dest: path.join(rootDir, 'images') }
  ];
  for (const { src, dest } of publicDirs) {
    if (fs.existsSync(src)) {
      fs.mkdirSync(dest, { recursive: true });
      fs.cpSync(src, dest, { recursive: true });
    }
  }

  // Videos sync
  const publicVideosDir = path.join(rootDir, 'frontend', 'public', 'videos');
  const rootVideosDir = path.join(rootDir, 'videos');
  if (fs.existsSync(publicVideosDir)) {
    fs.mkdirSync(rootVideosDir, { recursive: true });
    fs.cpSync(publicVideosDir, rootVideosDir, { recursive: true });
  } else if (fs.existsSync(rootVideosDir)) {
    fs.mkdirSync(publicVideosDir, { recursive: true });
    fs.cpSync(rootVideosDir, publicVideosDir, { recursive: true });
  }

  // Sync PHP files from backend/php/ (source of truth) to frontend/public/ and rootDir
  for (const phpFile of ['api.php', 'db_init.php']) {
    const backendSrc = path.join(rootDir, 'backend', 'php', phpFile);
    const publicDest = path.join(rootDir, 'frontend', 'public', phpFile);
    const rootDest = path.join(rootDir, phpFile);
    if (fs.existsSync(backendSrc)) {
      fs.copyFileSync(backendSrc, publicDest);
      fs.copyFileSync(backendSrc, rootDest);
    } else if (fs.existsSync(publicDest)) {
      fs.copyFileSync(publicDest, rootDest);
    }
  }

  // Sync robots, sitemaps, google verification
  const publicDir = path.join(rootDir, 'frontend', 'public');
  if (fs.existsSync(publicDir)) {
    const publicFiles = fs.readdirSync(publicDir);
    const sitemapsAndRobots = publicFiles.filter(f => (f.startsWith('sitemap') && f.endsWith('.xml')) || f === 'robots.txt' || (f.startsWith('google') && f.endsWith('.html')));
    for (const f of sitemapsAndRobots) {
      const src = path.join(publicDir, f);
      fs.copyFileSync(src, path.join(rootDir, f));
      if (fs.existsSync(path.join(rootDir, 'dist'))) {
        fs.copyFileSync(src, path.join(rootDir, 'dist', f));
      }
    }
  }

  // 4. Build comprehensive routes list dynamically
  const routes = [
    { path: '/', destDir: null },
    { path: '/admin', destDir: 'admin' },
    { path: '/login', destDir: 'login' },
    { path: '/cart', destDir: 'cart' },
    { path: '/wishlist', destDir: 'wishlist' },
    { path: '/checkout', destDir: 'checkout' },
    { path: '/dashboard', destDir: 'dashboard' },
    { path: '/faq', destDir: 'faq' },
    { path: '/about', destDir: 'about' },
    { path: '/contact', destDir: 'contact' },
    { path: '/services', destDir: 'services' },
        { path: '/become-distributor', destDir: 'become-distributor' },
    { path: '/privacy', destDir: 'privacy' },
    { path: '/terms', destDir: 'terms' },
    { path: '/shipping-policy', destDir: 'shipping-policy' },
    { path: '/return-policy', destDir: 'return-policy' },
    { path: '/categories', destDir: 'categories' },
    { path: '/products', destDir: 'products' },
    { path: '/blog', destDir: 'blog' },
  ];

  // Dynamically add subdirectories in categories, products, crops, diseases, blog
  const subRouteFolders = ['categories', 'products', 'crops', 'diseases', 'blog'];
  for (const folder of subRouteFolders) {
    const parentDir = path.join(rootDir, folder);
    if (fs.existsSync(parentDir)) {
      const subEntries = fs.readdirSync(parentDir, { withFileTypes: true });
      for (const entry of subEntries) {
        if (entry.isDirectory()) {
          const subPath = `/${folder}/${entry.name}`;
          const dest = path.join(folder, entry.name);
          if (!routes.some(r => r.path === subPath)) {
            routes.push({ path: subPath, destDir: dest });
          }
        }
      }
    }
  }
  console.log(`[sync-build] Discovered ${routes.length} total routes for SSR pre-rendering`);

  // 5. Render fresh SSR HTML using server.js for all routes
  let rootHtml = null;
  if (fs.existsSync(serverJsFile)) {
    try {
      const serverUrl = pathToFileURL(serverJsFile).href;
      const serverModule = await import(serverUrl);
      if (serverModule?.default?.fetch) {
        for (const route of routes) {
          try {
            const req = new Request(`http://localhost${route.path}`);
            let res = await serverModule.default.fetch(req);
            if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
              const loc = res.headers.get('location');
              const targetUrl = loc.startsWith('http') ? loc : `http://localhost${loc}`;
              res = await serverModule.default.fetch(new Request(targetUrl));
            }
            if (res.ok) {
              const html = await res.text();
              if (route.destDir === null) {
                rootHtml = html;
                fs.writeFileSync(rootIndexHtml, html, 'utf8');
                if (fs.existsSync(path.join(rootDir, 'dist'))) {
                  fs.writeFileSync(distIndexHtml, html, 'utf8');
                }
              } else {
                const targetDir = path.join(rootDir, route.destDir);
                fs.mkdirSync(targetDir, { recursive: true });
                fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');

                const distTargetDir = path.join(rootDir, 'dist', route.destDir);
                fs.mkdirSync(distTargetDir, { recursive: true });
                fs.writeFileSync(path.join(distTargetDir, 'index.html'), html, 'utf8');
              }
            }
          } catch (rErr) {
            console.warn(`[sync-build] Could not pre-render ${route.path}:`, rErr.message);
          }
        }
        console.log(`[sync-build] Pre-rendered all ${routes.length} routes successfully.`);
      }
    } catch (ssrErr) {
      console.warn('[sync-build] Warning: SSR execution encountered error:', ssrErr.message);
    }
  }

  // 6. Universal HTML Sweep: Update EVERY index.html in the entire repository
  // to ensure 100% of HTML files reference the active CSS & JS bundle hashes!
  function sweepHtmlFiles(dir, list = []) {
    if (!fs.existsSync(dir)) return list;
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      if (item.name === 'node_modules' || item.name === '.git' || item.name === 'frontend') continue;
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        sweepHtmlFiles(full, list);
      } else if (item.name === 'index.html') {
        list.push(full);
      }
    }
    return list;
  }

  const allHtmlFiles = sweepHtmlFiles(rootDir);
  let updatedCount = 0;
  for (const htmlPath of allHtmlFiles) {
    try {
      let content = fs.readFileSync(htmlPath, 'utf8');
      let changed = false;

      // Ensure CSS stylesheet link points to active cssFile with absolute path
      if (content.includes('styles-') && !content.includes(cssFile)) {
        content = content.replace(/\/assets\/styles-[a-zA-Z0-9_-]+\.css/g, `/assets/${cssFile}`);
        content = content.replace(/(?<!\/)assets\/styles-[a-zA-Z0-9_-]+\.css/g, `/assets/${cssFile}`);
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(htmlPath, content, 'utf8');
        updatedCount++;
      }
    } catch (e) {}
  }
  console.log(`[sync-build] Universal sweep updated ${updatedCount} HTML files to current CSS ${cssFile} (out of ${allHtmlFiles.length} total)`);
  console.log('[sync-build] Synchronization complete.');
}

syncBuild().catch(err => {
  console.error('[sync-build] Fatal error during sync:', err);
  process.exit(1);
});
