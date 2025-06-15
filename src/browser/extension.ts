import * as vscode from 'vscode';
import { Commands } from './commands';
//import { JaculusWebView } from '../views/jaculus-main';

export const activate = async (context: vscode.ExtensionContext): Promise<void> => {
    const color = "#ff8500";

    let connectBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    connectBtn.command = "jaculus.connect";
    connectBtn.text = "$(plug) Connect";
    connectBtn.tooltip = "Jaculus Connect";
    connectBtn.color = color;
    connectBtn.show();

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
    installLibBtn.command = "jaculus.installLib";
    installLibBtn.text = "$(folder-library) Install Library";
    installLibBtn.tooltip = "Jaculus Install Library";
    installLibBtn.color = color;
    installLibBtn.show();

    let getExampleBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    getExampleBtn.command = "jaculus.getLibExample";
    getExampleBtn.text = "$(book) Get Example";
    getExampleBtn.tooltip = "Jaculus Get Example";
    getExampleBtn.color = color;
    getExampleBtn.show();

    
    // "connect": connectionBtn,
    let buttons = {
        "connect": connectBtn,
        "build": buildBtn,
        "flash": flashBtn,
        "monitor": monitorBtn,
        "buildFlashMonitor": buildFlashMonitorBtn,
        "installLib":installLibBtn,
        "getExample": getExampleBtn
    }

    const commands = new Commands();
    await commands.activate(context, buttons);



};