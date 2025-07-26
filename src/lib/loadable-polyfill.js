// Polyfill for missing Next.js loadable context in Azure
// This provides a minimal implementation to prevent build errors

export const LoadableContext = {
  report: () => {},
  preload: () => {},
};

export default LoadableContext;
