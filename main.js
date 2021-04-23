const { app, BrowserWindow, Tray, Menu, dialog, Notification } = require('electron')
const AutoLaunch = require('auto-launch')
const path = require('path')
const storage = require('electron-localstorage')
const checkNeddLogSend = require(path.join(__dirname, 'render/common/common.js'))
const { computedHoursStart } = require(path.join(__dirname, 'utils/utils.js'))
const reloadApp = require(path.join(__dirname, 'main/job/reload.js'))

let win = null
let timer = null
let jobTimer = null
let appIcon = null
let neddLogSend = true
let aboutWin = null
let notifi = null

const autoLogSend = new AutoLaunch({
  name: 'logSend'
})

reloadApp(app)

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
}

function createSendLogNotification () {
  notifi = new Notification({
    title: '填写日报时间到了',
    subtitle: '每日任务',
    body: '请准时提交日报, 配合好管理的工作，谢谢同学!',
    silent: true,
    timeoutType: 'never'
  })
  notifi.on('click', () => {
    win && win.show()
  })
}

// 循环让用户填写日志
function loopSendLog () {
  timer = setInterval(() => {
    if (neddLogSend && !win.isVisible()) {
      notifi.show()
    } else if (!neddLogSend) {
      clearInterval(timer)
      clearTimeout(jobTimer)
      jobTimer = null
      timer = null
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
        if (aboutWin) {
          aboutWin.show()
          return
        }
        aboutWin = new BrowserWindow({
          width: 300,
          height: 300,
          webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
          }
        })
        console.log('')
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
  
  appIcon.on('click', () => {
    if (win.isFocused()) {
      win.hide()
    } else {
      win.show()
    }
  })
  appIcon.on('right-click', () => {
    appIcon.popUpContextMenu(contextMenu)
  })
}

if (process.platform === 'darwin') {
  app.dock.hide()
}

app.whenReady().then(() => {
  createWindow()
  createSendLogNotification()
  // 检查今日是否已经发送日报
  neddLogSend = checkNeddLogSend()
  // 设置任务计划 下午六点开始执行循环提醒用户发日志
  jobTimer = computedHoursStart({ hours: 18 }, loopSendLog)
  // setInterval(computedHoursStart, 1000 * 60 * 60)
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
app.on('will-quite', () => {
  dialog.showMessageBox({
    title: 'test',
    message: '要退出了啊!'
  })
})
app.on('window-all-closed', event => {})
