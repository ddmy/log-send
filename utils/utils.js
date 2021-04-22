module.exports = {
  // 定时几点几分几秒执行 callback 方法
  computedHoursStart (time = {}, callback, arg = []) {
    const { hours = 0, minutes = 0, seconds = 0 } = time
    let date = new Date()
    let dateIntegralPoint = new Date()
    dateIntegralPoint.setHours(hours)
    dateIntegralPoint.setMinutes(minutes)
    dateIntegralPoint.setSeconds(seconds)
    let step = dateIntegralPoint - date
    if (step < 0) {
      step = 1000 * 60 * 60 * 24 + step
    }
    console.log('step', step)
    return setTimeout((arg) => {
      callback(...arg)
    }, step, arg)
  }
}