import type { ConvertResult, ProgressFn } from '$lib/types';
import { extOf, replaceExt } from '$lib/util';

type AnyObject3D = import('three').Object3D;

const TEX_KEYS = [
	'map',
	'normalMap',
	'roughnessMap',
	'metalnessMap',
	'aoMap',
	'emissiveMap',
	'specularMap',
	'bumpMap',
	'alphaMap',
	'lightMap',
	'envMap'
] as const;

/**
 * Strip texture references that have no actual image data. FBX and OBJ files
 * routinely point at texture files that were never sent along, and exporters
 * choke on those dangling references. Geometry and material colors survive.
 */
function cleanMaterials(root: AnyObject3D): void {
	root.traverse((obj) => {
		const holder = obj as unknown as { material?: unknown };
		if (!holder.material) return;
		const mats = Array.isArray(holder.material) ? holder.material : [holder.material];
		for (const m of mats as Record<string, { image?: { width?: number; data?: unknown } } | null>[]) {
			for (const k of TEX_KEYS) {
				const tex = m[k];
				if (tex && !(tex.image && (tex.image.width || tex.image.data))) m[k] = null;
			}
			(m as { needsUpdate?: boolean }).needsUpdate = true;
		}
	});
}

async function loadModel(file: File): Promise<AnyObject3D> {
	const ext = extOf(file.name);
	const three = await import('three');
	if (ext === 'fbx') {
		const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
		return new FBXLoader().parse(await file.arrayBuffer(), '');
	}
	if (ext === 'obj') {
		const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
		return new OBJLoader().parse(await file.text());
	}
	if (ext === 'stl') {
		const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js');
		const geom = new STLLoader().parse(await file.arrayBuffer());
		geom.computeVertexNormals();
		return new three.Mesh(geom, new three.MeshStandardMaterial({ color: 0xb8a88f }));
	}
	if (ext === 'glb' || ext === 'gltf') {
		const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
		const gltf = await new GLTFLoader().parseAsync(await file.arrayBuffer(), '');
		return gltf.scene;
	}
	throw new Error(`unsupported model format: .${ext}`);
}

export async function modelsToGlb(
	files: File[],
	_opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
	const results: ConvertResult[] = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({ ratio: i / files.length, label: `transmuting ${f.name} (${i + 1}/${files.length})` });
		const object = await loadModel(f);
		cleanMaterials(object);
		const glb = (await new GLTFExporter().parseAsync(object, { binary: true })) as ArrayBuffer;
		if (!glb || glb.byteLength === 0) throw new Error('exported GLB is empty');
		results.push({
			name: replaceExt(f.name, 'glb'),
			blob: new Blob([glb], { type: 'model/gltf-binary' }),
			from: f.name
		});
	}
	progress({ ratio: 1 });
	return results;
}

export async function modelsToStl(
	files: File[],
	_opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const { STLExporter } = await import('three/examples/jsm/exporters/STLExporter.js');
	const results: ConvertResult[] = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({ ratio: i / files.length, label: `transmuting ${f.name} (${i + 1}/${files.length})` });
		const object = await loadModel(f);
		cleanMaterials(object);
		object.updateMatrixWorld(true);
		const stl = new STLExporter().parse(object as never, { binary: true }) as DataView;
		if (!stl || stl.byteLength < 84) throw new Error('exported STL is empty');
		results.push({
			name: replaceExt(f.name, 'stl'),
			blob: new Blob([stl as unknown as BlobPart], { type: 'model/stl' }),
			from: f.name
		});
	}
	progress({ ratio: 1 });
	return results;
}
