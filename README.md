# BITE

Landing page for BITE, a restaurant app that recommends places based on your taste and where your friends actually go.

Built with React, Three.js (for the particle hero) and Vite.

## Running it

```bash
npm install        # first time only
npm run dev        # local preview, reloads as you edit
npm run build      # production build goes into dist/
npm run format     # tidy up the code formatting
```

To put it online, upload the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages...).

## Where things are

- `src/App.tsx` – the page itself, most of the text lives here
- `src/components/` – the interactive bits (hero, phone mockup, match tabs, Taste Circles, map, waitlist)
- `src/heroAnimation.ts` – the Three.js particle animation at the top
- `src/data.ts` – demo restaurants, friends and scores
- `src/styles.css` – all the styling
- `public/` – logo and favicon

`bite-single-file.html` is the older version of the site in one file. It still opens with a double-click if you just want to show someone.

## Still to do

- The waitlist form doesn't save emails yet (see the TODO in `src/components/Waitlist.tsx`).
