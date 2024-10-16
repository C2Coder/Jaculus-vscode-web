import * as vscode from 'vscode';
import { Commands } from './commands';
//import { JaculusWebView } from '../views/jaculus-main';

export const activate = async (context: vscode.ExtensionContext): Promise<void> => {
    const color = "#ff8500";

    let portBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    portBtn.command = "jaculus.selectPort";
    portBtn.text = "$(plug) Select Port";
    portBtn.tooltip = "Jaculus Select Port";
    portBtn.color = color;
    portBtn.show();

    let connectionBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    connectionBtn.command = "jaculus.connect";
    connectionBtn.text = "$(plug) Connect";
    connectionBtn.tooltip = "Jaculus Connect";
    connectionBtn.color = color;
    connectionBtn.show();

    let buildBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    buildBtn.command = "jaculus.build";
    buildBtn.text = "$(database) Build";
    buildBtn.tooltip = "Jaculus Build";
    buildBtn.color = color;
    buildBtn.show();

    let flashBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    flashBtn.command = "jaculus.flash";
    flashBtn.text = "$(zap) Flash";
    flashBtn.tooltip = "Jaculus Flash";
    flashBtn.color = color;
    flashBtn.show();

    let monitorBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    monitorBtn.command = "jaculus.monitor";
    monitorBtn.text = "$(device-desktop) Monitor";
    monitorBtn.tooltip = "Jaculus Monitor";
    monitorBtn.color = color;
    monitorBtn.show();

    let buildFlashMonitorBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    buildFlashMonitorBtn.command = "jaculus.build-flash-monitor";
    buildFlashMonitorBtn.text = "$(diff-renamed) Build, Flash and Monitor";
    buildFlashMonitorBtn.tooltip = "Jaculus Build, Flash and Monitor";
    buildFlashMonitorBtn.color = color;
    buildFlashMonitorBtn.show();

    let installLibBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    buildFlashMonitorBtn.command = "jaculus.installLib";
    buildFlashMonitorBtn.text = "$(folder-library) Install Library";
    buildFlashMonitorBtn.tooltip = "Install Library";
    buildFlashMonitorBtn.color = color;
    buildFlashMonitorBtn.show();

    let buttons = {
        "selectPort": portBtn,
        "connect": connectionBtn,
        "build": buildBtn,
        "flash": flashBtn,
        "monitor": monitorBtn,
        "buildFlashMonitor": buildFlashMonitorBtn,
        "installLib":installLibBtn,
    }
    //const webusbView = new JaculusWebView(context.extensionUri);
    const commands = new Commands();

    //await webusbView.activate(context);
    await commands.activate(context, buttons);



};