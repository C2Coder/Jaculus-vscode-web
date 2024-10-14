import * as vscode from 'vscode';
import { Commands } from './commands';
//import { JaculusWebView } from '../views/jaculus-main';

export const activate = async (context: vscode.ExtensionContext): Promise<void> => {
    //const webusbView = new JaculusWebView(context.extensionUri);
    const commands = new Commands();

    //await webusbView.activate(context);
    await commands.activate(context);

    const color = "#ff8500";

    let connectionBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    connectionBtn.command = "jaculus-web.connect";
    connectionBtn.text = "$(plug) Connect";
    connectionBtn.tooltip = "Jaculus Connect";
    connectionBtn.color = color;
    connectionBtn.show();

    let buildBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    buildBtn.command = "jaculus-web.build";
    buildBtn.text = "$(database) Build";
    buildBtn.tooltip = "Jaculus Build";
    buildBtn.color = color;
    buildBtn.show();

    let flashBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    flashBtn.command = "jaculus-web.flash";
    flashBtn.text = "$(zap) Flash";
    flashBtn.tooltip = "Jaculus Flash";
    flashBtn.color = color;
    flashBtn.show();

    let monitorBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    monitorBtn.command = "jaculus-web.monitor";
    monitorBtn.text = "$(device-desktop) Monitor";
    monitorBtn.tooltip = "Jaculus Monitor";
    monitorBtn.color = color;
    monitorBtn.show();

    let stopMonitorBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    stopMonitorBtn.command = "jaculus-web.stopMonitor";
    stopMonitorBtn.text = "$(device-desktop) Stop Monitor";
    stopMonitorBtn.tooltip = "Jaculus Stop Monitor";
    stopMonitorBtn.color = color;
    stopMonitorBtn.show();

    let buildFlashMonitorBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    buildFlashMonitorBtn.command = "jaculus-web.build-flash-monitor";
    buildFlashMonitorBtn.text = "$(diff-renamed) Build, Flash and Monitor";
    buildFlashMonitorBtn.tooltip = "Jaculus Build, Flash and Monitor";
    buildFlashMonitorBtn.color = color;
    buildFlashMonitorBtn.show();
};