const { app, BrowserWindow } = require('electron')
const path = require("path");

app.on('ready', () => {
    // 新建一个窗口
    let mainWindow = new BrowserWindow({
        width: 1160,
        height: 720,
    });
    // 原有的项目开发环境下的 devServer 的端口是 3000 ，我们这里以 url 形式把原有项目加载进来
    // mainWindow.loadURL('http://localhost:3000');
    mainWindow.loadFile(path.join(__dirname, "./build/index.html"));
});