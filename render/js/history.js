const path = require('path')
const storage = require(path.join(__dirname, 'utils/storage.js'))

window.addEventListener('load', () => {
  const historyData = storage.getItem('logHistory') || []
  if (!historyData.length) {
    document.querySelector('body').innerHTML = '当前本地缓存日报记录为空'
    return
  }
  document.querySelector('.main').innerHTML = historyData.map(item => {
    return `
      <div class="every">
        <p class="time">${item.name}-${item.date}</p>
        <div class="every-item">
          <p class="title">
            今日工作:
          </p>
          ${item.today.split('<br>').map(inner => {
            return `<p class="inner">${inner}</p>`
          }).join('')}
          <p class="title">明日工作:</p>
          ${item.tomorrow.split('<br>').map(inner => {
            return `<p class="inner">${inner}</p>`
          }).join('')}
          <p class="title">
            总结(风险):
          </p>
          ${item.result.split('<br>').map(inner => {
            return `<p class="inner">${inner}</p>`
          }).join('')}
        </div>
    </div>
    `
  }).join('')
})