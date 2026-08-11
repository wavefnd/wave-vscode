import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions
} from 'vscode-languageclient/node';

let languageClient: LanguageClient | undefined;

function windowsPathToWsl(winPath: string): string {
    if (!/^[a-zA-Z]:[\\/]/.test(winPath)) {
        return winPath;
    }
    const driveLetter = winPath[0].toLowerCase();
    const withoutDrive = winPath.substring(2).replace(/\\/g, '/');
    return `/mnt/${driveLetter}${withoutDrive}`;
}

function resolveLanguageServer(context: vscode.ExtensionContext): ServerOptions {
    const configuration = vscode.workspace.getConfiguration('wave.languageServer');
    const configuredPath = configuration.get<string>('path', '').trim();
    const configuredArguments = configuration.get<string[]>('arguments', []);
    const useWsl = configuration.get<boolean>('useWsl', false);

    const executableName = process.platform === 'win32' ? 'wave-agape.exe' : 'wave-agape';
    const bundledPath = context.asAbsolutePath(
        path.join('server', `${process.platform}-${process.arch}`, executableName)
    );

    if (process.platform === 'win32' && useWsl) {
        const command = configuredPath ? windowsPathToWsl(configuredPath) : 'wave-agape';
        return {
            command: 'wsl.exe',
            args: [command, ...configuredArguments]
        };
    }
    const command = configuredPath || (fs.existsSync(bundledPath) ? bundledPath : 'wave-agape');
    return {
        command,
        args: configuredArguments
    };
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    const runWave = vscode.commands.registerCommand('wave.runCurrentFile', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'wave') {
            vscode.window.showErrorMessage('Open a Wave file before running this command.');
            return;
        }
        if (editor.document.isUntitled) {
            vscode.window.showErrorMessage('Save the Wave file before running it.');
            return;
        }

        const filePath = editor.document.fileName;
        const compilerConfiguration = vscode.workspace.getConfiguration('wave.compiler');
        const compilerPath = compilerConfiguration.get<string>('path', '').trim() || 'wavec';
        const useWsl = process.platform === 'win32'
            && compilerConfiguration.get<boolean>('useWsl', false);
        const terminal = vscode.window.createTerminal('Wave Runner');
        terminal.show();

        if (useWsl) {
            terminal.sendText(`wsl.exe "${windowsPathToWsl(compilerPath)}" run "${windowsPathToWsl(filePath)}"`);
        } else {
            terminal.sendText(`"${compilerPath}" run "${filePath}"`);
        }
    });

    const codeLensProvider: vscode.CodeLensProvider = {
        provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
            if (document.languageId !== 'wave') {
                return [];
            }
            return [
                new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), {
                    title: '▶ Run Wave',
                    command: 'wave.runCurrentFile'
                })
            ];
        }
    };

    const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.wave');
    const importConfiguration = vscode.workspace.getConfiguration('wave.imports');
    const clientOptions: LanguageClientOptions = {
        documentSelector: [
            { scheme: 'file', language: 'wave' },
            { scheme: 'untitled', language: 'wave' }
        ],
        synchronize: {
            fileEvents: fileWatcher
        },
        initializationOptions: {
            client: 'vscode',
            imports: {
                standardLibraryPath: importConfiguration.get<string>('standardLibraryPath', '').trim(),
                dependencyRoots: importConfiguration.get<string[]>('dependencyRoots', []),
                dependencies: importConfiguration.get<Record<string, string>>('dependencies', {})
            }
        }
    };
    languageClient = new LanguageClient(
        'wave-agape',
        'Wave Language Server',
        resolveLanguageServer(context),
        clientOptions
    );

    const restartLanguageServer = vscode.commands.registerCommand(
        'wave.restartLanguageServer',
        async () => {
            if (!languageClient) {
                return;
            }
            await languageClient.restart();
            void vscode.window.showInformationMessage('Wave language server restarted.');
        }
    );
    const configurationListener = vscode.workspace.onDidChangeConfiguration(event => {
        if ((event.affectsConfiguration('wave.languageServer')
            || event.affectsConfiguration('wave.imports')) && languageClient) {
            void languageClient.restart();
        }
    });

    context.subscriptions.push(
        runWave,
        restartLanguageServer,
        configurationListener,
        fileWatcher,
        vscode.languages.registerCodeLensProvider('wave', codeLensProvider),
        languageClient
    );

    try {
        await languageClient.start();
    } catch (error) {
        languageClient = undefined;
        void vscode.window.showErrorMessage(
            `Unable to start wave-agape. Configure wave.languageServer.path or install it on PATH. ${String(error)}`
        );
    }
}

export async function deactivate(): Promise<void> {
    if (languageClient) {
        await languageClient.stop();
        languageClient = undefined;
    }
}
