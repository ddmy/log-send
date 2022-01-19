const path = require('path')
const nodemailer = require('nodemailer')
const storage = require(path.join(__dirname, 'utils/storage.js'))

function regTestEmail(str) {
  return /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,5}$/.test(str)
}

window.addEventListener('DOMContentLoaded', () => {
  const email = document.querySelector('#email')
  const pwd = document.querySelector('#pwd')
  const toEmail = document.querySelector('#toEmail')
  let userInfo = storage.getItem('author') || null
  if (userInfo) {
    email.value = userInfo.email
    pwd.value = userInfo.pwd
    toEmail.value = userInfo.toEmail
  } else {
    email.disabled = false
    pwd.disabled = false
  }

  document.querySelector('.save').addEventListener('click', () => {
    const emailVal = email.value || null
    const pwdVal = pwd.value || null
    const toEmailVal = toEmail.value || null
    
    if (!regTestEmail(emailVal) || !pwdVal || !regTestEmail(toEmailVal)) {
      alert('请填写正确的邮箱或密码!')
      return
    }
    console.log(storage.setItem('author', {
      email: emailVal,
      pwd: pwdVal,
      toEmail: toEmailVal
    }))
    // window.opener = null
    // window.close()
    alert('保存成功！')
  })
  document.querySelector('.test').addEventListener('click', () => {
    let userInfo = storage.getItem('author') || null
    if (!userInfo) return alert('日报配置未生效，请保存！')
    sendEmail(userInfo)
  })
  document.querySelector('.set').addEventListener('click', () => {
    email.disabled = false
    pwd.disabled = false
  })
})

function sendEmail (userInfo) {
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

  let name = '测试姓名'

  let mailOptions = {
    from: userInfo.email, // sender address
    to: userInfo.toEmail, // list of receivers
    subject: name + '-' + new Date().toLocaleDateString() + ' 日报', // Subject line
    html: '测试内容，如果您收到此封邮件，说明邮箱配置正确，可以正常收发邮件!' // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      alert(`${error}`)
      return
    }
    alert('测试邮件已发送，请检查邮箱!')
    // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
  })
}