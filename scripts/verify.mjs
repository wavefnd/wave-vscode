import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url)));
const grammar = JSON.parse(
  await readFile(new URL("../syntaxes/wave.tmLanguage.json", import.meta.url)),
);
const snippets = JSON.parse(
  await readFile(new URL("../snippets/wave.code-snippets", import.meta.url)),
);

assert.equal(manifest.version, "0.3.1");
assert.equal(manifest.repository, "https://github.com/wavefnd/wave-vscode");
assert(manifest.contributes.commands.some(({ command }) => command === "wave.restartLanguageServer"));
assert(manifest.contributes.configuration.properties["wave.imports.standardLibraryPath"]);
assert(manifest.contributes.configuration.properties["wave.imports.dependencyRoots"]);
assert(manifest.contributes.configuration.properties["wave.imports.dependencies"]);

const keywordPattern = grammar.repository.keywords.patterns.find(
  ({ name }) => name === "keyword.control.wave",
);
assert(keywordPattern, "Wave keyword pattern is missing");
assert(new RegExp(keywordPattern.match).test("import"), "import must remain a Wave keyword");

const blockComment = grammar.repository.comments.patterns.find(
  ({ name }) => name === "comment.block.wave",
);
assert(blockComment?.patterns?.some(({ include }) => include === "#comments"));

const importBody = snippets["Import Statement"]?.body;
assert(Array.isArray(importBody));
assert.equal(importBody.join("\n"), 'import("${1:module}");');

console.log("wave-vscode metadata and grammar checks passed");
