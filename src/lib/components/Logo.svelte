<script lang="ts">
	let { size = 28 }: { size?: number } = $props();
	// unique gradient id per instance so multiple logos on a page don't collide
	const gid = `ak-g-${Math.random().toString(36).slice(2, 8)}`;
</script>

<!-- alkahest mark: a guild flask. the potion pours blue, shine, pink -->
<svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
	<defs>
		<linearGradient id={gid} x1="11" y1="26" x2="21" y2="15" gradientUnits="userSpaceOnUse">
			<stop stop-color="#5BCEFA" />
			<stop offset="1" stop-color="#F5A9B8" />
		</linearGradient>
	</defs>
	<rect width="32" height="32" rx="7" fill="#120d08" />
	<rect x="0.5" y="0.5" width="31" height="31" rx="6.5" stroke="#e6d7b8" stroke-opacity="0.14" />
	<circle cx="16" cy="20.5" r="5.4" fill="url(#{gid})" />
	<circle cx="13.8" cy="19" r="1" fill="#ffffff" fill-opacity="0.85" />
	<path
		d="M13 5.5 h6 M14.5 5.5 v6.8 c-3.4 1.5 -5.7 4.3 -5.7 7.7 a7.2 7.2 0 0 0 14.4 0 c0 -3.4 -2.3 -6.2 -5.7 -7.7 v-6.8"
		stroke="#e6d7b8"
		stroke-width="1.6"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<circle cx="20.6" cy="8.4" r="0.9" fill="#F5A9B8" />
	<circle cx="11.6" cy="7.2" r="0.7" fill="#5BCEFA" />
	<path d="M26 11 l0.8 1.7 1.7 0.8 -1.7 0.8 -0.8 1.7 -0.8 -1.7 -1.7 -0.8 1.7 -0.8 z" fill="#e5a86c" />
</svg>
