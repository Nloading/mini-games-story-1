# MiniGames Story 1

A responsive MiniGames browser interface built with TypeScript, Vite, and Sass.

## Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` creates the production bundle in `dist/`.
- `npm run preview` serves the production bundle locally.
- `npm run lint` checks TypeScript with ESLint.
- `npm run format:check` verifies Prettier formatting.
- `npm run format` formats source files.

## Mock data

The library loads the official Story 1 `all-games-seed.json` mock data from the RS School repository and falls back to a local starter dataset when the remote resource is unavailable. The mock data is used only for the front-end stage; backend integration is outside the scope of Story 1.

## Verification

Check the responsive layout at 375px, 768px, and 1920px in Chrome. The final Story 1 pull request should target the `main` branch, remain unmerged for cross-check, and include the deployed public URL.
