---
name: image-gen
description: Generate raster images for websites and apps using the agent-provided image generation tool. Use when a page needs a hero image, product photo, illustration, background, avatar, branded visual, or other bitmap asset.
---

# Image Generation

Use this skill whenever the UI needs real imagery. Do not ship empty image
placeholders, broken `src=""`, random stock URLs, SVG substitutes for requested
photos, or fake final assets.

## Runtime Boundary

Image generation is owned by the Etlaq Agent runtime through the `generate_image`
tool. Do not use sandbox-local image CLIs such as `gen-img`, do not read or copy
provider tokens, and do not depend on provider secrets inside the generated app.

If `generate_image` is unavailable or fails, use existing user-provided assets
or report image generation as unavailable. Do not fabricate remote image URLs or
commit placeholder assets as if they are final.

## Basic Workflow

1. Decide which sections require raster assets before finalizing the layout.
2. Generate only the assets the product actually needs: hero imagery, product
   photos, illustrations, backgrounds, avatars, packaging, venue photos, or
   branded textures.
3. Save generated files under `public/generated/` unless the project already has
   a clearer asset convention.
4. Use the returned public path in the app, with useful `alt` text and stable
   image dimensions.
5. Verify every referenced image renders without a 404 and is not stretched,
   cropped incoherently, or too dark to inspect.

Example usage after an image is generated:

```tsx
<Image
  src="/generated/coffee-hero.webp"
  alt="Ceramic coffee cup on a walnut desk"
  width={1600}
  height={900}
  priority
/>
```

## Prompting

Use 30-80 words. Front-load the subject, then add composition, style, lighting,
camera/framing, mood, and output use.

Good pattern:

```text
Saudi cafe interior with carved wooden screens and brass lanterns, wide-angle architectural photography, warm morning light, polished stone floor, calm premium atmosphere, natural neutral palette, suitable for a website hero
```

Avoid generic prompts such as "nice hero image" or "modern background". Include
the actual product, place, object, service, or user context so the generated
asset is domain-specific.

## Asset Rules

- Use raster images for photos, rich hero media, product shots, realistic
  illustrations, avatars, and atmospheric backgrounds.
- Prefer existing repo-native SVG/vector/code assets for simple icons, logos,
  diagrams, and interface primitives.
- Keep generated filenames descriptive and stable enough to maintain, with
  versioned suffixes when replacing an older asset.
- Do not generate dozens of near-duplicates. Create one strong asset, inspect it,
  and iterate only when the first result misses the product need.
- For bilingual or Arabic-first UI, avoid embedding text inside generated images
  unless the user explicitly requests it; render text in HTML where possible.
