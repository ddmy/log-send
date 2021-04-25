const path = require('path')
const { dialog } = require('electron')
const storage = require('electron-localstorage')
const axios = require('axios')
const { isWorkday } = require(path.join(__dirname, '../../utils/api.js'))

// 判断今天是否为工作日
async function checkedIsWorkday () {
  const now = new Date()
  const year = String(now.getFullYear())
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  const date = Number(year + month + day)
  const monthDate = Number(year + month)
  // 查看缓存中是否有保存最新工作日信息
  let workDay = storage.getItem('workday')
  if (workDay && monthDate === workDay.name) {
    return !workDay.data.find(item => item.date === date)
  }
  // 获取最新工作日信息
  const result = await axios.get(isWorkday()).catch(err => {
    dialog.showMessageBox({
      title: '请求异常！',
      message: '获取工作日信息出错，请稍后再试!'
    })
  })
  if (result && result.status === 200 && result.data && result.data.code === '0') {
    storage.setItem('workDay', {
      name: monthDate,
      data: result.data.data.list
    })
    return !result.data.data.list.find(item => item.date === date)
  }
  return false
}

// 检查是否需要弹框收集日志
module.exports =  async function checkNeddLogSend () {
  const isWorkDayResult = await checkedIsWorkday()
  if (!isWorkDayResult) return false
  let current = new Date().toLocaleDateString()
  let localCacheDate = storage.getItem('date') || null
  if (!localCacheDate || localCacheDate.time !== current) {
    storage.setItem('date', {
      time: current,
      result: 'no'
    })
    return true
  } else if (localCacheDate.time === current && localCacheDate.result === 'no') {
    return true
  } else if (localCacheDate.time === current && localCacheDate.result === 'yes') {
    return false
  }
}
