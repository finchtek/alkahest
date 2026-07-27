import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.jIDymDr-.js","_app/immutable/chunks/ClBOwOom.js","_app/immutable/chunks/xihTtKlq.js","_app/immutable/chunks/BOrQ4Er-.js","_app/immutable/chunks/BAQPtfRD.js"];
export const stylesheets = ["_app/immutable/assets/0.CX4K_r77.css"];
export const fonts = [];
