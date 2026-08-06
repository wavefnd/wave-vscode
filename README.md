# Wave Language Support

Wave Programming Language support for Visual Studio Code, powered by the
shared `wave-agape` language server.

## Features

- ✅ Syntax highlighting for Wave (`.wave`) files
- ✅ Keywords, types, functions, strings, numbers, operators
- ✅ Support for comments (`//` and `/* */`)
- ✅ `import` keyword highlighting
- ✅ Custom icon for `.wave` files
- ✅ **Run Wave** button → `wavec run <file>` (native Windows and optional WSL)
- ✅ Diagnostics and parser errors
- ✅ Completion and signature help
- ✅ Hover and go to definition
- ✅ Document/workspace symbols and references
- ✅ Rename

## How to Use

1. Install this extension  
2. Open any `.wave` file  
3. Press `▶ Run Wave` at the top of the file to run it

## Requirements

- `wavec` compiler must be installed and available in your PATH  
- `wave-agape` must be available in `PATH`, configured with
  `wave.languageServer.path`, or bundled under
  `server/<platform>-<architecture>/wave-agape` (`.exe` on Windows)

Windows uses native `wavec.exe` and `wave-agape.exe` by default. WSL remains an
opt-in compatibility mode through `wave.compiler.useWsl` and
`wave.languageServer.useWsl`.

## Development

```shell
npm install
npm run compile
```

## Marketplace automation

Pushing a version tag such as `v0.3.0` runs
`.github/workflows/marketplace.yml`. The workflow bundles x64 Linux and Windows
servers plus x64 and Apple Silicon macOS servers, uploads the VSIX as an
Actions artifact, and publishes it to the VS Code Marketplace when the
`VSCE_PAT` repository secret is set.

The language-server source defaults to `wavefnd/wave-agape` at `master`. Set
the `WAVE_AGAPE_REPOSITORY` and `WAVE_AGAPE_REF` repository variables to use a
different repository or a pinned tag/commit.
