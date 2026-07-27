import * as universal from '../entries/pages/_tool_/_page.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_tool_/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/[tool]/+page.ts";
export const imports = ["_app/immutable/nodes/3.AZhkO2Ws.js","_app/immutable/chunks/ClBOwOom.js","_app/immutable/chunks/xihTtKlq.js","_app/immutable/chunks/BAQPtfRD.js","_app/immutable/chunks/DHHEVus2.js","_app/immutable/chunks/CkDhGWCF.js","_app/immutable/chunks/_XxRy-9r.js","_app/immutable/chunks/BOAwjyVJ.js","_app/immutable/chunks/HclGiUj8.js","_app/immutable/chunks/B6-_b5ct.js"];
export const stylesheets = [];
export const fonts = [];
