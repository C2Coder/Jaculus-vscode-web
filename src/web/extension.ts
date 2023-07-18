import * as vscode from 'vscode';
// import { WebSerialStream } from './jac-glue.js';
// import { JacDevice } from "jaculus-tools/dist/src/device/jacDevice";
// import { Duplex } from "jaculus-tools/dist/src/link/stream";
import { Buffer } from "buffer";

// let device : JacDevice | null = null;
// let streamSerial : WebSerialStream | null = null;

export async function activate(context: vscode.ExtensionContext) {
  // https://code.visualstudio.com/updates/v1_69#_webusb-webserial-and-webhid-access-on-web
	await vscode.commands.executeCommand('workbench.experimental.requestUsbDevice', {

	  });


    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'jaculus-web.connectWebSerial';
    statusBarItem.text = 'Connect to USB';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    context.subscriptions.push(
        vscode.commands.registerCommand('jaculus-web.connectWebSerial', async () => {
            try {
                navigator.serial.requestPort()
                  .then( async port => {
                    await port.open({baudRate: 921600});
					vscode.window.showInformationMessage(`Connected to ${port.getInfo().usbProductId}`);
                    // streamSerial = new WebSerialStream(port);
                    // if(device) {
					//   device.destroy();
					// }
					// device = new JacDevice(streamSerial);
                  })
                  .catch((e) => {
                    vscode.window.showErrorMessage(e);
                  });
                // TODO: Do something with the device, e.g. initialize it.
            } catch (error) {
                console.error('Could not connect to device:', error);
            }
        })
    );

    // context.subscriptions.push(
    //     vscode.commands.registerCommand('jaculus-web.interactWebUSB', async () => {
    //         try {
    //             if (!usbDevice) {
    //                 throw new Error('No USB device connected');
    //             }
    //             // TODO: Do something with the device, e.g. send or receive data.
    //         } catch (error) {
    //             console.error('Could not interact with device:', error);
    //         }
    //     })
    // );
}



// class WebSerialError extends Error {
//     constructor(message: string) {
//       super(message);
//       this.name = "WebSerialError";
//     }
//   }


// export class WebSerialStream implements Duplex {
//     private callbacks: {
//         "data"?: (data: Buffer) => void,
//         "error"?: (err: any) => void,
//         "end"?: () => void
//     } = {};

//     private port: SerialPort;
//     private reader: ReadableStreamDefaultReader<Uint8Array>;
//     private writer: WritableStreamDefaultWriter<Uint8Array> ;

//     constructor(port: SerialPort) {
//         this.port = port;

//         const reader = this.port.readable?.getReader();
//         if (!reader)
//             throw new WebSerialError("Cannot open reader");

//         const writer = this.port.writable?.getWriter();
//         if (!writer)
//             throw new WebSerialError("Cannot open writer");

//         this.reader = reader;
//         this.writer = writer;

//         const self = this;
//         const readRoutine = async () => {
//             try {
//                 while (true) {
//                     const { value, done } = await self.reader.read();
//                     if (done) {
//                         self.reader.releaseLock();
//                         if (self.callbacks["end"])
//                             self.callbacks["end"]();
//                         break;
//                     } else {
//                         if (self.callbacks["data"])
//                             self.callbacks["data"](Buffer.from(value));
//                     }
//                 }
//             } catch (error) {
//                 console.log(error);
//             }
//         };
//         readRoutine();
//     }

//     public put(c: number): void {
//         this.writer.write(Buffer.from([c]));
//     }

//     public write(buf: Buffer): void {
//         const bufCopy = Buffer.from(buf);
//         this.writer.write(bufCopy);
//     }

//     public onData(callback?: (data: Buffer) => void): void {
//         this.callbacks["data"] = callback;
//     }

//     public onEnd(callback?: () => void): void {
//         this.callbacks["end"] = callback;
//     }

//     public onError(callback?: (err: any) => void): void {
//         this.callbacks["error"] = callback;
//     }

//     public destroy(): Promise<void> {
//         // TBA: Check API doc
//         // if (this.port.state === "closed") {
//         //     return Promise.resolve();
//         // }

//         return new Promise((resolve, reject) => {
//             if (this.callbacks["end"]) {
//                 const end = this.callbacks["end"];
//                 this.callbacks["end"] = () => {
//                     end();
//                     resolve();
//                 };
//             }
//             else {
//                 this.callbacks["end"] = () => {
//                     resolve();
//                 };
//             }
//             if (this.callbacks["error"]) {
//                 const error = this.callbacks["error"];
//                 this.callbacks["error"] = (err: any) => {
//                     error(err);
//                     reject(err);
//                 };
//             }
//             else {
//                 this.callbacks["error"] = (err: any) => {
//                     reject(err);
//                 };
//             }

//             (async () => {
//                 await this.reader.cancel();
//                 await this.writer.abort();
//                 await this.port.close();
//             })
//         });
//     }
// };
