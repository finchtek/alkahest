<script lang="ts">
	import { SITE } from '$lib/site';
</script>

<footer class="site-footer">
	<div class="wrap footer-inner">
		<div class="footer-col">
			<p class="footer-license body-text">
				Source-available under a non-compete license.
				<a href="https://finchtek.org/license.html">Read the full license →</a>
			</p>
			<p class="mt-2 text-xs text-[#6b5847]">
				All processing happens locally on your device via WebAssembly. Zero files uploaded.
			</p>
		</div>
		<div class="footer-col">
			<ul class="social-links" data-needs-input="social-links">
				<li><a href="#" class="social-placeholder" aria-label="Social link placeholder"></a></li>
				<li><a href="#" class="social-placeholder" aria-label="Social link placeholder"></a></li>
			</ul>
		</div>
		<div class="footer-col">
			<a href="https://finchtek.org/support.html">Support the Guild</a>
		</div>
	</div>
	<p class="copyright">&copy; {new Date().getFullYear()} FinchTek. {SITE.name} {SITE.byline}.</p>
</footer>
