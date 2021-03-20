// Modules to control application life and create native browser window
const {app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const {spawn} = require("child_process");
/*
try {
require('electron-reloader')(module)
} catch (_) {
}
*/
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.removeMenu()

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const window = createWindow()


  ipcMain.on('saveTo_ToMain', (event, msg) => {
    console.log(msg) // msg from web page
    const savePath = dialog.showOpenDialog({
      title: "Select a folder",
      properties: ["openDirectory"]
    }).then(result => {
      window.webContents.send('saveTo_ToPreload', result) // send to web page
    }).catch(err => {
      window.webContents.send('saveTo_ToPreload', err) // send to web page
    })
  })

  ipcMain.on('nvenc_ToMain', (event, msg) => {
    console.log(msg) // msg from web page
    const nvencPath = dialog.showOpenDialog({
      title: "Select nvenc executable"
    }).then(result => {
      window.webContents.send('nvenc_ToPreload', result) // send to web page
    }).catch(err => {
      window.webContents.send('nvenc_ToPreload', err) // send to web page
    })
  })




  app.on('activate', function () {

    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
