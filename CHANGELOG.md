# LabLog Generator - Changelog

## [0.1.1] - 2026-03-23

### Added
- In-app template name dialog for category add/rename actions (replacing browser prompt reliance)
- Legacy template content migration for ToC and file-path button formats

### Changed
- Standardized template ToC marker to Typora-style `[toc]`
- Updated Vditor visual editing behavior to keep source mode editable and visual mode WYSIWYG-oriented
- Updated default template file-path shortcut to consistent HTML button snippet in source mode
- Refined window frame styling to remove unnecessary outer dark ring/background effect

### Fixed
- Fixed template add/rename flow not responding reliably in Electron runtime
- Fixed visual-mode rendering regressions around template button content
- Fixed mixed legacy template data causing inconsistent source/visual output

## [0.1.0] - 2026-03-23

### Added
- Full Electron desktop application for markdown lab note generation
- Reusable template system with customizable categories
- Real-time markdown preview (Source/Visual modes)
- Multi-theme support with 34 daisyUI themes
- Settings management with JSON-based user configuration
- Auto-update system with electron-updater
- About section with copyright and software information
- Windows/Mac/Linux support via GitHub Actions CI/CD

### Changed
- Replaced previous editor stack with Vditor-based editing workflow
- Modernized build pipeline: Tailwind CSS v4.2.2 + daisyUI v5.5.19
- Converted window to frameless with custom draggable titlebar
- English-only interface with consistent UI labeling
- Settings modal with tab-based organization (General, Templates, Updates, About)

### Fixed
- Fixed editor initialization and mode switching stability
- Removed redundant window border layers (system rounded corners conflict)
- Resolved Toast UI path resolution errors
- Fixed vertical alignment in Updates tab controls
- Improved form control spacing in Settings panels

### Removed
- Removed unused Toast UI dependencies
- Cleaned up legacy fallback editor code
- Removed unnecessary CodeMirror integration

## [0.0.1] - Initial Release
- Basic lab notebook template system
- Simple markdown editor
