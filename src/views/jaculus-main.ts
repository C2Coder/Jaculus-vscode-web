import * as vscode from 'vscode';

export class JaculusWebView implements vscode.WebviewViewProvider {

    private static viewType = 'jaculus-web.webview';

    public constructor(protected extensionUri: vscode.Uri) {
    }

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(JaculusWebView.viewType, this)
        );
    }

    public resolveWebviewView(webviewView: vscode.WebviewView, _context: vscode.WebviewViewResolveContext<unknown>, _token: vscode.CancellationToken): void | Thenable<void> {
        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.html = this._getWebviewContent(webviewView.webview, this.extensionUri);
        webviewView.webview.onDidReceiveMessage(async command => {
            const commands = await vscode.commands.getCommands();
            if (commands.indexOf(command) > -1) {
                vscode.commands.executeCommand(command);
            }
        });
        webviewView.title = 'jaculusWeb';
        webviewView.show();
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
        const toolkitUri = webview.asWebviewUri(vscode.Uri.joinPath(
            extensionUri,
            'dist',
            'views',
            'toolkit.min.js'
        ));

        const mainUri = webview.asWebviewUri(vscode.Uri.joinPath(
            extensionUri,
            'dist',
            'views',
            'devices.js'
        ));

        return `
            <!DOCTYPE html>
            <html lang='en'>
                <head>
                    <meta charset='UTF-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <script type='module' src='${toolkitUri}'></script>
                    <script type='module' src='${mainUri}'></script>
                </head>
                <body>

                    <vscode-button id='button-connect' title='Connect to Jaculus Device' aria-label='List WebUSB Devices'>
                        Connect
                    </vscode-button>

                    <vscode-button id='button-list' title='Flash Code to Jaculus Device' aria-label='List WebUSB Devices'>
                        List
                    </vscode-button>

                    <vscode-button id='button-build' title='Build/Compile Typescript to Javascript' aria-label='List WebUSB Devices'>
                        Build
                    </vscode-button>

                    <vscode-button id='button-flash' title='Flash Code to Jaculus Device' aria-label='List WebUSB Devices'>
                        Flash
                    </vscode-button>

                    <vscode-button id='button-monitor' title='Monitor Jaculus Device' aria-label='List WebUSB Devices'>
                        Monitor
                    </vscode-button>

                    <vscode-button id='button-build-flash-monitor' title='Build Flash and Monitor Jaculus Device' aria-label='List WebUSB Devices'>
                        Build Flash Monitor
                    </vscode-button>
                    
                </body>
            </html>
        `;
    }
}
