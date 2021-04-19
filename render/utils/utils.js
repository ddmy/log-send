module.exports = {
  localStorage: {
    /**
     * 获取 localStorage 值
     * @param {string} key 名称
     * @return {any} 如果没有获取到，则返回 null
     */
    get(key) {
      let val = null
      try {
        val = window.localStorage.getItem(key)
      } catch (err) {
        console.error(err)
      }
      return val
    },
    /**
     * 设置 localStorage 值
     * @param {string} key 名称
     * @param {any} value 任一可被 JSON.stringify 处理的值
     * @return {boolean} true 表示设置成功，false 表示报错，通常是超出浏览器容量限制
     */
    set(key, value) {
      try {
        window.localStorage.setItem(key, value)
        return true
      } catch (err) {
        console.error(err)
        return false
      }
    },
    /**
     * 删除 key 对应的值
     * @param {string} key
     */
    remove(key) {
      window.localStorage.removeItem(key)
    }
  }
}