const { app, BrowserWindow, Tray, Menu, dialog } = require('electron')
const path = require('path')
const { localStorage } = require(path.join(__dirname, 'render/utils/utils.js'))

let win = null
let timer = null
let jobTimer = null
let appIcon = null


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
  win.setSkipTaskbar(false)

  win.loadFile('index.html')
  // 设置任务计划
  computedHoursStart()
  setInterval(computedHoursStart, 1000 * 60 * 60)
}

// 检测是否需要弹框收集日志
function checkNeddLogSend () {
  let current = new Date().toLocaleDateString()
  let localCacheDate = null
  try {
    localCacheDate = JSON.parse(localStorage.get('date'))
  } catch (error) {}
  if (!localCacheDate || localCacheDate.time !== current) {
    localStorage.set('date', JSON.stringify({
      time: current,
      result: 'no'
    }))
    return true
  } else if (localCacheDate.time === current && localCacheDate.result === 'no') {
    return true
  } else if (localCacheDate.time === current && localCacheDate.result === 'yes') {
    return false
  }
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
  jobTimer = setTimeout(loopSendLog, step)
}

// 循环让用户填写日志
function loopSendLog () {
  timer = setInterval(() => {
    if (checkNeddLogSend && BrowserWindow.getAllWindows().length === 0) {
      createWindow()
      win.focus()
    } else {
      clearInterval(timer)
      clearTimeout(jobTimer)
      jobTimer = null
      timer = null
    }
  }, 30000)
}

// 创建系统托盘
function createTray () {
  const contextMenu = Menu.buildFromTemplate([])
  appIcon = new Tray(path.join(__dirname, 'img/logo/logo-16.png'))
  appIcon.setContextMenu(contextMenu)
  appIcon.on('mouse-up', (event) => {
    if (win) {
      win.show()
    } else if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
}

app.whenReady().then((res) => {
  createWindow()
  createTray()
  app.on('activate', (event) => {
    console.log('activate')
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('close', () => {
  console.log('close')
  win.hide()
  e.returnValue = false
})
