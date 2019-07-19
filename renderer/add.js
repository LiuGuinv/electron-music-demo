const { ipcRenderer } = require('electron')
const { $ } = require('./helper')
const path = require('path')

let musicFilesPath = []

$('select-music').addEventListener('click', () => {
    ipcRenderer.send('open-music-file')
})

$('add-music').addEventListener('click', () => {
    ipcRenderer.send('add-tracks', musicFilesPath)

})

// 生成音乐列表html
// node.js中path.basename() 方法返回 path 的最后一部分
const renderListHTML = (paths) => {
    const musicList = $('musicList')
    const musicItemsHTML = paths.reduce((html, music) => {
        html += `<li class="list-group-item">${path.basename(music)}</li>`
        return html
    }, '')

    musicList.innerHTML = `<ul class="list-group">${musicItemsHTML}</ul>`
}

ipcRenderer.on('selected-file', (event, args) => {
    // console.log(args)
    if (Array.isArray(args)) {
        // 调用
        renderListHTML(args)
        musicFilesPath = args
    }
})
