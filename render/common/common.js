const storage = require('electron-localstorage')

// 检查是否需要弹框收集日志
module.exports =  function checkNeddLogSend () {
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
