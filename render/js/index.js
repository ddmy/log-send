const path = require('path')
const nodemailer = require('nodemailer')
const { ipcRenderer } = require('electron')
const { BrowserWindow } = require('electron').remote
const storage = require('electron-localstorage')
const checkNeddLogSend = require(path.join(__dirname, 'render/common/common.js'))

let win = null

function createEmailWindow () {
  if (win) {
    win.show()
    return
  }
  // 启动新的渲染进程，让用户填写邮箱账号，密码
  win = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
  })
  win.loadFile('author.html')
  ipcRenderer.on('close', (event, arg) => {
    win.close()
  })
  win.on('closed', () => {
    win = null
  })
}

function isSend () {
  document.querySelector('body').innerHTML = `
    <h1>今日日报已提交，感谢配合！</h1>
    <button style="display:block; margin: 20px auto">再次提交</button>
  `
  setTimeout(() => {
    document.querySelector('button').addEventListener('click', () => {
      location.reload()
    })
  }, 0)
}

const submit = document.querySelector('#submit')
submit && submit.addEventListener('click', () => {
  let userInfo = storage.getItem('author') || null
  if (!userInfo) {
    createEmailWindow()
    return
  }
  let today = document.querySelector('#today').value.replace(/\n/g,"<br>")
  let tomorrow = document.querySelector('#tomorrow').value.replace(/\n/g,"<br>")
  let result = document.querySelector('#result').value.replace(/\n/g,"<br>")
  if (!today || !tomorrow || !result) {
    return alert('不能为空!')
  }
  const innerHtml = `
    <p>
      <b>今日工作:</b><br>${today}
    </p>
    <p>
      <b>明日工作:</b><br>${tomorrow}
    </p>
    <p>
      <b>总结(风险):</b><br>${result}
    </p>
  `
  sendEmail(userInfo, innerHtml)
})

const setEmail = document.querySelector('#setEmail')
setEmail && setEmail.addEventListener('click', createEmailWindow)

window.addEventListener('load', () => {
  document.querySelector('body').style.opacity = '1'
  !checkNeddLogSend() && isSend()
})

function sendEmail (userInfo, innerHtml = '') {
  document.querySelector('.loading').style.display = 'flex'
  let transporter = nodemailer.createTransport({
    // host: 'smtp.ethereal.email',
    service: 'QQ', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
    port: 465, // SMTP 端口
    secureConnection: true, // 使用了 SSL
    auth: {
      user: userInfo.email,
      // 这里密码不是qq密码，是你设置的smtp授权码
      pass: userInfo.pwd,
    }
  });
  
  let mailOptions = {
    from: userInfo.email, // sender address
    to: userInfo.toEmail, // list of receivers
    subject: new Date().toLocaleDateString() + ' 日报', // Subject line
    html: innerHtml // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    document.querySelector('.loading').style.display = 'none'
    if (error) {
      alert(`${error}`)
      return
    }
    const setResult = storage.setItem('date', JSON.stringify({
      time: new Date().toLocaleDateString(),
      result: 'yes'
    }))
    console.log('setResult', setResult)
    isSend()
    alert('日报提交成功!')
    // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
  })
}
