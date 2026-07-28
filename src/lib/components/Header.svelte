<script lang="ts">
	import Logo from './Logo.svelte';
</script>

<header class="site-header">
	<div class="wrap header-inner">
		<a href="https://finchtek.org/index.html" class="logo alkahest-logo">
			<Logo size={28} />
			<span class="logo-title">FinchTek Alkahest</span>
		</a>
		<nav class="primary-nav" aria-label="Primary">
			<ul>
				<li>
					<a href="https://finchtek.org/index.html">
						<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
						<span>Home</span>
					</a>
				</li>
				<li>
					<a href="https://finchtek.org/projects.html" aria-current="page">
						<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
						<span>Projects</span>
					</a>
				</li>
				<li>
					<a href="https://finchtek.org/about.html">
						<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6.5 6H20"/></svg>
						<span>About</span>
					</a>
				</li>
				<li>
					<a href="https://finchtek.org/join.html">
						<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 1 0 7.75"/></svg>
						<span>Join Us</span>
					</a>
				</li>
				<li>
					<a href="https://finchtek.org/support.html">
						<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
						<span>Support</span>
					</a>
				</li>
			</ul>
		</nav>
	</div>
</header>
