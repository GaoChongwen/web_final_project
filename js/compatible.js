//计算根节点HTML的字体大小
function resizeRoot() {
    let deviceWidth = document.documentElement.clientWidth;  // 获得设备宽度
    let maxWidth = 750;
    let stdRatio = 36; // std: 底稿基于width=360px; doc.style.fontsize = 10px; ratio = 36;开发

    // 如果超过maxWidth，则按照maxWidth的式样处理
    if (deviceWidth > maxWidth) {
        deviceWidth = maxWidth;
    }

    // 设置标准字体大小
    document.documentElement.style.fontSize = deviceWidth / stdRatio + "px";
}

//根节点HTML的字体大小初始化
resizeRoot();
window.onresize = function () {
    resizeRoot();
};
