---
name: game-character-cutout
description: Use this skill when the user gives a game character or game title and wants Codex to search the web for a clear game character image, download it, and create a character-only transparent PNG. Trigger for Chinese or English requests such as "输入游戏角色然后抠出来", "帮我找这个角色图片并抠图", "make a cutout of a game character", "只要人物不要技能特效", or when character image sourcing plus background removal is needed for this local Gbox project. Prefer specific character art/sprites over screenshots; avoid UI, HUD, skill effects, covers, and noisy gameplay screenshots.
---

# Game Character Cutout

Use this skill to turn a game character name into a usable transparent PNG asset.

The goal is a practical asset workflow, not a broad image research report: find a clear image, keep source attribution, remove the background, and save the result in the local project.

## Default Output Location

Save outputs under:

```text
E:\program\Gbox\assets\characters\cutouts\<character-slug>\
```

Use these filenames:

- `source.<ext>`: the downloaded source image.
- `cutout.png`: the transparent-background result.
- `sources.md`: source URL, search query, selected image notes, and any copyright/licensing caveat.

If the user asks for another location, follow the user's location.

## Workflow

1. Clarify only if the character is ambiguous.
   - Good input: `原神 胡桃`, `League of Legends Ahri`, `Mario`.
   - Ambiguous input: `女武神`, `the knight`, `ice mage`.
   - If there are multiple likely characters, ask which game or version they mean.

2. Search the web for images.
   - Prefer image search when available.
   - Search query format: `<game name> <character name> official art transparent png` or `<character name> character official art`.
   - If the user gives only a game title, search for the game's representative playable character first. Use queries like `<game title> 主角 角色 png`, `<game title> 角色 立绘`, `<game title> sprite png`, and `<game title> character transparent`.
   - Prefer official pages, press kits, wiki pages with clear attribution, or high-resolution character art.
   - Avoid tiny thumbnails, watermarked images, AI fan art unless the user explicitly wants that style, images where the character is heavily occluded, title covers, app icons, full gameplay screenshots, UI/HUD panels, skill bars, damage numbers, and attack/skill effects.

3. Choose one source image.
   - Prefer a full-body or clean half-body pose.
   - Prefer plain or high-contrast backgrounds because they cut out better.
   - Best case: an existing transparent PNG, sprite, or character render. If the source already has transparency, crop to the alpha bounds and do not run background removal unless needed.
   - If only a gameplay screenshot exists, crop to the character body before background removal. Do not feed the full screenshot to the remover.
   - The final asset should contain the character only. Exclude HUD, HP/MP bars, skill icons, nameplates, pets, mounts, weapons/projectiles detached from the body, attack flames, explosions, and other separate effects unless the user asks for them.
   - If several candidates are close, choose the one that will produce the cleanest cutout rather than the most dramatic composition.

4. Download the image.
   - Save it as `source.<ext>` in the output folder.
   - Record the image page URL and direct image URL in `sources.md`.
   - Include a short note that game character images may be copyrighted and should be used according to the rights holder's terms.

5. Remove the background.
   - If the source image already has an alpha channel, preserve it and crop to the non-transparent bounds with a small padding.
   - For screenshots, first create a character-only crop such as `source-crop-character.<ext>`, then remove the background from that crop.
   - First, check whether `rembg` is available in the active Python environment:

     ```powershell
     python -m rembg --help
     ```

   - If available, use:

     ```powershell
     python -m rembg i source.<ext> cutout.png
     ```

   - If `rembg` is not available, use the bundled helper:

     ```powershell
     python scripts\remove_bg.py --input <source-path> --output <cutout-path>
     ```

   - The bundled helper installs nothing. It tries to import `rembg` and gives a clear install command if the dependency is missing.

6. Verify the result.
   - Confirm `cutout.png` exists and is a PNG with transparency.
   - Inspect the alpha bounds. If the alpha bounding box nearly fills the whole source image, that usually means the background was not removed or the source was a bad screenshot/cover; choose a better source or crop tighter.
   - Check for multiple disconnected foreground components. If there are separate large components, keep only the character body and remove unrelated effects/UI.
   - If possible, inspect the image visually.
   - If the cutout is poor, try another source image before changing tools.

## Output Message

When finished, respond in Chinese by default. Include:

- The character name.
- The selected source URL.
- The saved `cutout.png` path.
- A short quality note, such as whether edges/hair/weapons may need manual cleanup.

Keep the response short. Do not paste long source-page text.

## Example

User:

```text
帮我把 原神 胡桃 搜图并抠出来
```

Expected behavior:

1. Search for official or clean Hu Tao character art.
2. Save files under `assets\characters\cutouts\genshin-hu-tao\`.
3. Create `cutout.png`.
4. Reply with source URL and local path.
