const path = require('path')
const nodemailer = require('nodemailer')
const storage = require(path.join(__dirname, 'utils/storage.js'))
const { checkNeddLogSend, checkedIsWorkday } = require(path.join(__dirname, 'render/common/common.js'))

function isSend () {
  const html = `
    <div style="width: 100vw; height: 100vh; position:fixed; top: 0; left: 0; background-color: #fff;">
      <h1>今日日报已提交，感谢配合！</h1>
      <button id="hiddeBtn" style="display:block; margin: 20px auto">再次提交</button>
    </div>
  `
  const div = document.createElement('div')
  div.id = 'noWork'
  div.innerHTML = html
  document.querySelector('body').append(div)
  setTimeout(() => {
    document.querySelector('#hiddeBtn').addEventListener('click', () => {
      document.querySelector('#noWork').style.display = 'none'
    })
  }, 0)
}

function noWorkDay () {
  const html = `
    <div style="width: 100vw; height: 100vh; position:fixed; top: 0; left: 0; background-color: #fff;">
      <h1>今天休息，您辛苦了！</h1>
      <button id="hiddeBtn" style="display:block; margin: 20px auto">加班提交日报</button>  
    </div>
  `
  const div = document.createElement('div')
  div.id = 'noWork'
  div.innerHTML = html
  document.querySelector('body').append(div)
  setTimeout(() => {
    document.querySelector('#hiddeBtn').addEventListener('click', () => {
      document.querySelector('#noWork').style.display = 'none'
    })
  }, 0)
}

const submit = document.querySelector('#submit')
submit && submit.addEventListener('click', () => {
  let userInfo = storage.getItem('author') || null
  if (!userInfo) {
    alert('日报发送信息配置不完整，请配置后再发送!')
    return
  }
  let name = document.querySelector('#name').value
  let today = document.querySelector('#today').value.replace(/\n/g,"<br>")
  let tomorrow = document.querySelector('#tomorrow').value.replace(/\n/g,"<br>")
  let result = document.querySelector('#result').value.replace(/\n/g,"<br>")
  if (!today || !tomorrow || !result || !name) {
    return alert('不能为空!')
  }
  const innerHtml = `
    <p>
      <b><font style="color: red;">${name}</font></b><br>
      <b>今日工作:</b><br>${today}
    </p>
    <p>
      <b>明日工作:</b><br>${tomorrow}
    </p>
    <p>
      <b>总结(风险):</b><br>${result}
    </p>
  `
  const originData = {
    name,
    date: new Date().toLocaleDateString(),
    today,
    tomorrow,
    result
  }
  sendEmail(userInfo, innerHtml, originData)
})

window.addEventListener('load', async () => {
  document.querySelector('body').style.opacity = '1'
  const name = storage.getItem('logSendName') || null
  if (name) {
    document.querySelector('#name').value = name
  }
  if (!await checkedIsWorkday()) {
    noWorkDay()
  } else {
    !await checkNeddLogSend() && isSend()
  }
})

function sendEmail (userInfo, innerHtml = '', originData) {
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

  let name = document.querySelector('#name').value

  let mailOptions = {
    from: userInfo.email, // sender address
    to: userInfo.toEmail, // list of receivers
    subject: name + '-' + new Date().toLocaleDateString() + ' 日报', // Subject line
    html: innerHtml // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    document.querySelector('.loading').style.display = 'none'
    if (error) {
      alert(`${error}`)
      return
    }
    storage.setItem('date', {
      time: new Date().toLocaleDateString(),
      result: 'yes'
    })
    saveLogHistory(originData)
    isSend()
    alert('日报提交成功!')
    // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
  })
}

function saveLogHistory (data) {
  const historyData = storage.getItem('logHistory') || []
  historyData.unshift(data)
  storage.setItem('logHistory', historyData)
  storage.setItem('logSendName', data.name)
}
