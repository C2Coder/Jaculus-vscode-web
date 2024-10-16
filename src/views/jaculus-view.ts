window.addEventListener('load', () => {
    const vscodeApi = acquireVsCodeApi();

    const connectBtn = document.getElementById('button-connect')!;
    connectBtn.addEventListener('click', () => vscodeApi.postMessage('jaculus.connect'));
    
    const listBtn = document.getElementById('button-list')!;
    listBtn.addEventListener('click', () => vscodeApi.postMessage('listDevices'));
    
    const buildBtn = document.getElementById('button-build')!;
    buildBtn.addEventListener('click', () => vscodeApi.postMessage('jaculus.build'));
    
    const flashBtn = document.getElementById('button-flash')!;
    flashBtn.addEventListener('click', () => vscodeApi.postMessage('jaculus.flash'));
    
    const monitorBtn = document.getElementById('button-monitor')!;
    monitorBtn.addEventListener('click', () => vscodeApi.postMessage('jaculus.monitor'));

    const stopMonitorBtn = document.getElementById('button-stop-monitor')!;
    stopMonitorBtn.addEventListener('click', () => vscodeApi.postMessage('jaculus.stopMonitor'));

    const buildFlashMonitorBtn = document.getElementById('button-build-flash-monitor')!;
    buildFlashMonitorBtn.addEventListener('click', () => vscodeApi.postMessage('jaculus.build-flash-monitor'));
});