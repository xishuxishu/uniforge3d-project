# UniForge3D Project Page

Project website for **UniForge3D: Joint 3D Reconstruction and Generation in a Shared Anchor-Guided Space**.

This repository contains the static project page and its presentation media, not the model implementation or checkpoints.

Website: https://xishuxishu.github.io/uniforge3d-project/

## Files

- `index.html`: title, authors, abstract, method, comparisons, and additional results.
- `styles.css`: layout and visual styles.
- `app.js`: teaser playback and resource links.
- `comparisons.js`: comparison and result video galleries.
- `site-config.js`: public paper and model-code URLs.
- `assets/`: optimized videos, posters, thumbnails, diagrams, and icons.

## Update Paper and Code Links

Set the final public URLs in `site-config.js`. Empty values keep the corresponding buttons inactive. The Code link should point to the model repository, not this website repository.

## GitHub Pages

In **Settings > Pages**, choose **Deploy from a branch**, select **main**, and use **/(root)**. The `.nojekyll` file enables plain static hosting. Updates pushed to the publishing branch are deployed automatically.

All web assets use relative paths so the page can be hosted under a repository subpath. Update the canonical URL and Open Graph metadata in `index.html` if the site moves to another address.

## Local Preview

Open `index.html` in a browser or serve this directory with a local static HTTP server. No package installation or build step is required.

## Third-Party Notices

The Lucide icon license is included in `assets/LUCIDE-LICENSE.txt`. Media and research content retain their respective rights; this repository does not grant a blanket license to the showcased assets.
