const path = require('path')
const storage = require('electron-localstorage')
const {remote} = require('electron')

console.log(process.env.NODE_ENV)
let cachePath = ''
if (process.env.NODE_ENV === 'production') {
  cachePath = path.join(__dirname, '../localConfig-dev.json')
} else {
  const configDir = remote.app.getPath('userData')
  cachePath = path.join(configDir, './localConfig.json')
}
storage.setStoragePath(cachePath)

module.exports = storage
