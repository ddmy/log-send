const path = require('path')
const { version } = require(path.join(__dirname, 'package.json'))

window.addEventListener('load', () => {
  document.querySelector('.version').innerText = '软件版本:' + version
})