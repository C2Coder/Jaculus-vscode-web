window.addEventListener('load', () => {
    const vscodeApi = acquireVsCodeApi();

    const requestButtonUsb = document.getElementById('request-button-usb')!;
    const requestButtonSerial = document.getElementById('request-button-serial')!;
    const listButtonSerial = document.getElementById('list-button-serial')!;
    const listButtonUsb = document.getElementById('list-button-usb')!;
    const buttonMonitorSerial = document.getElementById('monitor-serial')!;
    const buttonUpload = document.getElementById('upload')!;

    requestButtonUsb.addEventListener('click', () => vscodeApi.postMessage('workbench.experimental.requestUsbDevice'));
    requestButtonSerial.addEventListener('click', () => vscodeApi.postMessage('workbench.experimental.requestSerialPort'));
    listButtonUsb.addEventListener('click', () => vscodeApi.postMessage('webusb.listDevicesUsb'));
    listButtonSerial.addEventListener('click', () => vscodeApi.postMessage('webusb.listDevicesSerial'));

    buttonMonitorSerial.addEventListener('click', () => vscodeApi.postMessage('webusb.monitorSerial'));
    buttonUpload.addEventListener('click', () => vscodeApi.postMessage('webusb.upload'));
});
