import type { EntryGenerator } from './$types';
import { tools } from '$lib/registry';

export const prerender = true;

export const entries: EntryGenerator = () => tools.map((t) => ({ tool: t.slug }));
