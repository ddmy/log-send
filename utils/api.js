module.exports = {
  isWorkday: (params = {}) => {
    const now = new Date()
    const { year = now.getFullYear(), month = now.getMonth() + 1 } = params
    return `https://api.apihubs.cn/holiday/get?field=date&year=${year}&month=${year}${String(month).padStart(2, '0')}&workday=2&cn=1&size=31`
  }
}