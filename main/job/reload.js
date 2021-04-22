const path = require('path')
const { computedHoursStart } = require(path.join(__dirname, '../../utils/utils.js'))

module.exports = function (app) {
  computedHoursStart({  hours: 0, minutes: 0 }, () => {
    app.relaunch({ args: process.argv.slice(1).concat(['--relaunch'])})
    app.exit(0)
    // app.hide()
  })
}