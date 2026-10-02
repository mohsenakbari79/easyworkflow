# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Documentation overhaul: rewritten README with required sections (hook, demo, features, quick start, advanced examples, contributing, license)
- `CONTRIBUTING.md` with development setup, scripts, and PR guidelines
- `CHANGELOG.md` (this file)
- JSDoc comments on public APIs, types, and components

### Changed
- Standard MIT `LICENSE` file format

## [0.1.2] - 2025-09-25

### Added
- README preview screenshot
- Configurable actions API (`actions` / `toolbarActions`)
- i18n maps (`display_name_i18n`, `description_i18n`, `label_i18n`)
- CSS layout fixes

### Changed
- Renamed `noopAdapter` to `emptyAdapter` (breaking); `noopAdapter` remains as a deprecated alias
- Simplified default toolbar settings

### Fixed
- CSS layout issues reported in the editor shell

## [0.1.1] - 2025-09-18

### Added
- Configurable actions API
- i18n maps and RTL support
- Package rename to `@malevin/easyworkflow` for scoped publishing

## [0.1.0] - 2025-09-17

### Added
- Initial `easyworkflow` release
- Visual workflow editor built on React Flow
- Adapter-based backend pattern
- Node editors, palette, toolbar, and theming
