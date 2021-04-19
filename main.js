const { app, BrowserWindow } = require('electron')
const path = require('path')
let win = null
function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    },
  })
  win.loadFile('index.html')
}

app.whenReady().then((res) => {
  console.log('app, wenReady')
  createWindow()
  app.on('activate', (event) => {
    console.log('activate')
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  console.log('window-all-closed')
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('closed', () => {
  console.log('closed')
})
