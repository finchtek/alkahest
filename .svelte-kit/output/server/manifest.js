export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["_headers","favicon.svg","robots.txt"]),
	mimeTypes: {".svg":"image/svg+xml",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.BxEkWyd6.js",app:"_app/immutable/entry/app.BJ3tCdXR.js",imports:["_app/immutable/entry/start.BxEkWyd6.js","_app/immutable/chunks/CkDhGWCF.js","_app/immutable/chunks/ClBOwOom.js","_app/immutable/entry/app.BJ3tCdXR.js","_app/immutable/chunks/ClBOwOom.js","_app/immutable/chunks/HclGiUj8.js","_app/immutable/chunks/xihTtKlq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/","/edit-pdf","/legal","/open-source","/sitemap.xml","/strip-exif","/heic-to-jpg","/heic-to-png","/webp-to-png","/webp-to-jpg","/png-to-webp","/jpg-to-webp","/svg-optimizer","/mp4-to-mp3","/video-to-wav","/mov-to-mp4","/video-to-gif","/merge-pdf","/split-pdf","/pdf-to-images","/images-to-pdf","/rotate-pdf","/delete-pages","/watermark-pdf","/add-page-numbers","/image-converter","/tiff-to-png","/png-to-ico","/audio-converter","/subtitle-convert","/fbx-to-glb","/obj-to-glb","/stl-to-glb","/model-to-stl","/extract-archive","/docx-to-html","/xlsx-to-csv","/files-to-zip","/html-to-markdown","/csv-to-json","/json-to-csv"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
