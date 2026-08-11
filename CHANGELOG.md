# Change Log

All notable changes to the "wave" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [0.3.1] - 2026-08-11

- Updated bundled language-server builds to `wave-agape` v0.2.0.
- Added language-server restart support and automatic restart after server
  configuration changes.
- Fixed native run commands for non-Wave and unsaved files.
- Synchronized Wave keywords, integer types, and nested block comments.
- Fixed the repository URL used by Marketplace metadata.
- Added standard-library and external-package import settings, module
  completion, and Ctrl+click navigation through wave-agape's module graph.

## [0.3.0] - 2026-08-06

- Added the shared `wave-agape` language server client.
- Added diagnostics, completion, hover, navigation, symbols, references,
  signature help, and rename support.
- Added configurable, bundled, PATH, and WSL server launch modes.
- Made native Windows `wavec.exe` and `wave-agape.exe` the default, with WSL as
  an opt-in compatibility mode.
- Added tag-driven VS Code Marketplace packaging and publishing automation with
  bundled platform binaries.
