const { app, BrowserWindow, Tray, Menu, dialog } = require('electron')
const AutoLaunch = require('auto-launch')
const path = require('path')
const storage = require(path.join(__dirname, 'render/utils/storage.js'))
const checkNeddLogSend = require(path.join(__dirname, 'render/common/common.js'))

let win = null
let timer = null
let jobTimer = null
let appIcon = null
let neddLogSend = true
let needCloseBtn = false

const autoLogSend = new AutoLaunch({
  name: 'logSend'
})

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
    win && win.hide()
  })

  neddLogSend = checkNeddLogSend()
  // 设置任务计划
  computedHoursStart()
  setInterval(computedHoursStart, 1000 * 60 * 60)

  needCloseBtn = storage.getItem('closeBtn') === 'yes'
  createTray()
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
async function createTray () {
  // 获取当前开机自启状态
  const isEnabled = await autoLogSend.isEnabled().catch(err => console.log(err))
  const menuList = [
    {
      label: '发送日报',
      click () {
        win.show()
      }
    },
    {
      label: '开机启动',
      type: 'checkbox',
      checked: isEnabled,
      click () {
        if (isEnabled) {
          autoLogSend.disable()
        } else {
          autoLogSend.enable()
        }
      }
    },
    {
      label: '关于作者',
      click() {
        let aboutWin = new BrowserWindow({
          width: 300,
          height: 300,
          webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
          }
        })
        aboutWin.loadFile('about.html')
        aboutWin.on('closed', () => {
          aboutWin = null
        })
      }
    },
    {
      label: '退出',
      click () {
        win = null
        app.exit()
      }
    }
  ]

  const contextMenu = Menu.buildFromTemplate(menuList)
  appIcon = new Tray(path.join(__dirname, 'img/logo/logo-16.png'))
  appIcon.setContextMenu(contextMenu)
}

if (process.platform === 'darwin') {
  // app.dock.hide()
}

app.whenReady().then(() => {
  createWindow()
})
app.on('activate', () => {
  console.log('activate')
  if (process.platform !== 'darwin') {
    win.show()
  } else if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
app.on('will-quite', () => {
  dialog.showMessageBox({
    title: 'test',
    message: '要退出了啊!'
  })
})
app.on('window-all-closed', event => {})
