// 渲染进程----------
// node.js的API
// alert(process.versions.node)
const { ipcRenderer } = require('electron')

// DOM的API
window.addEventListener('DOMContentLoaded', () => {
    // 渲染进程向主进程发送消息，参数一：事件名称，参数二：信息内容，可以为任何数据类型
    ipcRenderer.send('message', 'renderer')
    // 监听主进程回复的消息
    ipcRenderer.on('reply', (event, args) => {
        // 将消息渲染到index.html页面
        document.getElementById('message').innerHTML = args
    })
})
