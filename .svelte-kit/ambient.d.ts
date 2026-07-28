
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const SVELTEKIT_FORK: string;
	export const NODE_ENV: string;
	export const FLATPAK_TTY_PROGRESS: string;
	export const npm_node_execpath: string;
	export const PTYXIS_VERSION: string;
	export const npm_config_global_prefix: string;
	export const PATH: string;
	export const GDMSESSION: string;
	export const npm_config_allow_scripts: string;
	export const JOURNAL_STREAM: string;
	export const ANTIGRAVITY_PROJECT_ID: string;
	export const ANTIGRAVITY_LS_VERSION: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const npm_package_json: string;
	export const XDG_RUNTIME_DIR: string;
	export const ANTIGRAVITY_TRAJECTORY_ID: string;
	export const FC_FONTATIONS: string;
	export const npm_execpath: string;
	export const npm_config_user_agent: string;
	export const MANAGERPIDFDID: string;
	export const ANTIGRAVITY_AGENT: string;
	export const QT_IM_MODULE: string;
	export const GUESTFISH_INIT: string;
	export const PAGER: string;
	export const NVM_CD_FLAGS: string;
	export const SHLVL: string;
	export const DEBUGINFOD_IMA_CERT_PATH: string;
	export const npm_lifecycle_event: string;
	export const ANTIGRAVITY_SOURCE_METADATA: string;
	export const USER: string;
	export const XDG_DATA_DIRS: string;
	export const LESSOPEN: string;
	export const TERM: string;
	export const XDG_SESSION_CLASS: string;
	export const GNOME_SETUP_DISPLAY: string;
	export const GDK_BACKEND: string;
	export const NVM_DIR: string;
	export const DESKTOP_SESSION: string;
	export const NVM_BIN: string;
	export const XMODIFIERS: string;
	export const npm_config_globalconfig: string;
	export const GUESTFISH_OUTPUT: string;
	export const MANAGERPID: string;
	export const NODE: string;
	export const GPG_TTY: string;
	export const INVOCATION_ID: string;
	export const npm_config_noproxy: string;
	export const HOSTNAME: string;
	export const HISTSIZE: string;
	export const ANTIGRAVITY_CONVERSATION_ID: string;
	export const npm_config_init_module: string;
	export const ZSH_TMUX_AUTOSTART: string;
	export const NO_AT_BRIDGE: string;
	export const npm_config_node_gyp: string;
	export const ANTIGRAVITY_AGENTAPI_EXE: string;
	export const SHELL: string;
	export const ZSH_TMUX_AUTOSTARTED: string;
	export const NVM_INC: string;
	export const GIT_PAGER: string;
	export const EDITOR: string;
	export const XDG_SESSION_EXTRA_DEVICE_ACCESS: string;
	export const QT_IM_MODULES: string;
	export const PTYXIS_PROFILE: string;
	export const COLORTERM: string;
	export const npm_config_cache: string;
	export const GUESTFISH_PS1: string;
	export const ANTIGRAVITY_LS_ADDRESS: string;
	export const CHROME_DEVTOOLS_MCP_JS: string;
	export const npm_config_loglevel: string;
	export const npm_package_name: string;
	export const DISABLE_AUTO_UPDATE: string;
	export const XDG_MENU_PREFIX: string;
	export const COLOR: string;
	export const ANTIGRAVITY_SAFECLIS_SOURCE: string;
	export const PWD: string;
	export const npm_command: string;
	export const LOGNAME: string;
	export const XDG_SESSION_DESKTOP: string;
	export const npm_config_prefix: string;
	export const GUESTFISH_RESTORE: string;
	export const DISPLAY: string;
	export const AGY_BROWSER_WS_URL: string;
	export const MOZ_GMP_PATH: string;
	export const XDG_SESSION_TYPE: string;
	export const SYSTEMD_EXEC_PID: string;
	export const npm_config_local_prefix: string;
	export const XAUTHORITY: string;
	export const GDM_LANG: string;
	export const HOME: string;
	export const MEMORY_PRESSURE_WRITE: string;
	export const USERNAME: string;
	export const LANG: string;
	export const MAIL: string;
	export const SSH_AUTH_SOCK: string;
	export const VTE_VERSION: string;
	export const LS_COLORS: string;
	export const npm_package_version: string;
	export const npm_lifecycle_script: string;
	export const npm_config_userconfig: string;
	export const MEMORY_PRESSURE_WATCH: string;
	export const WAYLAND_DISPLAY: string;
	export const _: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const ANTIGRAVITY_CSRF_TOKEN: string;
	export const DEBUGINFOD_URLS: string;
	export const INIT_CWD: string;
	export const CHROME_DESKTOP: string;
	export const npm_config_npm_version: string;
	export const HISTCONTROL: string;
	export const AGY_BROWSER_ACTIVE_PORT_FILE: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		SVELTEKIT_FORK: string;
		NODE_ENV: string;
		FLATPAK_TTY_PROGRESS: string;
		npm_node_execpath: string;
		PTYXIS_VERSION: string;
		npm_config_global_prefix: string;
		PATH: string;
		GDMSESSION: string;
		npm_config_allow_scripts: string;
		JOURNAL_STREAM: string;
		ANTIGRAVITY_PROJECT_ID: string;
		ANTIGRAVITY_LS_VERSION: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		npm_package_json: string;
		XDG_RUNTIME_DIR: string;
		ANTIGRAVITY_TRAJECTORY_ID: string;
		FC_FONTATIONS: string;
		npm_execpath: string;
		npm_config_user_agent: string;
		MANAGERPIDFDID: string;
		ANTIGRAVITY_AGENT: string;
		QT_IM_MODULE: string;
		GUESTFISH_INIT: string;
		PAGER: string;
		NVM_CD_FLAGS: string;
		SHLVL: string;
		DEBUGINFOD_IMA_CERT_PATH: string;
		npm_lifecycle_event: string;
		ANTIGRAVITY_SOURCE_METADATA: string;
		USER: string;
		XDG_DATA_DIRS: string;
		LESSOPEN: string;
		TERM: string;
		XDG_SESSION_CLASS: string;
		GNOME_SETUP_DISPLAY: string;
		GDK_BACKEND: string;
		NVM_DIR: string;
		DESKTOP_SESSION: string;
		NVM_BIN: string;
		XMODIFIERS: string;
		npm_config_globalconfig: string;
		GUESTFISH_OUTPUT: string;
		MANAGERPID: string;
		NODE: string;
		GPG_TTY: string;
		INVOCATION_ID: string;
		npm_config_noproxy: string;
		HOSTNAME: string;
		HISTSIZE: string;
		ANTIGRAVITY_CONVERSATION_ID: string;
		npm_config_init_module: string;
		ZSH_TMUX_AUTOSTART: string;
		NO_AT_BRIDGE: string;
		npm_config_node_gyp: string;
		ANTIGRAVITY_AGENTAPI_EXE: string;
		SHELL: string;
		ZSH_TMUX_AUTOSTARTED: string;
		NVM_INC: string;
		GIT_PAGER: string;
		EDITOR: string;
		XDG_SESSION_EXTRA_DEVICE_ACCESS: string;
		QT_IM_MODULES: string;
		PTYXIS_PROFILE: string;
		COLORTERM: string;
		npm_config_cache: string;
		GUESTFISH_PS1: string;
		ANTIGRAVITY_LS_ADDRESS: string;
		CHROME_DEVTOOLS_MCP_JS: string;
		npm_config_loglevel: string;
		npm_package_name: string;
		DISABLE_AUTO_UPDATE: string;
		XDG_MENU_PREFIX: string;
		COLOR: string;
		ANTIGRAVITY_SAFECLIS_SOURCE: string;
		PWD: string;
		npm_command: string;
		LOGNAME: string;
		XDG_SESSION_DESKTOP: string;
		npm_config_prefix: string;
		GUESTFISH_RESTORE: string;
		DISPLAY: string;
		AGY_BROWSER_WS_URL: string;
		MOZ_GMP_PATH: string;
		XDG_SESSION_TYPE: string;
		SYSTEMD_EXEC_PID: string;
		npm_config_local_prefix: string;
		XAUTHORITY: string;
		GDM_LANG: string;
		HOME: string;
		MEMORY_PRESSURE_WRITE: string;
		USERNAME: string;
		LANG: string;
		MAIL: string;
		SSH_AUTH_SOCK: string;
		VTE_VERSION: string;
		LS_COLORS: string;
		npm_package_version: string;
		npm_lifecycle_script: string;
		npm_config_userconfig: string;
		MEMORY_PRESSURE_WATCH: string;
		WAYLAND_DISPLAY: string;
		_: string;
		XDG_CURRENT_DESKTOP: string;
		ANTIGRAVITY_CSRF_TOKEN: string;
		DEBUGINFOD_URLS: string;
		INIT_CWD: string;
		CHROME_DESKTOP: string;
		npm_config_npm_version: string;
		HISTCONTROL: string;
		AGY_BROWSER_ACTIVE_PORT_FILE: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
