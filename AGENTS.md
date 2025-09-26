# AGENTS.md

Agent guidance for working with the Meditha Astro project.

## Commands
- `npm run dev` - Start development server at localhost:4321
- `npm run build` - Build production site (use for typecheck/validation)
- `npm run preview` - Preview production build
- `npm run astro --help` - Access Astro CLI commands

## Architecture
**Astro 5.0** project with Preact integration and TailwindCSS v4. Site deploys to metodolux.com.br.
- `/src/pages/` - File-based routing with .astro files
- `/src/layouts/` - Shared page layouts  
- `/src/components/` - Reusable Astro/Preact components
- `/src/lib/` - Utility functions and shared logic
- `/src/styles/` - Global styles and CSS modules
- `/src/assets/` - Static assets (SVGs, images)

## Code Style
- **TypeScript**: Strict config with Astro's tsconfigs/strict
- **Components**: Use .astro extension, Preact for interactive components with JSX
- **Styling**: TailwindCSS v4 with component-scoped CSS in .astro files
- **Imports**: ES modules, assets imported from `/src/assets/`
- **JSX**: Preact with react-jsx transform for interactive components
