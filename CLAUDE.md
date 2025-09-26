# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start development server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |
| `npm run astro ...` | Run Astro CLI commands |

## Project Architecture

This is an **Astro 5.0** project using the basics template. The project follows Astro's standard structure:

### Core Structure
- **Pages**: `/src/pages/` - File-based routing (currently `index.astro`)
- **Layouts**: `/src/layouts/` - Page layouts (contains `Layout.astro` base layout)
- **Components**: `/src/components/` - Reusable Astro components (contains `Welcome.astro`)
- **Assets**: `/src/assets/` - Static assets like SVGs and images

### Key Files
- `astro.config.mjs`: Minimal Astro configuration with default settings
- `tsconfig.json`: Uses Astro's strict TypeScript configuration
- `src/layouts/Layout.astro`: Base HTML layout with meta tags and global styles
- `src/pages/index.astro`: Entry point that renders Welcome component within Layout

### Tech Stack
- **Framework**: Astro 5.0 (SSG/SSR capable)
- **TypeScript**: Strict configuration enabled
- **Styling**: Component-scoped CSS (no external framework)
- **Assets**: SVG assets imported as ES modules

## Development Notes

- The project uses TypeScript with strict configuration
- Astro components use the `.astro` extension with frontmatter script sections
- Static assets in `/src/assets/` are processed and optimized by Astro
- The current setup is a minimal starter with welcome page and basic styling
- VSCode extension `astro-build.astro-vscode` is recommended for development