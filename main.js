const { app, BrowserWindow, Tray, Menu, dialog, ipcMain } = require('electron')
const path = require('path')
const { localStorage } = require(path.join(__dirname, 'render/utils/utils.js'))

let win = null
let timer = null
let jobTimer = null
let appIcon = null
let neddLogSend = true


function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'img/logo/logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    },
  })
  win.setSkipTaskbar(true)
  win.loadFile('index.html')

  win.on('close', event => {
    event.preventDefault()
    win.hide()
  })

  ipcMain.on('indexLoad', () => {
    win.webContents.send('checkNeddLogSend')
    ipcMain.on('checkNeddLogSendResult', (event, arg) => {
      neddLogSend = arg
      // 设置任务计划
      computedHoursStart()
      setInterval(computedHoursStart, 1000 * 60 * 60)
    })
  })
}

// 计算下午六点开始执行循环查找
function computedHoursStart (hours = 18) {
  if (jobTimer) return
  let date = new Date()
  let dateIntegralPoint = new Date()
  dateIntegralPoint.setHours(hours)
  dateIntegralPoint.setMinutes(0)
  dateIntegralPoint.setSeconds(0)
  let step = dateIntegralPoint - date
  if (step < 0) {
    step = 1000 * 60 * 60 * 24 + step
  }
  console.log('step', step)
  jobTimer = setTimeout(loopSendLog, step)
}

// 循环让用户填写日志
function loopSendLog () {
  timer = setInterval(() => {
    if (neddLogSend && !win.isVisible()) {
      win.show()
    } else if (!neddLogSend) {
      clearInterval(timer)
      clearTimeout(jobTimer)
      jobTimer = null
      timer = null
      console.log('清除定时器')
    }
  }, 30000)
}

// 创建系统托盘
function createTray () {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '发送日报',
      click () {
        win.show()
      }
    },
    {
      label: '退出',
      click () {
        win = null
        app.exit()
      }
    }
  ])
  appIcon = new Tray(path.join(__dirname, 'img/logo/logo-16.png'))
  appIcon.setContextMenu(contextMenu)
}

if (process.platform === 'darwin') {
  app.dock.hide()
}

app.whenReady().then(() => {
  createWindow()
  createTray()
})
app.on('activate', () => {
  console.log('activate')
  if (process.platform !== 'darwin') {
    win.show()
  } else if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('window-all-closed', event => {})
