const { app, BrowserWindow } = require('electron')

app.on('ready', () => {
    let mainWindow = new BrowserWindow({
        width: 1160,
        height: 720,
    });
    mainWindow.loadURL('https://demo-rtc.herewhite.com');
});