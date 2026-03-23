# LabLog Generator

Desktop markdown note generator for lab workflows, built with Electron + Vditor.

![GitHub contributors](https://img.shields.io/github/contributors/jiehua1995/LabLog)
![GitHub commits since latest release](https://img.shields.io/github/commits-since/jiehua1995/LabLog/latest)
![GitHub release date](https://img.shields.io/github/release-date/jiehua1995/LabLog)
![GitHub downloads](https://img.shields.io/github/downloads/jiehua1995/LabLog/total)
![GitHub license](https://img.shields.io/github/license/jiehua1995/LabLog)

## Features

- Metadata form for date/category/author/email
- Category-based markdown templates (add/rename/delete)
- Source / Visual editor modes powered by Vditor
- Typora-style table-of-contents marker via `[toc]`
- Theme switching with daisyUI themes
- Settings dialog with tabs: General / Templates / Updates / About
- Save composed markdown with YAML front matter
- Auto-update integration via `electron-updater`

## Stack

- Electron 41
- Vditor 3
- Tailwind CSS 4 + daisyUI 5
- Font Awesome icons

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Run (development)

```bash
npm start
```

### Build distributables

```bash
npm run dist
```

## NPM Scripts

- `npm start`: build CSS then launch Electron
- `npm run build:css`: compile Tailwind/daisyUI CSS once
- `npm run build:css:watch`: watch mode for CSS
- `npm run dist`: package app without publish
- `npm run release`: package and publish flow

## Template Notes

- Keep `[toc]` in markdown to render a ToC in visual mode.
- For path shortcuts, default templates include an HTML button in source mode and render as a visual control in visual mode.

## Repository Structure

- `main.js`: Electron main process, settings, IPC, updater
- `preload.js`: secure IPC bridge (`window.lablogAPI`)
- `js/app.js`: renderer logic, editor setup, template actions
- `index.html`: app layout and dialogs
- `style.css`: custom UI/editor styling
- `css/input.css`: Tailwind entry
- `css/output.css`: generated CSS output

## License

MIT
