const path = require('path')
const { ipcRenderer } = require('electron')
const { webContents, BrowserWindow } = require('electron').remote
const { localStorage } = require(path.join(__dirname, 'render/utils/utils.js'))

function regTestEmail(str) {
  return /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,5}$/.test(str)
}

window.addEventListener('DOMContentLoaded', () => {
  const email = document.querySelector('#email')
  const pwd = document.querySelector('#pwd')
  const toEmail = document.querySelector('#toEmail')
  let userInfo = null
  try {
    userInfo = JSON.parse(localStorage.get('author'))
  } catch (error) {}

  if (userInfo) {
    email.value = userInfo.email
    pwd.value = userInfo.pwd
    toEmail.value = userInfo.toEmail
  }

  document.querySelector('button').addEventListener('click', () => {
    const emailVal = email.value || null
    const pwdVal = pwd.value || null
    const toEmailVal = toEmail.value || null
    
    if (!regTestEmail(emailVal) || !pwdVal || !regTestEmail(toEmailVal)) {
      alert('请填写正确的邮箱或密码!')
      return
    }
    localStorage.set('author', JSON.stringify({
      email: emailVal,
      pwd: pwdVal,
      toEmail: toEmailVal
    }))
    ipcRenderer.send('close')
    webContents.getAllWebContents().forEach(item => {
      console.log('item', item)
      if(BrowserWindow.fromId(item.id) && BrowserWindow.fromId(item.id).webContents){
          BrowserWindow.fromId(item.id).webContents.send('close')
      }
    })
  })
})