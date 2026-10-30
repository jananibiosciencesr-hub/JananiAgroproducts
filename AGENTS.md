# Janani Agro Products Workspace

This repository contains the fullstack application for Janani Agro Products.

## Project Structure
- `frontend/` - TanStack Start, React 19, Vite, Tailwind CSS ecommerce storefront and admin command center
- `backend/` - Node.js Express REST API server with MySQL persistence and Nodemailer
- `scratch/` - Developer scripts and verification utilities

## Strict Folder Structure Rules
- **NEVER** modify the root folder structure or create new directories / loose files in the root directory.
- The root workspace must ALWAYS strictly contain only:
  - `backend/`
  - `frontend/`
  - `scratch/`
  - `.gitignore`
  - `AGENTS.md`
  - `package.json`
  - `README.md`
- All frontend code, pages, components, and public assets must remain exclusively within `frontend/`.
- All backend code, routes, controllers, and environment configuration must remain exclusively within `backend/`.
- Any temporary test scripts, developer scratchpads, or backups must be placed only inside `scratch/`.
- Never dump build outputs, sync scripts, or route folders into the root workspace.
