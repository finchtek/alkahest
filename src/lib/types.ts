export type Category = 'image' | 'media' | 'pdf' | '3d' | 'docs';

export interface ToolOption {
	key: string;
	label: string;
	type: 'range' | 'select' | 'text';
	/** range */
	min?: number;
	max?: number;
	step?: number;
	/** select */
	choices?: { value: string; label: string }[];
	/** text */
	placeholder?: string;
	hint?: string;
	default: string | number;
}

export interface ConvertResult {
	name: string;
	blob: Blob;
	/** name of the source file this result came from */
	from?: string;
}

export interface ProgressUpdate {
	/** 0..1 across the whole job, or -1 for indeterminate */
	ratio: number;
	/** short human label, e.g. "Converting photo.heic (2/5)" */
	label?: string;
}

export type ProgressFn = (p: ProgressUpdate) => void;

export interface ToolDef {
	slug: string;
	name: string;
	short: string;
	description: string;
	category: Category;
	/** accepted extensions, lowercase with dot */
	accept: string[];
	/** value for <input accept> */
	acceptAttr: string;
	multiple: boolean;
	minFiles?: number;
	/** needs the FFmpeg engine (shows ~31 MB one-time download note) */
	heavy?: boolean;
	options: ToolOption[];
	run: (files: File[], opts: Record<string, string | number>, progress: ProgressFn) => Promise<ConvertResult[]>;
}
