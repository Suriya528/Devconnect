// Smart Route Prefetching Utility
// Allows preloading dynamic imports on link hover or focus for instant navigation

const routeMap = {
  '/dashboard': () => import('../pages/Dashboard'),
  '/feed': () => import('../pages/feed'),
  '/search': () => import('../pages/SearchPage'),
  '/profile': () => import('../pages/ProfilePage'),
  '/login': () => import('../pages/Login'),
  '/register': () => import('../pages/Register'),
};

const prefetchedRoutes = new Set();

export const prefetchRoute = (path) => {
  if (prefetchedRoutes.has(path)) return;
  
  const loader = routeMap[path];
  if (loader) {
    prefetchedRoutes.add(path);
    loader().catch((err) => {
      console.warn(`[Prefetch Error] Failed to prefetch route ${path}:`, err);
      prefetchedRoutes.delete(path);
    });
  }
};
