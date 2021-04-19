const path = require('path')
const nodemailer = require('nodemailer')
const { localStorage } = require(path.join(__dirname, 'render/utils/utils.js'))
const { ipcRenderer } = require('electron')
const { BrowserWindow } = require('electron').remote

function createEmailWindow () {
    // 启动新的渲染进程，让用户填写邮箱账号，密码
    let win = new BrowserWindow({
      width: 300,
      height: 300,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
      },
    })
    win.loadFile('author.html')
    win.on('closed', () => {
      win = null
    })
    ipcRenderer.on('close', (event, arg) => {
      win.close()
      win = null
    })
}
document.querySelector('#submit').addEventListener('click', () => {
  let userInfo = null
  try {
    userInfo = JSON.parse(localStorage.get('author'))
  } catch (error) {}
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

document.querySelector('#setEmail').addEventListener('click', createEmailWindow)

function sendEmail (userInfo, innerHtml = '') {
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
    // 发送text或者html格式
    // text: 'Hello world?', // plain text body
    html: innerHtml // html body
  };
  
  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    alert('日报提交成功!')
    // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
  })
}
