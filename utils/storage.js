const path = require('path')
const storage = require('electron-localstorage')

let cachePath = ''
if (process.env.NODE_ENV === 'production') {
  cachePath = path.join(__dirname, '../localConfig-dev.json')
} else {
  cachePath = path.join(__dirname, '../localConfig.json')
}
storage.setStoragePath(cachePath)

module.exports = storage
