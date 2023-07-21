import * as vscode from 'vscode';

export class WebUsbWebview implements vscode.WebviewViewProvider {

    private static viewType = 'webusb.webview';

    public constructor(protected extensionUri: vscode.Uri) {
    }

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(WebUsbWebview.viewType, this)
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
        webviewView.title = 'WebUSƒB';
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
                    <vscode-button id='request-button-serial' title='Authorise WebUSB Device' aria-label='Authorise WebUSB Device'>
                        Serial
                    </vscode-button>
                    <vscode-button id='request-button-usb' title='Authorise WebUSB Device' aria-label='Authorise WebUSB Device'>
                        USB
                    </vscode-button>
                    <vscode-button id='list-button-serial' title='List WebUSB Devices' aria-label='List WebUSB Devices'>
                        List Devices Serial
                    </vscode-button>
                    <vscode-button id='list-button-usb' title='List WebUSB Devices' aria-label='List WebUSB Devices'>
                        List Devices USB
                    </vscode-button>
                    <vscode-button id='monitor-serial' title='List WebUSB Devices' aria-label='List WebUSB Devices'>
                        Monitor
                    </vscode-button>
                    <vscode-button id='upload' title='Upload' aria-label='List WebUSB Devices'>
                        Upload
                    </vscode-button>
                    <vscode-button id='transpile' title='Upload' aria-label='List WebUSB Devices'>
                        Transpile
                    </vscode-button>

                    <div id='monitor'></div>
                </body>
            </html>
        `;
    }
}
