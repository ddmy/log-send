# 日报发送器
默认每个工作日18点会自动发出通知，要求用户发送日报<br>
目前仅支持QQ邮箱发送<br>

## 技术栈
`electron@12.0.4 + electron-packager + nodemailer + auto-launch + electron-localstorage`
> 其中`electron`和`electron-packager`为全局安装

## 开发打包
mac平台 使用打包构建 请先安装 `wine`, 建议通过 `HomeBrew cask` 方式安装 `wine-stable`

### 开发计划
- 支持更多类型邮箱发送日报
- 日报内容支持图片，附件
- 自动更新
