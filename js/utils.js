let $ = function (sel) {
    return document.querySelector(sel);
};
let $All = function (sel) {
    return document.querySelectorAll(sel);
};
let makeArray = function (likeArray) {
    let array = [];
    for (let i = 0; i < likeArray.length; ++i) {
        array.push(likeArray[i]);
    }
    return array;
};

