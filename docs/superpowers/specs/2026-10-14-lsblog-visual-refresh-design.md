# lsBlog Visual Refresh Design

Date: 2026-10-14

## Objective

Refresh the Hugo/PaperMod blog so it clearly belongs to the same visual family as Shuo Lv's academic homepage without turning the blog into a copy of that site. Preserve the blog's core information architecture and reading features while giving it a more intentional research-notebook identity.

The primary audience is readers moving between research summaries, personal experience, and life notes. The home page's single job is to help them understand the scope of the notebook and select the next article to read.

## Approved Direction

Use the approved "Research Notebook Index" direction:

- Keep PaperMod's Categories, Tags, Archives, Search, reading-time metadata, code support, post navigation, and light/dark themes.
- Use an editorial research-notebook layout for the main content.
- Add a desktop category sidebar that acts as a content map.
- Convert that sidebar into a horizontally scrollable category filter on narrow screens.
- Treat the personal homepage as a sibling destination, not as a template to reproduce.

## Visual System

### Color

The palette derives from the personal homepage and its paper-feed components:

- Research blue: `#224b8d` for links, active navigation, focus states, and the header rule.
- Paper: `#fbfcfe` for the page background.
- Surface: `#ffffff` for reading surfaces and navigation.
- Ink: `#29313a` for primary text.
- Muted ink: `#717b86` for summaries and metadata.
- Rule: `#dfe5ed` for borders and structural dividers.

Dark mode keeps PaperMod's established behavior while remapping these roles to dark, accessible equivalents. Research blue becomes a lighter blue suitable for dark backgrounds. No decorative gradients or colored page sections are introduced.

### Typography

- Display and article titles: Georgia, matching the more editorial parts of the personal homepage.
- Interface and body text: Trebuchet MS with Helvetica and Arial fallbacks, matching the personal homepage's primary type family.
- Dates, counts, labels, and compact metadata: Monaco/Consolas monospace.

Type sizes remain fixed within responsive breakpoints and do not scale with viewport width.

### Signature Element

The category sidebar is the memorable element. It is a content map, not a generic profile panel: a short research-notebook heading, category names, live post counts, and a concise explanation of the distinction between categories and tags. A 48px author portrait at the bottom of the sidebar links back to the personal homepage without competing with the category map.

## Information Architecture

### Header

The header uses the label `Shuo Lv / Field Notes`. It provides:

- A link to the blog home.
- Categories, Tags, Archives, and Search.
- A compact link back to the personal homepage.
- The existing theme toggle.

The header receives the homepage's research-blue divider and restrained spacing. It remains usable at narrow widths without overlapping or wrapping into an incoherent layout.

### Content Types

Hugo `categories` become the high-level answer to "what kind of note is this?":

- `Research Synthesis`
- `Personal Experience`
- `Life & Elsewhere`

Hugo `tags` remain the answer to "what is this note about?", for example MRI, agents, neuroscience, PhD applications, games, or travel.

The sidebar reads category terms and counts from Hugo rather than hard-coding them. Empty categories are not shown. Current `Technology` and `Personal` categories will be normalized into the approved labels where the intended mapping is clear. Existing draft and user-written body content is preserved.

### Home Page

The home page uses a two-column layout at desktop widths:

```text
+----------------------+---------------------------------------------+
| Content map          | Research-notebook introduction              |
|                      |                                             |
| All notes         07 | Recent entries                              |
| Research          04 | 01  Category label                          |
| Experience        02 |     Article title                    date   |
| Life              01 |     Short summary                          |
|                      | ------------------------------------------- |
| Category/tag note    | 02  ...                                     |
+----------------------+---------------------------------------------+
```

Post entries are separated by rules rather than floating cards. Each row includes an ordinal, category label, article title, useful summary, date, and reading time. The entire row remains clickable with a visible keyboard focus state.

At narrow widths, the fixed sidebar disappears and its categories become a horizontally scrollable filter above the post list. The post row collapses to a stable two-column grid, and metadata moves beneath the title and summary.

### Article and Index Pages

Single-article pages use a maximum reading measure of 720px. Headings, block quotes, links, code blocks, tables, images, breadcrumbs, share controls, and post navigation are restyled using the same type and color system.

Category, tag, archive, and search pages reuse the rule-based article row instead of reverting to default PaperMod cards. Search retains fuzzy matching and receives a clear empty state. Category pages identify the selected category in the sidebar or mobile filter.

## Content and Asset Hygiene

The refresh includes visible problems found during the audit:

- Replace the stale `/my-blog/images/profile/aaron.jpg` reference and incorrect Aaron alt text.
- Fix the home introduction so it renders as prose rather than an indented code block.
- Replace generic `Ls's Blog`, `My Blog`, and `Welcome to Ls's Blog` labels with the approved notebook identity.
- Replace the placeholder About page with a concise handoff to the maintained personal homepage.
- Keep the placeholder first-post source file and set `draft: true` so it is not published.
- Preserve all user-written draft bodies and current uncommitted work.
- Reuse the current personal portrait as the shared author asset rather than introducing decorative stock imagery.

## Implementation Boundaries

Customizations live outside the PaperMod submodule so theme updates do not overwrite them:

- Add project-owned CSS under `assets/css/extended/`.
- Override only the PaperMod partials and list templates needed for the header, home introduction, sidebar, post rows, and shared metadata.
- Put reusable category-map markup in one partial shared by list views.
- Keep category labels and explanatory copy in site configuration or data files rather than duplicating strings across templates.
- Do not edit files inside `themes/PaperMod`.
- Do not alter the unrelated `static/fgo-wiki` application.

## Data Flow

1. Hugo reads article front matter, including categories and tags.
2. The category-map partial reads `site.Taxonomies.categories`, applies the approved display order, omits empty terms, and renders live counts.
3. Home and taxonomy templates render the same article-row partial with page title, summary, date, reading time, and primary category.
4. Selecting a category follows the normal Hugo taxonomy URL; no client-side filtering or JavaScript state is required.
5. Search continues to use PaperMod's generated JSON index and Fuse.js.

This keeps the site functional without JavaScript except where PaperMod already uses it for search and theme behavior.

## Failure and Empty States

- If a post has no category, display `Unsorted` in metadata but do not add a permanent empty sidebar item.
- If a category has no posts, omit it from the sidebar.
- If a post has no custom summary, use Hugo's generated summary and clamp it visually without truncating the accessible link name.
- If the portrait fails to load, preserve meaningful alt text and keep the sidebar layout stable.
- If search returns no results, show a direct `No matching notes` message without changing the page dimensions abruptly.

## Accessibility and Motion

- Maintain WCAG AA contrast for text, links, active states, and both themes.
- Use semantic navigation, aside, main, article, and heading structure.
- Give all interactive rows and icon buttons visible focus styles.
- Keep touch targets at least 40px where practical.
- Respect `prefers-reduced-motion`; only restrained hover and focus transitions are needed.
- Avoid layout shifts by reserving portrait dimensions and stable article-row tracks.

## Verification

- Build with Hugo Extended 0.166.0, matching GitHub Actions.
- Verify home, article, category, tag, archive, search, and About routes under the `/lsBlog/` base path.
- Check light and dark themes.
- Check desktop, tablet, and mobile widths, including the sidebar-to-filter transition.
- Confirm keyboard navigation, visible focus, heading order, image alt text, and reduced-motion behavior.
- Confirm search, taxonomy counts, reading time, code copy, breadcrumbs, share buttons, and post navigation still work.
- Check generated HTML for stale `/my-blog/` paths and placeholder public copy.
- Capture desktop and mobile screenshots and inspect them for overflow, clipping, overlap, and unintended empty space.

## Out of Scope

- Rewriting substantive article bodies.
- Adding a CMS, database, or client-side router.
- Redesigning the unrelated FGO wiki.
- Rebuilding or materially changing the academic personal homepage.
- Adding analytics or third-party tracking.
