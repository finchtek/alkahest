import * as universal from '../entries/pages/_tool_/_page.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_tool_/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/[tool]/+page.ts";
export const imports = ["_app/immutable/nodes/3.C_mTr8_M.js","_app/immutable/chunks/ClBOwOom.js","_app/immutable/chunks/xihTtKlq.js","_app/immutable/chunks/BAQPtfRD.js","_app/immutable/chunks/SxqBhNRT.js","_app/immutable/chunks/oPPwakb_.js","_app/immutable/chunks/GJs6HKGE.js","_app/immutable/chunks/98u7rNpg.js","_app/immutable/chunks/HclGiUj8.js","_app/immutable/chunks/CxGDH2Wl.js"];
export const stylesheets = [];
export const fonts = [];
