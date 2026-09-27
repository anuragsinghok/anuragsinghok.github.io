# anuragsinghok.github.io

Portfolio of **Anurag Singh**, an engineer based in Japan (日本在住エンジニア).

Live: **https://anuragsinghok.github.io**

A 3D Japanese-layout (kana) keyboard built with Three.js: every section of the page presses one key
(India → Amity 2024 → Japan → automation → AWS → why hire me → work → 97 days of building in public → FAQ → Enter = 採用).
Try typing on your own keyboard, or type `HIRE`.

- Projects from the 97-day build-in-public series rise out of the keyboard as 3D screens (click one to open it)
- Japanese / English switch (remembered per visitor)
- Works without a build step: plain HTML, CSS and ES modules (`three` is vendored in `vendor/`)
- Hosted on GitHub Pages

Contact: [LinkedIn](https://linkedin.com/in/anuragsinghok) · [GitHub](https://github.com/anuragsinghok) · [X](https://x.com/anurag_pov)

## Adding a new project

Copy the `<article class="proj">` block in the `#projects` section of `index.html`, change the day, texts and links, and point `data-img` at the project's preview image. The 3D screen and the day counter on the B key update on their own.
