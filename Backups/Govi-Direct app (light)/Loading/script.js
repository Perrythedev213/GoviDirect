
const PRELOAD_CACHE_NAME = 'goviDirect-app-v1';

let loadingStarted = false;
let loadingElements = null;

function getLoadingElements() {
  return {
    status: document.getElementById('loading-status-text'),
    progress: document.querySelector('.loading-progress')
  };
}

function setStatus(message) {
  const status = document.getElementById('loading-status-text');

  if (!status) {
    return;
  }

  status.classList.remove('status-fade-in');
  status.classList.add('status-fade-out');

  setTimeout(() => {
    const currentStatus = document.getElementById(
      'loading-status-text'
    );

    if (!currentStatus) {
      return;
    }

    currentStatus.textContent = message;

    currentStatus.classList.remove('status-fade-out');
    currentStatus.classList.add('status-fade-in');
  }, 150);
}

function setProgress(percent) {
  const progress = document.querySelector('.loading-progress');

  if (!progress) {
    return;
  }

  const safePercent = Math.max(
    0,
    Math.min(100, percent)
  );

  progress.style.animation = 'none';
  progress.style.left = '0';
  progress.style.width = `${safePercent}%`;
  progress.style.transition = 'width 0.25s ease';
}

function getAllAssets() {
  const manifest =
    window.GoviDirectPreloadManifest;

  if (!manifest) {
    return [];
  }

  const assets = [];

  manifest.pages.forEach(page => {
    page.assets.forEach(asset => {
      if (!assets.includes(asset)) {
        assets.push(asset);
      }
    });
  });

  manifest.sharedAssets.forEach(asset => {
    if (!assets.includes(asset)) {
      assets.push(asset);
    }
  });

  return assets;
}

function getAbsoluteUrl(path) {
  return new URL(
    `../${path}`,
    window.location.href
  ).href;
}

async function preloadAsset(cache, path) {
  const url = getAbsoluteUrl(path);

  try {
    const existing = await cache.match(url);

    if (existing) {
      return {
        path,
        success: true,
        cached: true
      };
    }

    const response = await fetch(url, {
      cache: 'reload'
    });

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    await cache.put(url, response.clone());

    return {
      path,
      success: true,
      cached: false
    };
  } catch (error) {
    console.warn(
      `Failed to preload ${path}:`,
      error
    );

    return {
      path,
      success: false,
      cached: false
    };
  }
}

async function preloadImages() {
  const manifest =
    window.GoviDirectPreloadManifest;

  if (!manifest) {
    return;
  }

  const imageUrls = new Set();

  document
    .querySelectorAll('img[src]')
    .forEach(image => {
      if (image.src) {
        imageUrls.add(image.src);
      }
    });

  for (const page of manifest.pages) {
    try {
      const url = getAbsoluteUrl(page.url);

      const response = await fetch(url);

      if (!response.ok) {
        continue;
      }

      const html = await response.text();

      const parser =
        new DOMParser();

      const documentElement =
        parser.parseFromString(
          html,
          'text/html'
        );

      documentElement
        .querySelectorAll('img[src]')
        .forEach(image => {
          const src =
            image.getAttribute('src');

          if (!src) {
            return;
          }

          try {
            imageUrls.add(
              new URL(
                src,
                url
              ).href
            );
          } catch (error) {
            console.warn(
              'Invalid image URL:',
              src
            );
          }
        });
    } catch (error) {
      console.warn(
        `Could not scan images from ${page.url}:`,
        error
      );
    }
  }

  const images =
    Array.from(imageUrls);

  await Promise.all(
    images.map(
      src =>
        new Promise(resolve => {
          const image =
            new Image();

          image.onload = resolve;
          image.onerror = resolve;
          image.src = src;
        })
    )
  );
}

async function preloadApp() {
  const manifest =
    window.GoviDirectPreloadManifest;

  if (!manifest) {
    throw new Error(
      'GoviDirect preload manifest not found.'
    );
  }

  const assets =
    getAllAssets();

  if (!assets.length) {
    return;
  }

  let cache;

  if ('caches' in window) {
    cache = await caches.open(
      PRELOAD_CACHE_NAME
    );
  }

  let completed = 0;

  setStatus(
    'Preparing GoviDirect...'
  );

  setProgress(0);

  for (const asset of assets) {
    setStatus(
      `Loading ${getAssetName(asset)}`
    );

    if (cache) {
      await preloadAsset(
        cache,
        asset
      );
    } else {
      try {
        await fetch(
          getAbsoluteUrl(asset),
          {
            cache: 'reload'
          }
        );
      } catch (error) {
        console.warn(
          `Failed to fetch ${asset}:`,
          error
        );
      }
    }

    completed++;

    setProgress(
      Math.round(
        (completed / assets.length) *
          90
      )
    );
  }

  setStatus(
    'Preparing images...'
  );

  await preloadImages();

  setProgress(100);

  setStatus(
    'GoviDirect is ready'
  );
}

function getAssetName(path) {
  const parts =
    path.split('/');

  const filename =
    parts[parts.length - 1];

  if (
    filename ===
    'index.html'
  ) {
    return `${parts[0]} page`;
  }

  if (
    filename ===
    'notifications.js'
  ) {
    return 'notifications';
  }

  if (
    filename ===
    'router.js'
  ) {
    return 'navigation';
  }

  if (
    filename ===
    'script.js'
  ) {
    return `${parts[0]} functionality`;
  }

  if (
    filename ===
    'styles.css'
  ) {
    return `${parts[0]} styles`;
  }

  return filename;
}

async function waitForAppReady() {
  try {
    await preloadApp();
  } catch (error) {
    console.error(
      'GoviDirect preload failed:',
      error
    );

    setStatus(
      'Starting GoviDirect...'
    );

    setProgress(100);
  }

  await new Promise(
    resolve =>
      setTimeout(resolve, 350)
  );

  window.location.replace(
    '../Login/index.html'
  );
}

function init() {
  if (loadingStarted) {
    return;
  }

  loadingStarted = true;

  loadingElements =
    getLoadingElements();

  waitForAppReady();
}

if (
  document.readyState ===
  'loading'
) {
  document.addEventListener(
    'DOMContentLoaded',
    init,
    {
      once: true
    }
  );
} else {
  init();
}