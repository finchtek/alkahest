
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/edit-pdf" | "/legal" | "/open-source" | "/sitemap.xml" | "/strip-exif" | "/[tool]";
		RouteParams(): {
			"/[tool]": { tool: string }
		};
		LayoutParams(): {
			"/": { tool?: string | undefined };
			"/edit-pdf": Record<string, never>;
			"/legal": Record<string, never>;
			"/open-source": Record<string, never>;
			"/sitemap.xml": Record<string, never>;
			"/strip-exif": Record<string, never>;
			"/[tool]": { tool: string }
		};
		Pathname(): "/" | "/edit-pdf" | "/legal" | "/open-source" | "/sitemap.xml" | "/strip-exif" | `/${string}` & {} | `/${string}/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/_headers" | "/favicon.svg" | "/robots.txt" | string & {};
	}
}