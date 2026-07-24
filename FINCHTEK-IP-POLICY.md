# FinchTek IP & Licensing Policy

**Version 1.0 — last updated 2026-07-23**

This is Finch Tek LLC's (operating as "FinchTek" in product/marketing copy) internal playbook for how every product it ships (Alkahest today, Pulse next, anything after that) handles licensing, naming, third-party code, and the consumer-facing legal pages. The goal is one consistent policy applied every time, not a one-off decision per product. Casual brand copy (site footers, taglines, byline text) can keep using the stylized "finchtek" form — the exact registered name only has to appear in places that carry legal weight: copyright notices, LICENSE files, and legal pages.

**This is not legal advice.** It's a business/operations framework written by an AI assistant, not an attorney. Three specific pieces should get real legal review before you rely on them in a dispute: trademark filings, the enforceability of the Terms of Service in your jurisdiction, and confirming this policy actually matches how your LLC is structured. Everything else here is safe to apply directly.

---

## 1. Entity and copyright ownership

The registered legal name is **Finch Tek LLC** — that's the exact string every legal notice should use, even though product/marketing copy stylizes it as "finchtek" or "FinchTek." That's the foundation everything else sits on, so it's worth getting exactly right rather than assumed right.

- Every copyright notice, every LICENSE file, every file header, and any legal page should say **"Finch Tek LLC"** verbatim — not "FinchTek," not "Finch Tek," not any other shortened or respaced version. A copyright notice naming the wrong entity is a real gap: it can weaken your ability to enforce the license later, because it becomes ambiguous whether the individual founder or the company owns the work. (Alkahest's LICENSE, CONTRIBUTING.md, and `/legal` page have all been corrected to this exact string.)
- Practically: products, trademarks, and domains should be owned by the LLC, not by you personally. Contracts (Ko-fi, Cloudflare, domain registrars) should be under the LLC's name and its own bank account/EIN, not blended with personal accounts. This is what actually keeps the liability shield intact — an LLC that exists on paper but commingles funds with a personal account is much easier to "pierce" in a lawsuit.
- Action: confirm the exact registered legal name and use it verbatim across every product's LICENSE/NOTICES. If Alkahest's current notice says something other than the exact registered name, that's the first fix to make.

## 2. Default source license: PolyForm Shield 1.0.0

Every FinchTek product's source code ships under PolyForm Shield 1.0.0 by default — source available, noncompete clause, unless there's a specific strategic reason to deviate (e.g. a library meant for others to build on, or a deliberate full-open-source play for community growth, see §8).

Every repo needs all of the following, not just some of them:

1. **`LICENSE`** — the full, verbatim PolyForm Shield 1.0.0 text (never a paraphrase or AI-drafted summary standing in for it), with a filled-in `Required Notice:` line using the exact legal entity name.
2. **A real `Licensor Line of Business` notice** — not just the example line buried inside the license text, but an actual notice shipped with the software, since this is what activates the Discontinued Products protection under the license. Because this is a company-wide policy, keep one master list of every current FinchTek product line and include the *same* list in every repo — that way, if one product is ever discontinued, the noncompete clause still holds against that whole line of business, and every product cross-references the others instead of protecting itself in isolation.
3. **`NOTICES.md`** — the third-party attribution table, plus a dedicated written section for any dependency that has its own specific attribution requirements beyond a table row (FFmpeg's required sentence is the template case — see §3).
4. **`package.json`** — `"license": "SEE LICENSE IN LICENSE"`.
5. **Site copy** — footer, README, hero copy, launch posts: always "source available," never "open source," unless the product is genuinely OSI-licensed. This single word choice is the difference between accurate and misleading.
6. **An `/open-source` (or equivalent) page** on the live site, listing every dependency, its license, and linking the LICENSE.

## 3. Third-party dependency policy

This is the policy that would have caught the original FFmpeg/GPL problem before it became a problem.

- **Before adding any dependency** — especially a large compiled or WASM library — check its license for reciprocal ("copyleft") obligations. Rule of thumb:
  - MIT / BSD / Apache-2.0 / ISC — bundle freely, just attribute.
  - LGPL — safe to bundle as an unmodified, dynamically-replaceable component, with attribution. Fine for the kind of vendored WASM builds Alkahest uses.
  - GPL / AGPL — do **not** bundle directly into a source-available product. Either exclude the GPL-triggering pieces (the x264/x265 removal pattern), isolate it behind a separate process/service boundary, or don't use it.
- **Attribution has to be exact, not paraphrased**, when a license specifies required wording. FFmpeg's legal page requires a specific sentence on any page with download/conversion functionality ("This software uses code of FFmpeg licensed under the LGPLv2.1 and its source can be downloaded here," linked) — a general "FFmpeg is a trademark of..." note doesn't satisfy that on its own. Any dependency with a documented attribution requirement gets that exact text copied in, verbatim.
- **`NOTICES.md` gets updated as part of adding the dependency**, not after the fact — treat it as part of the same commit/PR, not a cleanup task for later.

## 4. Trademark and naming clearance

This is the lesson from Transmute colliding with an existing product of the same name in the same category.

- **Before writing code, buying a domain, or announcing anywhere**, for any new product name (or a change to the FinchTek company name itself), run all three of:
  1. A USPTO TESS trademark search.
  2. A plain web search for the same name in the same or an adjacent industry.
  3. A domain/social-handle availability check.
- This is a five-minute check that prevents months of brand equity being built on a name that has to be abandoned later — do it first, not after the site is live.
- Once a product has real revenue or traction, consider actually filing a federal trademark application — budget roughly $250–350 per class in USPTO fees, plus an attorney if you want one to handle it. This is what makes brand protection actually enforceable instead of just "probably fine." Worth doing for the FinchTek house brand itself, not only individual product names.

## 5. Contribution policy

Decide this explicitly for every repo, before it's public, rather than by default:

- **If external pull requests are accepted**, require a CLA (Contributor License Agreement) — even a lightweight one, like a DCO-style sign-off line or a CLA-assistant bot on the repo. This keeps contributed code clearly licensed to FinchTek on compatible terms, so the noncompete protection isn't diluted or made ambiguous by code FinchTek doesn't fully own.
- **If external PRs are not wanted**, say so plainly in a `CONTRIBUTING.md` ("issues and forks welcome, PRs not accepted") so it's not left ambiguous or awkward when someone opens one.

## 6. Terms of Service and Privacy Policy (separate from the code license)

This is a distinction worth being precise about: **PolyForm Shield governs reuse of the source code. It says nothing about someone using the live website as a consumer.** Those need their own, separate legal pages.

- Every FinchTek product's live site needs a standard Terms of Service and Privacy Policy, reusable nearly verbatim across products with just the name swapped.
- This matters especially here because the marketing claim is "zero uploads, zero tracking" — a claim like that is exactly the kind of thing that should be backed by a published, stated policy, both for user trust and because privacy regulations (GDPR/CCPA-style expectations) generally expect a site to state what it does and doesn't collect, even when the honest answer is "nothing."
- Standard ToS should cover: an as-is/no-warranty disclaimer, a limitation of liability, a governing-law/jurisdiction clause (matching wherever the LLC is formed), and an explicit note that the user is responsible for their own files/output — no guarantee of lossless conversion or liability for a corrupted or lost result.

## 7. New-product launch checklist

Run this in full for Pulse, and every product after it:

- [ ] Trademark/name clearance (TESS + web + domain) before any branding investment
- [ ] `LICENSE` — PolyForm Shield template, correct legal entity name, real Licensor Line of Business notice
- [ ] `NOTICES.md` — full third-party table + any dependency-specific required attribution text
- [ ] `package.json` license field set correctly
- [ ] Site footer/copy says "source available," never "open source," unless it's genuinely OSI-licensed
- [ ] `/open-source` (or equivalent) page live on the site
- [ ] Terms of Service + Privacy Policy page live on the site
- [ ] `CONTRIBUTING.md` stating the PR/CLA stance
- [ ] Dependency license audit repeated every time a new bundled library (especially compiled/WASM) is added

## 8. If and when to go fully open source

Keep the asymmetry in mind: relicensing from PolyForm Shield down to something permissive like MIT later is trivial and tends to be well received as a "we're going open source" community moment. Going the other direction — permissive back to restrictive — is not legally possible for anything already released under the permissive terms. Treat full open-sourcing as a lever available to pull later for goodwill and growth, not a decision to make (or reverse) on day one.

## 9. Disclaimer, repeated

This document is a business policy framework, not legal advice. Get a real attorney to look specifically at trademark filings before you file, at the Terms of Service before you'd want to actually enforce it, and at whether this matches your LLC's actual formation documents. Everything else here is safe to apply as-is and repeat for every product.
