import * as vscode from "vscode";
import { JacDevice } from "../jaculus-tools/src/device/jacDevice";
import { WebSerialStream } from "./jac-glue";
import * as ts from "typescript";

async function readDirectory(
    path: vscode.Uri
): Promise<[vscode.Uri[], vscode.Uri[]]> {
    let outFiles: vscode.Uri[] = [];
    let outFolders: vscode.Uri[] = [];

    let tmp = await vscode.workspace.fs.readDirectory(path);

    for (let dir of tmp) {
        if (dir[1] == vscode.FileType.Directory) {
            outFolders.push(vscode.Uri.joinPath(path, dir[0]));

            let [t, _] = await readDirectory(vscode.Uri.joinPath(path, dir[0]));
            outFiles = outFiles.concat(t);
        }

        if (dir[1] == vscode.FileType.File) {
            outFiles.push(vscode.Uri.joinPath(path, dir[0]));
        }
    }
    return [outFiles, outFolders];
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// connect: vscode.StatusBarItem;
type btnType = {
    connect: vscode.StatusBarItem;
    build: vscode.StatusBarItem;
    flash: vscode.StatusBarItem;
    monitor: vscode.StatusBarItem;
    buildFlashMonitor: vscode.StatusBarItem;
    installLib: vscode.StatusBarItem;
    getExample: vscode.StatusBarItem;
};

type exampleType = {
    file: string;
    name: string;
};

type libType = {
    name: string;
    description: string;
    folder: string;
    files: string[];
    examples: exampleType[];
};

const librariesUri = vscode.Uri.parse(
    "https://c2coder.github.io/Jaculus-libraries/"
);

export class Commands {
    protected channel = vscode.window.createOutputChannel("Jaculus");
    protected device: JacDevice | undefined;
    protected port: any | undefined;

    protected connected: boolean = false;
    protected monitoring: boolean = false;

    protected buttons: btnType | undefined;

    public async activate(
        context: vscode.ExtensionContext,
        buttons: btnType
    ): Promise<void> {
        this.buttons = buttons;

        context.subscriptions.push(
            vscode.commands.registerCommand("jaculus.openInstaller", () =>
                this.openInstaller()
            ),
            vscode.commands.registerCommand("jaculus.openGettingStarted", () =>
                this.openGettingStarted()
            ),

            vscode.commands.registerCommand("jaculus.connect", () =>
                this.connect()
            ),
            // vscode.commands.registerCommand("jaculus.connect", () => this.connect()),
            // vscode.commands.registerCommand("jaculus.disconnect", () =>
            //     this.disconnect()
            // ),
            vscode.commands.registerCommand("jaculus.build", () => this.build()),
            vscode.commands.registerCommand("jaculus.flash", () => this.flash()),
            vscode.commands.registerCommand("jaculus.monitor", () => this.monitor()),
            vscode.commands.registerCommand("jaculus.stopMonitor", () =>
                this.stopMonitor()
            ),
            vscode.commands.registerCommand("jaculus.build-flash-monitor", () =>
                this.buildFlashMonitor()
            ),

            vscode.commands.registerCommand("jaculus.installLib", () =>
                this.installLib()
            ),
            vscode.commands.registerCommand("jaculus.getLibExample", () =>
                this.getLibExample()
            )
        );

        if (!navigator.usb) {
            const result = await vscode.window.showWarningMessage(
                "Your browser does not support webusb",
                "Show Supported Browsers"
            );
            if (result === "Show Supported Browsers") {
                vscode.env.openExternal(
                    vscode.Uri.parse("https://caniuse.com/?search=webusb")
                );
            }
        }
    }



    protected async openInstaller(): Promise<void> {
        vscode.env.openExternal(vscode.Uri.parse("https://installer.jaculus.org"));
    }

    protected async openGettingStarted(): Promise<void> {
        vscode.env.openExternal(vscode.Uri.parse("https://jaculus.org/getting-started"));
    }

    protected async connect(): Promise<void> {
        await vscode.commands.executeCommand(
            "workbench.experimental.requestSerialPort"
        );

        // Try to get the selected port info and update the button title
        // @ts-ignore
        const ports: any[] = await navigator.serial.getPorts();
        if (ports.length > 0 && this.buttons) {
            const port = ports[0];
            let portInfo = "";

            // Try to get the port path/name if available
            if (port.path) {
                portInfo = port.path;
            } else if (port.name) {
                portInfo = port.name;
            } else if (port.getInfo && port.getInfo().path) {
                portInfo = port.getInfo().path;
            } else if (port.getInfo && port.getInfo().serialNumber) {
                portInfo = port.getInfo().serialNumber;
            } else {
                portInfo = "Port Selected";
            }

            this.buttons.connect.text = `$(plug) ${portInfo}`;
            this.buttons.connect.tooltip = "Selected Serial Port";

            // @ts-ignore
            const port_list: any[] = await navigator.serial.getPorts();
            this.port = port_list[0];
            await this.port.open({ baudRate: 921600 });
            let stream = new WebSerialStream(this.port);
            this.device = new JacDevice(stream);

            vscode.window.showInformationMessage("Connected");
        }
    }

    protected async build(rawpath?: vscode.Uri): Promise<void> {
        let folderPath: vscode.Uri;

        // Get the currently opened workspace folder
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage("No workspace folder is open");
            return;
        }
        const [__, foldersPresent] = await readDirectory(workspaceFolders[0].uri);
        if (foldersPresent.some(folderUri => folderUri.path.endsWith("/src"))) {
            folderPath = vscode.Uri.joinPath(workspaceFolders[0].uri, "src");
        }
        else if (typeof rawpath !== "undefined") {
            folderPath = rawpath;
        } else {
            let fileRaw = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
            });

            if (fileRaw === undefined) {
                vscode.window.showErrorMessage("No folder selected");
                return;
            }

            folderPath = fileRaw[0];
        }

        vscode.window.showInformationMessage("Building: " + folderPath.path);

        let [files, _] = await readDirectory(folderPath);

        for (let file of files) {
            if (file.path.includes("@types") || !file.path.includes(".ts")) {
                continue;
            }

            try {
                // Read the TypeScript file content
                const tsCode = await vscode.workspace.fs.readFile(file);
                const tsCodeStr = new TextDecoder().decode(tsCode);

                // Set TypeScript compiler options
                const compilerOptions: ts.CompilerOptions = {
                    module: ts.ModuleKind.ES2020,
                    target: ts.ScriptTarget.ES2020,
                    lib: ["es2020"],
                    moduleResolution: ts.ModuleResolutionKind.Node10,
                    sourceMap: false,
                    outDir: "build",
                    rootDir: "src",
                };

                // Transpile the TypeScript code to JavaScript
                const jsCode = ts.transpile(tsCodeStr, compilerOptions);

                // Write the transpiled JavaScript code to a file
                const jsUri = file.with({
                    path: file.path.replace(/\.ts$/, ".js").replace("src", "build"),
                });
                await vscode.workspace.fs.writeFile(
                    jsUri,
                    new TextEncoder().encode(jsCode)
                );
            } catch (error: any) {
                vscode.window.showErrorMessage(
                    `Error converting file: ${error.message}`
                );
            }
        }

        vscode.window.showInformationMessage("Done Building");
    }

    protected async flash(rawpath?: vscode.Uri): Promise<void> {
        if (this.device === undefined) {
            vscode.window.showErrorMessage("Flash: No device connected");
            return;
        }

        let folderPath: vscode.Uri;
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage("No workspace folder is open");
            return;
        }
        const [__, foldersPresent] = await readDirectory(workspaceFolders[0].uri);
        if (foldersPresent.some(folderUri => folderUri.path.endsWith("/build"))) {
            folderPath = vscode.Uri.joinPath(workspaceFolders[0].uri, "build");
        }
        else if (typeof rawpath !== "undefined") {
            folderPath = rawpath;
        } else {
            let fileRaw = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
            });

            if (fileRaw === undefined) {
                vscode.window.showErrorMessage("No folder selected");
                return;
            }

            folderPath = fileRaw[0];
        }

        vscode.window.showInformationMessage("Flashing: " + folderPath.path);

        let device = this.device;

        let decoder = new TextDecoder("utf8");
        let [buildFiles, buildDirs] = await readDirectory(folderPath);

        await device.controller
            .lock()
            .catch((err) => {
                console.error("Error locking device: " + err);
                throw 1;
            })
            .then(() => {
                console.log("Locked device");
            });

        await device.controller
            .stop()
            .catch((err) => {
                console.error("Error stopping device: " + err);
            })
            .then(() => {
                console.log("Stopped device");
            });

        // TODO - add a feature for not sending same files
        /*let espDir = await device.uploader.listDirectory("code").catch((err) => {
                console.error("Error reading code dir: " + err);
            }).then(() => {
                console.log("Read code dir")
            });
    
            let espHash = await device.uploader.getDirHashes("code").catch((err) => {
                console.error("Error getting hashes: " + err);
            }).then(() => {
                console.log("Got hashes from device")
            });*/

        for (let dir of buildDirs) {
            let espPath =
                "code/" +
                dir.path.replace(folderPath.path, "");
            await device.uploader
                .createDirectory(espPath)
                .catch((err) => {
                    console.error("Error creating dir: " + espPath + " err:" + err);
                })
                .then(() => {
                    console.log("Stopped ");
                });
        }

        for (let file of buildFiles) {
            if (!file.path.includes(".js")) {
                continue;
            }

            let FileContents = await vscode.workspace.fs.readFile(file);

            let code = decoder.decode(FileContents);

            let pathEsp: string = "code/" + file.path.split("build/")[1];

            let buff = Buffer.from(code, "utf-8");
            const cmd = await device.uploader
                .writeFile(pathEsp, buff)
                .catch((err) => {
                    console.error("Error: " + err + "\n");
                    throw 1;
                });
            console.log(cmd.toString() + "\n");

            await sleep(200);
        }
        //});

        await device.controller
            .start("index.js")
            .catch((err) => {
                console.error("Error starting program: " + err + "\n");
                throw 1;
            })
            .then(() => {
                console.log("Started device");
            });

        await device.controller
            .unlock()
            .catch((err) => {
                console.log("Error unlocking device: " + err);
                throw 1;
            })
            .then(() => {
                console.log("Unlocked device");
            });

        this.channel.appendLine("Done Flashing!");
    }

    protected async monitor(): Promise<void> {
        if (this.device === undefined) {
            vscode.window.showErrorMessage("Monitor: No device connected");
            return;
        }
        this.monitoring = true;

        if (this.buttons !== undefined) {
            this.buttons.monitor.command = "jaculus.stopMonitor";
            this.buttons.monitor.text = "$(device-desktop) Stop Monitoring";
            this.buttons.monitor.tooltip = "Jaculus Stop Monitoring";
        }


        this.device.programOutput.onData((data) => {
            this.channel.append(data.toString());
        });

        this.device.programError.onData((data) => {
            this.channel.append(data.toString());
        });

        this.channel.show();

        // vscode.window.showInformationMessage("Monitoring device");
    }

    protected async stopMonitor(): Promise<void> {
        if (this.device === undefined) {
            vscode.window.showErrorMessage("Stop Monitor: No device connected");
            return;
        }
        this.monitoring = false;

        if (this.buttons !== undefined) {
            this.buttons.monitor.command = "jaculus.monitor";
            this.buttons.monitor.text = "$(device-desktop) Monitor";
            this.buttons.monitor.tooltip = "Jaculus Monitor";
        }


        this.device.programOutput.onData((data) => { });

        this.device.programError.onData((data) => { });

        // vscode.window.showInformationMessage("Stopped Monitoring Device");
    }

    protected async buildFlashMonitor(): Promise<void> {
        await this.build();
        await this.flash();
        await this.monitor();
    }
    
    protected async installLib(): Promise<void> {
        try {
            let folderPath: vscode.Uri;

            // Get the currently opened workspace folder
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage("No workspace folder is open");
                return;
            }
            const [__, foldersPresent] = await readDirectory(workspaceFolders[0].uri);
            if (foldersPresent.some(folderUri => folderUri.path.endsWith("/src"))) {
                folderPath = workspaceFolders[0].uri;
            }
            else {
                let fileRaw = await vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                });

                if (fileRaw === undefined) {
                    vscode.window.showErrorMessage("No folder selected");
                    return;
                }

                folderPath = fileRaw[0];
            }

            const response = await fetch(
                vscode.Uri.joinPath(librariesUri, "data", "manifest.json").toString()
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData: libType[] = await response.json();

            const libraries: { [key: string]: libType } = {};
            console.log(jsonData);
            for (const libData of jsonData) {
                libraries[libData.name] = libData;
            }

            const options: vscode.QuickPickItem[] = [];

            for (let libData of Object.values(libraries)) {
                options.push({
                    label: libData.name,
                    detail: libData.description,
                });
            }

            const selectedLibrary = await vscode.window.showQuickPick(options, {
                placeHolder: "Select an library to install",
            });

            if (!selectedLibrary) {
                vscode.window.showWarningMessage("No option selected");
                return;
            }

            vscode.window.showInformationMessage(
                `Installing: ${selectedLibrary.label}`
            );

            if (selectedLibrary.label === "@types") {
                folderPath = vscode.Uri.joinPath(folderPath, "@types");
            }
            else {
                folderPath = vscode.Uri.joinPath(folderPath, "src", "libs");
            }

            const libData: libType = libraries[selectedLibrary.label];

            for (let file of libData.files) {
                const response = await fetch(
                    vscode.Uri.joinPath(
                        librariesUri,
                        "data",
                        libData.folder,
                        file
                    ).toString()
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                await vscode.workspace.fs.writeFile(
                    vscode.Uri.joinPath(folderPath, file),
                    new TextEncoder().encode(await response.text())
                );
            }

            vscode.window.showInformationMessage(
                `Installed: ${selectedLibrary.label}`
            );
        } catch (error) {
            vscode.window.showErrorMessage(`Error fetching JSON data: ${error}`);
            console.error(error);
        }
    }

    protected async getLibExample(): Promise<void> {
        try {
            let folderPath: vscode.Uri;

            // Get the currently opened workspace folder
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage("No workspace folder is open");
                return;
            }
            const [__, foldersPresent] = await readDirectory(workspaceFolders[0].uri);
            if (foldersPresent.some(folderUri => folderUri.path.endsWith("/src"))) {
                folderPath = vscode.Uri.joinPath(workspaceFolders[0].uri, "src");
            }
            else {
                let fileRaw = await vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                });

                if (fileRaw === undefined) {
                    vscode.window.showErrorMessage("No folder selected");
                    return;
                }

                folderPath = fileRaw[0];
            }

            const jsonresponse = await fetch(
                vscode.Uri.joinPath(librariesUri, "data", "manifest.json").toString()
            );
            if (!jsonresponse.ok) {
                throw new Error(`HTTP error! status: ${jsonresponse.status}`);
            }
            const jsonData: libType[] = await jsonresponse.json();

            const libraries: { [key: string]: libType } = {};
            const examples: { [key: string]: { [key: string]: exampleType } } = {};
            for (const libData of jsonData) {
                libraries[libData.name] = libData;
                for (const exampleData of libData.examples) {
                    if (examples[libData.name] == undefined) {
                        examples[libData.name] = {};
                    }
                    examples[libData.name][exampleData.name] = exampleData;
                }
            }

            const libOptions: vscode.QuickPickItem[] = [];

            for (let libData of Object.values(libraries)) {
                libOptions.push({
                    label: libData.name,
                    detail: libData.description,
                });
            }

            const selectedLibrary = await vscode.window.showQuickPick(libOptions, {
                placeHolder: "Select an library",
            });

            if (!selectedLibrary) {
                vscode.window.showWarningMessage("No library selected");
                return;
            }

            const exampleOptions: vscode.QuickPickItem[] = [];

            for (let exampleData of Object.values(examples[selectedLibrary.label])) {
                exampleOptions.push({
                    label: exampleData.name,
                    //detail: exampleData.description,
                });
            }

            const selectedExample = await vscode.window.showQuickPick(
                exampleOptions,
                {
                    placeHolder: "Select an example to get",
                }
            );

            if (!selectedExample) {
                vscode.window.showWarningMessage("No example selected");
                return;
            }

            vscode.window.showInformationMessage(
                `Getting: ${selectedExample.label} from ${selectedLibrary.label}`
            );
            const libData: libType = libraries[selectedLibrary.label];
            const exampleData: exampleType =
                examples[selectedLibrary.label][selectedExample.label];

            const response = await fetch(
                vscode.Uri.joinPath(
                    librariesUri,
                    "data",
                    libData.folder,
                    exampleData.file
                ).toString()
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const fileContents = await response.text();

            await vscode.workspace.fs.writeFile(
                vscode.Uri.joinPath(
                    folderPath,
                    `${libData.name}-${exampleData.file.split("/").at(-1)}`
                ),
                new TextEncoder().encode(fileContents)
            );
        } catch (error) {
            vscode.window.showErrorMessage(`Error fetching JSON data: ${error}`);
            console.error(error);
        }
    }
}
