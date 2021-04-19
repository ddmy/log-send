window.addEventListener('DOMContentLoaded', () => {
  const currentDate = new Date().toLocaleDateString()
  document.querySelector('h1').innerText = `请填写${currentDate}日报内容`
})