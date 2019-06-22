let iftttUrl = 'https://maker.ifttt.com/trigger/todo_mvc/with/key/XO-fdhNWOJp4be7Dr_hQ3';
let iftttSuccess = false;

// 发送POST IFTTT请求
function ifttt(warningMsg, callback) {
    iftttSuccess = false;

    //ajax post请求获取接口数据
    let postData = {"value1": warningMsg};

    postData = (function (obj) { // 转成post需要的字符串.
        let str = "";

        for (let prop in obj) {
            str += prop + "=" + obj[prop] + "&"
        }
        return str.substring(0, str.length - 1);
    })(postData);

    console.log(postData);
    let xhr = new XMLHttpRequest();

    xhr.open("POST", iftttUrl, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

    xhr.onreadystatechange = function () {
        let XMLHttpReq = xhr;
        if (XMLHttpReq.readyState === 4) {
            if (XMLHttpReq.status === 200) {
                let text = XMLHttpReq.responseText;
                console.log(text);
            }
        }
        iftttSuccess = true;
        if (callback) callback();
    };
    xhr.send(postData);
}