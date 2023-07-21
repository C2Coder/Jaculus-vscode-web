import * as vscode from 'vscode';
import { JacDevice } from "../jaculus-tools/src/device/jacDevice";
import {WebSerialStream} from "./jac-glue";

export class Commands {

    protected channel = vscode.window.createOutputChannel('webusb');
    protected device: JacDevice | undefined;

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        context.subscriptions.push(
            vscode.commands.registerCommand('webusb.listDevicesUsb', () => this.listDevicesUsb()),
            vscode.commands.registerCommand('webusb.listDevicesSerial', () => this.listDevicesSerial()),
            vscode.commands.registerCommand('webusb.monitorSerial', () => this.monitorSerial()),
            vscode.commands.registerCommand('webusb.upload', () => this.writeFile()),
        );

        if (!navigator.usb) {
            const result = await vscode.window.showWarningMessage('Your browser does not support WebUSB', 'Show Supported Browsers');
            if (result === 'Show Supported Browsers') {
                vscode.env.openExternal(vscode.Uri.parse('https://caniuse.com/?search=webusb'));
            }
        } else {
            this.listDevicesUsb();
        }
    }

    protected async listDevicesUsb(): Promise<void> {
        const list = await navigator.usb.getDevices();
        const devices = list.map(device => ({
            VID: device.vendorId,
            PID: device.productId,
            Serial: device.serialNumber
        }));
        const data = JSON.stringify(devices, undefined, '\t');
        this.channel.appendLine('Authorised WebUSB Devices:');
        this.channel.appendLine(data);
        this.channel.show();
    }

    protected async listDevicesSerial(): Promise<void> {
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

    protected async monitorSerial(): Promise<void> {
        this.channel.appendLine('Monitoring serial port...')

        // @ts-ignore
        const list = await navigator.serial.getPorts();
        if (list.length === 0) {
            vscode.window.showWarningMessage('No serial ports available');
            return;
        }
        let port = list[0];

        await port.open({ baudRate: 921600 });
        let stream = new WebSerialStream(port);
        console.log(stream);
        this.device = new JacDevice(stream);
        console.log(this.device);

        this.device.programOutput.onData((data) => {
            this.channel.appendLine(data.toString());
        });

        this.device.programError.onData((data) => {
            this.channel.appendLine(data.toString());
        });
    }

    protected async writeFile(): Promise<void> {
        if (this.device === undefined) {
            vscode.window.showErrorMessage('No device connected');
            return;
        }

        this.channel.appendLine('Writing file...')

        let fileRaw = await vscode.window.showOpenDialog({
            canSelectFiles: true,
        }
        );

        if (fileRaw === undefined) {
            vscode.window.showErrorMessage('No file selected');
            return;
        }
        let FileContents = await vscode.workspace.fs.readFile(fileRaw[0]);

        let decoder = new TextDecoder('utf8');
        let code = decoder.decode(FileContents);
        this.channel.appendLine(`Appending code: ${code}`)

        let device = this.device;

        await device.controller.lock().catch((err) => {
            console.error("Error locking device: " + err);
            throw 1;
        });

        await device.controller.stop().catch((err) => {
            console.error("Error stopping device: " + err);
        });

        let pathEsp: string = "code/index.js";

        let buff = Buffer.from(code, "utf-8")
        const cmd = await device.uploader.writeFile(pathEsp, buff).catch((err) => {
            console.error("Error: " + err + "\n");
            throw 1;
        });
        console.log(cmd.toString() + "\n");

        await device.controller.start("index.js").catch((err) => {
            console.error("Error starting program: " + err + "\n");
            throw 1;
        });

        await device.controller.unlock().catch((err) => {
            console.log("Error unlocking device: " + err);
            throw 1;
        });

        this.channel.appendLine('Done!')
    }

}
