/**
 * Hand-off buffer for files dropped on the landing page before client-side
 * navigation to the right tool. Module scope survives SPA navigation.
 */
let pending: File[] | null = null;

export function setPending(files: File[]): void {
	pending = files;
}

export function takePending(): File[] | null {
	const p = pending;
	pending = null;
	return p;
}
