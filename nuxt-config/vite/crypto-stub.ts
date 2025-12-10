/**
 * Empty stub for Node.js crypto module.
 *
 * This stub breaks the static import chain from CommonJS packages (crypto-js, elliptic)
 * to cosmjs. These packages have fallback code like:
 *   if (!globalThis.crypto) { require('crypto') }
 *
 * Rollup resolves this to cosmjs's crypto module, creating a static import even though
 * the fallback is never used at runtime (browsers have native globalThis.crypto).
 *
 * By aliasing 'crypto' to this empty stub, we prevent the eager loading of cosmjs (~2.3MB)
 * and allow it to be properly lazy-loaded only when wallet features are needed.
 */
export default {}
