import { o as tools } from "../../../chunks/registry.js";
//#region src/routes/[tool]/+page.ts
var prerender = true;
var entries = () => tools.map((t) => ({ tool: t.slug }));
//#endregion
export { entries, prerender };
