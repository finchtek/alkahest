<script lang="ts">
	import { SITE } from '$lib/site';
</script>

<header class="site-header">
	<div class="wrap header-inner">
		<a href="https://finchtek.org/index.html" class="logo">
			<svg class="logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
			<span>FinchTek</span>
		</a>
		<nav class="primary-nav" aria-label="Primary">
			<ul>
				<li><a href="/#tools" class="btn"><span>Tools</span></a></li>
				<li><a href="https://finchtek.org/projects.html" rel="external" data-sveltekit-reload class="btn"><span>Guild Suite</span></a></li>
				<li><a href="https://pulse.finchtek.org" rel="external" data-sveltekit-reload class="btn"><span>Pulse Notary</span></a></li>
				<li>
					<a
						href={SITE.tipUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-primary"
					>
						<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
							<path
								d="M12 21s-7.5-4.7-10-9.3C.4 8.6 2.2 5 5.7 5c2 0 3.4 1.1 4.3 2.4h4c.9-1.3 2.3-2.4 4.3-2.4 3.5 0 5.3 3.6 3.7 6.7C19.5 16.3 12 21 12 21Z"
							/>
						</svg>
						<span>Tip Jar</span>
					</a>
				</li>
			</ul>
		</nav>
	</div>
</header>
