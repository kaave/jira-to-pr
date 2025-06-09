# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript project that fetches ticket information from Jira and uses Claude Code to implement features based on those tickets. The project uses pnpm as the package manager and SWC for fast TypeScript compilation.

## Development Commands

- `pnpm dev` - Start development server with hot reload using ts-node and SWC
- `pnpm build` - Build the project using TypeScript compiler
- `pnpm start` - Run the built application from dist/
- `pnpm typecheck` - Run TypeScript type checking without emitting files

## Architecture

### TypeScript Configuration
- Uses `@tsconfig/strictest` for maximum type safety
- ts-node is configured to use SWC for fast compilation during development
- Source files in `src/`, compiled output in `dist/`

### HTTP Client Strategy
- The project uses a custom fetch-based HTTP client instead of axios
- This allows for fine-grained control over HTTP requests to Jira API

### Package Management
- Uses pnpm for dependency management
- SWC is used via ts-node for development performance
- Environment variables handled through dotenv

## Project Structure

```
src/          # Source TypeScript files
dist/         # Compiled JavaScript output
tsconfig.json # TypeScript configuration with strict settings
.swcrc        # SWC configuration for TypeScript compilation
```