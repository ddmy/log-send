const path = require('path')
const storage = require('electron-localstorage')
storage.setStoragePath(path.join(__dirname,'config/localStroge.json'))

module.exports = storage
