# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCPStore is a Node.js/TypeScript library intended to be a storage and retrieval layer for MCP (Model Context Protocol) servers, supporting document storage, vector search, and RAG workflows. Currently in early development — the `src/` directory contains filesystem utility modules (file/folder copying, backup, CSV parsing, log analysis) while the core MCP store components (document store, vector store, session manager, etc.) described in the README have not been implemented yet.

## Commands

- **Run**: `npm run dev` (executes `src/index.ts` via `npx tsx`)
- **Format**: `npm run format` (Prettier write) / `npm run format:check` (Prettier check)
- **Type check**: `npx tsc --noEmit`
- **Build**: `npx tsc` (outputs to `dist/`)
- No test framework is configured yet.

## Architecture

- **ESM-only** (`"type": "module"` in package.json, `"module": "nodenext"` in tsconfig)
- All imports of local `.ts` files must use `.js` extensions (required by nodenext module resolution)
- TypeScript strict mode is enabled with additional strict flags: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`, `noUnusedParameters`
- `src/index.ts` — entry point, currently used to manually test utilities
- `src/utils/` — utility modules:
  - `copy_utils/copy_file.ts` — stream-based file copy with pause/resume and backpressure handling
  - `copy_utils/copy_folder.ts` — recursive folder copy using CopyFiles, with progress tracking
  - `backup/backup.ts` — zip backup using `archiver` with progress bar
  - `csv/parser.ts` — async generator CSV parser using readline streams
  - `analyser/log_analyser.ts` — log file line counter by level (INFO/WARN/ERROR)
  - `extract_error_message.ts` — safe error message extraction from unknown types
  - `calculate_file_size.ts` — recursive directory size calculation

## Style

- Prettier config: single quotes, semicolons, trailing commas, 2-space indent, 80 char width
