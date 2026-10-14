---
title: "Formatting Reference"
description: "A live reference for Markdown, HTML, mathematics, and reusable article blocks supported by Field Notes."
date: 2026-10-14
draft: false
math: true
showToc: true
TocOpen: true
searchHidden: true
hideMeta: true
ShowPostNavLinks: false
ShowShareButtons: false
disableShare: true
build:
  list: never
---

This page is a live compatibility sheet for writing Field Notes. Each pattern is rendered first and followed by copyable source where the syntax benefits from an example.

## Typography

### Heading level three

#### Heading level four

##### Heading level five

###### Heading level six

**Bold**, *italic*, ***combined***, ~~strikethrough~~, `inline code`, <mark>highlight</mark>, <ins>inserted text</ins>, H<sub>2</sub>O, x<sup>2</sup>, <abbr title="Magnetic resonance imaging">MRI</abbr>, and <kbd>Command</kbd> + <kbd>K</kbd>.

```markdown
**Bold**, *italic*, ***combined***, ~~strikethrough~~, `inline code`,
<mark>highlight</mark>, <ins>inserted text</ins>, H<sub>2</sub>O,
x<sup>2</sup>, <abbr title="Magnetic resonance imaging">MRI</abbr>,
and <kbd>Command</kbd> + <kbd>K</kbd>.
```

## Links

- [An internal note]({{< ref "/notes/ulf-mri-learning-blueprint" >}})
- [Shuo Lv's academic homepage](https://ShuoLv-fp.github.io/)
- [An email link](mailto:hello@example.com)
- An automatic link: <https://gohugo.io/>

```markdown
[An internal note]({{</* ref "/notes/ulf-mri-learning-blueprint" */>}})
[Academic homepage](https://ShuoLv-fp.github.io/)
[Email](mailto:hello@example.com)
<https://gohugo.io/>
```

## Lists

- K-space foundations
  - Spatial frequency
  - Sampling trajectories
- Reconstruction
  - Inverse problems
  - Validation

1. State the question.
2. Record the assumptions.
3. Test the smallest useful case.

- [x] Define the acquisition model
- [x] Inspect the raw signal
- [ ] Validate on a second dataset

Term
: A compact definition written directly below the term.

Field note
: A durable record of a question, method, or observation.

```markdown
- Parent item
  - Nested item

1. First step
2. Second step

- [x] Finished task
- [ ] Open task

Term
: Definition
```

## Quotations and footnotes

> A good notebook preserves the reasoning that made a result believable.
>
> It also leaves enough context for a future reader to challenge it.
>
> > Nested quotations can separate a source from a later annotation.

According to <cite>Principles of Magnetic Resonance</cite>, notation is most useful when definitions remain close to the equations they support.

{{< pullquote cite="Field Notes editorial principle" >}}
Keep the evidence close to the claim, and keep the unresolved question visible.
{{< /pullquote >}}

Footnotes support brief qualifications without interrupting the main argument.[^scope] A second reference can point back to the same note.[^scope]

[^scope]: Keep footnotes concise. Longer arguments usually deserve their own paragraph or section.

````markdown
> A quotation can span multiple paragraphs.
>
> > It can also contain a nested source.

{{</* pullquote cite="Source" */>}}
A short statement worth isolating.
{{</* /pullquote */>}}

A sentence with a footnote.[^note]

[^note]: The footnote text.
````

## Tables

| Element | Purpose | Status |
| :-- | :-- | --: |
| Title | Names the note | Required |
| Summary | Supports scanning | Recommended |
| Category | States why it exists | 1 only |

The comparison below is deliberately wide; it should scroll inside the article rather than widening the whole page.

| MRI regime | Nominal field strength | Signal considerations | Typical acquisition constraint | Reconstruction concern | Validation target |
| :-- | --: | :-- | :-- | :-- | :-- |
| Ultra-low field | < 0.1 T | Lower intrinsic SNR and stronger environmental interference | Flexible hardware with longer acquisitions | EMI suppression and calibrated priors | Stability across sessions |
| Low field | 0.1-1 T | Moderate SNR with system-dependent contrast | Protocol efficiency | Resolution-noise tradeoff | Agreement with reference scans |
| High field | >= 1.5 T | Higher SNR with stronger susceptibility effects | Safety and sequence constraints | Artifact control | Quantitative reproducibility |

```markdown
| Left aligned | Centered | Right aligned |
| :-- | :--: | --: |
| text | text | 42 |
```

## Code

Use `numpy.fft.fftshift` for the function name and fenced blocks for complete examples.

```python
import numpy as np

def normalize_kspace(signal: np.ndarray) -> np.ndarray:
    scale = np.abs(signal).max()
    return signal if scale == 0 else signal / scale
```

Hugo's `highlight` shortcode supports line numbers and emphasized lines:

{{< highlight python "linenos=table,hl_lines=2 4" >}}
def reconstruct(kspace, mask):
    sampled = kspace * mask
    image = inverse_fourier_transform(sampled)
    return image / max(abs(image).max(), 1e-8)
{{< /highlight >}}

````markdown
```python
def normalize(value):
    return value / max(abs(value), 1e-8)
```

{{</* highlight python "linenos=table,hl_lines=2" */>}}
def reconstruct(kspace):
    return inverse_fourier_transform(kspace)
{{</* /highlight */>}}
````

## Mathematics

Inline mathematics stays in the sentence: $S(k_x,k_y)=\int\int \rho(x,y)e^{-i2\pi(k_xx+k_yy)}dxdy$.

Display mathematics receives its own scroll-safe line:

$$
\hat{x}=\underset{x}{\operatorname{argmin}}\;\lVert Ax-y\rVert_2^2+\lambda\mathcal{R}(x)
$$

```markdown
Inline: $E = mc^2$

$$
\hat{x}=\underset{x}{\operatorname{argmin}}\;\lVert Ax-y\rVert_2^2
$$
```

## Rich blocks

{{< callout type="note" title="Note" >}}
Use notes for context that supports the main argument without changing the recommended action.
{{< /callout >}}

{{< callout type="tip" title="Practical tip" >}}
Keep figures near the paragraph that interprets them, and write descriptive alt text.
{{< /callout >}}

{{< callout type="warning" title="Check before publishing" >}}
- Confirm every external link.
- Preview both light and dark themes.
- Verify the layout at a narrow viewport.
{{< /callout >}}

{{< callout type="danger" title="Do not publish" >}}
Never include credentials, private participant data, or an unreviewed identifying image.
{{< /callout >}}

````markdown
{{</* callout type="tip" title="Practical tip" */>}}
Markdown, including **emphasis** and lists, works inside the block.
{{</* /callout */>}}
````

{{< columns >}}
> ### Research synthesis
>
> Connect a claim to its evidence, note the method's boundary conditions, and preserve enough detail to reproduce the reasoning.

> ### Personal experience
>
> Separate what happened from what you inferred, then record which lesson might transfer to the next situation.
{{< /columns >}}

````markdown
{{</* columns */>}}
> ### First column
>
> Markdown content for the first idea.

> ### Second column
>
> Markdown content for the second idea.
{{</* /columns */>}}
````

{{< timeline >}}
1. **Observe** — Record the signal, artifact, or question before interpreting it.
2. **Model** — Make assumptions explicit and choose a tractable representation.
3. **Test** — Compare the model with evidence and keep failed checks visible.
4. **Revise** — Update the note when the evidence changes.
{{< /timeline >}}

````markdown
{{</* timeline */>}}
1. **Observe** — Record the question.
2. **Test** — Compare it with evidence.
3. **Revise** — Preserve what changed.
{{</* /timeline */>}}
````

{{< collapse summary="Show a compact methods note" >}}
Collapsible sections are useful for derivations, secondary implementation details, or optional background. They should not hide a conclusion the reader needs in order to follow the article.
{{< /collapse >}}

```markdown
{{</* collapse summary="Show a compact methods note" */>}}
Optional detail with **Markdown** support.
{{</* /collapse */>}}
```

## Media

<figure class="reference-media">
  <a href="https://ShuoLv-fp.github.io/">
    <img src="https://ShuoLv-fp.github.io/images/profile_202609.png" alt="Portrait of Shuo Lv" width="180" height="180" loading="lazy">
  </a>
  <figcaption>A linked image with explicit intrinsic dimensions and a concise caption.</figcaption>
</figure>

{{< gallery >}}
[![Portrait of Shuo Lv used as the first gallery sample](https://ShuoLv-fp.github.io/images/profile_202609.png)](https://ShuoLv-fp.github.io/)

[![Portrait of Shuo Lv used as the second gallery sample](https://ShuoLv-fp.github.io/images/profile_202609.png)](https://ShuoLv-fp.github.io/)

<p class="reference-gallery__caption">The gallery accepts ordinary Markdown images and links, so alternative text remains part of the rendered HTML.</p>
{{< /gallery >}}

````markdown
<figure>
  <img src="/image.png" alt="Descriptive alternative text"
       width="1200" height="800" loading="lazy">
  <figcaption>A concise caption.</figcaption>
</figure>

{{</* gallery */>}}
![First descriptive alt text](/image-one.png)

![Second descriptive alt text](/image-two.png)

<p class="reference-gallery__caption">An optional caption for the full gallery.</p>
{{</* /gallery */>}}
````

## Stress tests

Mixed-language prose should remain readable without unusual spacing: 研究笔记需要同时容纳方法、证据与尚未解决的问题。A field note should also preserve the assumptions behind a result so that it can be revisited later.

A long URL must wrap locally: <https://example.org/research/magnetic-resonance-imaging/reconstruction/compatibility/reference?acquisition=ultra-low-field&reconstruction=physics-informed&validation=longitudinal-reproducibility>.

The following no-space token must not widen the page:

<p class="reference-overflow">ultralowfieldmagneticresonanceimagingreconstructionvalidationdatasetversion20261014abcdefghijklmnopqrstuvwxyz0123456789</p>

The wide table in [Tables](#tables), the display equation in [Mathematics](#mathematics), and this long code line should each scroll inside their own content area:

```text
pipeline://acquisition/preprocessing/interference-suppression/reconstruction/quality-control/export?dataset=longitudinal-ultra-low-field-neuroimaging-reference
```

```markdown
Use mixed-language text directly: 中文与 English can share one paragraph.

Wrap deliberately long machine-readable values in a code block or an element
with the `reference-overflow` class.
```
