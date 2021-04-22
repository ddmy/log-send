const path = require('path')
const { ipcRenderer } = require('electron')
const { webContents, BrowserWindow } = require('electron').remote
const storage = require('electron-localstorage')

function regTestEmail(str) {
  return /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,5}$/.test(str)
}

window.addEventListener('DOMContentLoaded', () => {
  const email = document.querySelector('#email')
  const pwd = document.querySelector('#pwd')
  const toEmail = document.querySelector('#toEmail')
  let userInfo = storage.getItem('author') || null
  console.log('userInfo', userInfo)
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
    console.log(storage.setItem('author', {
      email: emailVal,
      pwd: pwdVal,
      toEmail: toEmailVal
    }))
    console.log('读取', storage.getItem('author'))

    ipcRenderer.send('close')
    webContents.getAllWebContents().forEach(item => {
      if(BrowserWindow.fromId(item.id) && BrowserWindow.fromId(item.id).webContents){
          BrowserWindow.fromId(item.id).webContents.send('close')
      }
    })
  })
})