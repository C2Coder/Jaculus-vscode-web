import * as vscode from 'vscode';
import { JacDevice } from "../jaculus-tools/src/device/jacDevice";
import { WebSerialStream } from "./jac-glue";

async function readDirectory(path: vscode.Uri) {
    let tmp = await vscode.workspace.fs.readDirectory(path)
    return tmp
}


export class Commands {
    protected channel = vscode.window.createOutputChannel('Jaculus');
    protected device: JacDevice | undefined;
    protected port: any | undefined;

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            vscode.commands.registerCommand('jaculus-web.connect', () => this.connect()),
            vscode.commands.registerCommand('jaculus-web.listDevices', () => this.listDevices()),
            vscode.commands.registerCommand('jaculus-web.monitor', () => this.monitor()),
            vscode.commands.registerCommand('jaculus-web.stopMonitor', () => this.stopMonitor()),
            vscode.commands.registerCommand('jaculus-web.flash', () => this.flash()),
            vscode.commands.registerCommand('jaculus-web.build', () => this.build()),
            vscode.commands.registerCommand('jaculus-web.build-flash-monitor', () => this.buildFlashMonitor())
        );

        if (!navigator.usb) {
            const result = await vscode.window.showWarningMessage('Your browser does not support webusb', 'Show Supported Browsers');
            if (result === 'Show Supported Browsers') {
                vscode.env.openExternal(vscode.Uri.parse('https://caniuse.com/?search=webusb'));
            }
        } else {
            //this.listDevices();
        }
    }

    protected async connect(): Promise<void> {

        vscode.commands.executeCommand("workbench.experimental.requestSerialPort");

        // @ts-ignore
        const list = await navigator.serial.getPorts();
        this.port = list[0];

        await this.port.open({ baudRate: 921600 });
        let stream = new WebSerialStream(this.port);
        this.device = new JacDevice(stream);

        vscode.window.showInformationMessage('Connected');

    }

    protected async disconnect(): Promise<void> {
        if (this.device === undefined) {
            vscode.window.showErrorMessage('Disconnect: No device connected');
            return;
        }
        await this.device?.destroy();

        vscode.window.showInformationMessage('Disconnected');
    }

    protected async listDevices(): Promise<void> {
        vscode.window.showInformationMessage('List')
        // @ts-ignore
        const list = await navigator.serial.getPorts();
        // @ts-ignore
        const devices = list.map(device => ({
            usbProductId: device.getInfo().usbProductId,
            usbVendorId: device.getInfo().usbVendorId,
        }));
        const data = JSON.stringify(devices, undefined, '\t');
        this.channel.appendLine('Authorised WebSerial Devices:');
        this.channel.appendLine(data);
        this.channel.appendLine(JSON.stringify(list, undefined, '\t'));
        this.channel.show();
    }

    protected async monitor(): Promise<void> {
        if (this.device === undefined) {
            vscode.window.showErrorMessage('Monitor: No device connected');
            return;
        }

        this.device.programOutput.onData((data) => {
            this.channel.append(data.toString());
        });

        this.device.programError.onData((data) => {
            this.channel.append(data.toString());
        });

        vscode.window.showInformationMessage('Monitoring device');
    }

    protected async stopMonitor(): Promise<void> {
        vscode.window.showInformationMessage('Stop Monitor')

        if (this.device === undefined) {
            vscode.window.showErrorMessage('Stop Monitor: No device connected');
            return;
        }

        this.device.programOutput.onData((data) => {
        });

        this.device.programError.onData((data) => {
        });

        vscode.window.showInformationMessage('Stopped Monitoring Device');
    }

    protected async build(rawpath?: vscode.Uri): Promise<void> {
        vscode.window.showInformationMessage('Build')

        let folderPath: vscode.Uri | undefined;

        if (typeof rawpath !== 'undefined') { // path is string
            folderPath = rawpath;
        }
        else {
            let fileRaw = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
            });

            if (fileRaw === undefined) {
                vscode.window.showErrorMessage("No folder selected")
                return;
            }

            folderPath = fileRaw[0];
        }


        console.log(folderPath)



    }


    protected async flash(rawpath?: vscode.Uri): Promise<void> {
        vscode.window.showInformationMessage('Flash')

        if (this.device === undefined) {
            vscode.window.showErrorMessage('Flash: No device connected');
            return;
        }

        let folderPath: vscode.Uri | undefined;

        if (typeof rawpath !== 'undefined') { // path is string
            folderPath = rawpath;
        }
        else {
            let fileRaw = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
            });

            if (fileRaw === undefined) {
                vscode.window.showErrorMessage("No folder selected")
                return;
            }

            folderPath = fileRaw[0];
        }

        const files = [vscode.Uri.joinPath(folderPath, "build", "index.js")]

        let device = this.device;

        await device.controller.lock().catch((err) => {
            console.error("Error locking device: " + err);
            throw 1;
        }).then(() => {
            console.log("Locked device")
        });

        await device.controller.stop().catch((err) => {
            console.error("Error stopping device: " + err);
        }).then(() => {
            console.log("Stopped device")
        });

        let decoder = new TextDecoder('utf8');

        //files.forEach(async file => {
        let file = files[0]

        let FileContents = await vscode.workspace.fs.readFile(file);

        let code = decoder.decode(FileContents);
        this.channel.appendLine(`Appending code: ${code}`)

        let pathEsp: string = "code/" + file.path.split("build/")[1];

        let buff = Buffer.from(code, "utf-8")
        const cmd = await device.uploader.writeFile(pathEsp, buff).catch((err) => {
            console.error("Error: " + err + "\n");
            throw 1;
        })
        console.log(cmd.toString() + "\n");

        //});    

        await device.controller.start("index.js").catch((err) => {
            console.error("Error starting program: " + err + "\n");
            throw 1;
        }).then(() => {
            console.log("Started device")
        });

        await device.controller.unlock().catch((err) => {
            console.log("Error unlocking device: " + err);
            throw 1;
        }).then(() => {
            console.log("Unlocked device")
        });

        this.channel.appendLine('Done!')
    }


    protected async buildFlashMonitor(): Promise<void> {
        vscode.window.showInformationMessage('Build Flash Monitor')
        let folder = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
        });


        if (folder === undefined) {
            vscode.window.showErrorMessage('No folder selected');
            return;
        }

        await this.build(folder[0]);
        await this.flash(folder[0]);
        await this.monitor();
    }

}
