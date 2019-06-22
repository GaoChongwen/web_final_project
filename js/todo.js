let itemId = 0;
let COMPLETED = 'completed';
let SELECTED = 'selected';
let EDIT = 'edit';
let SELECTED_ALL = 'selected-all';

// 记录已右滑显示的item
let expansionItem = null;
// 记录已长按显示的item
let fullTextItem = null;
// 记录已打开的dayDetail
let expansionDay = null;


// ifttt 最晚时间点
const ADVANCED_DAY = 3;
let warningMsg = '';
let warningIndexList = [];

// 日历
// const calenderColor = [ '#EFCF68',  '#88C966', '#EEA95E', '#7FC0F1','#CC95E2','#EF7164', '#A5A5A7'];
const calenderColor = ['#FFD7D1', '#E8BEC0', '#FEDCEE', '#E7BEE8', '#F2D1FF', '#FFFAC7', '#E8DFB5', '#FFF3D4', '#E8D4B5', '#FFE2C7', '#C9FFED', '#B7E8CA', '#D6FFDA', '#C2E8B7', '#E8FFC9'];
let calenderDate = new Date();
let dateTaskMap = new Map();
let calenderMaxTaskNum = 0;

// toggle标签颜色记录
let toggleColorMap = new Map();

function update() {
    // 更新服务器的数据
    model.flush();

    // 获取全局变量model中的数据
    let data = model.data;

    // 未完成的数目与日历显示的任务数目
    let activeCount = 0;
    let calenderTaskNum = 0;

    // 获取todoList组件
    let todoList = $('#todo-list');

    // 重置全局变量
    resetGlobal();

    data.items.forEach(function (itemData, index) {
        if (!itemData.completed) activeCount++;

        // 如果未完成，且有时间限制，且并未提醒过，IFTTT
        if (!itemData.completed && itemData.timeLimited && !itemData.alerted) {
            // 检查是否延误
            let remainingDay = checkDelay(itemData.dateStr);

            // 需要预警
            if (remainingDay !== -2) {
                let warningDayStr = '';

                // 过期预警
                if (remainingDay === -1) {
                    warningDayStr = '您的' + itemData.msg + '已过期！' + "<br>";
                } else {
                    let endStr = itemData.dateStr.substring(itemData.dateStr.length / 2 + 1, itemData.dateStr.length);
                    warningDayStr = '您的' + itemData.msg + '距离截止日期' + endStr + "仅剩" + remainingDay + "天！" + "<br>";
                }

                warningMsg += warningDayStr;
                warningIndexList.push(index);
            }
        }

        // 日历的任务管理条，管理：有时间限制，且不是一天做完的任务
        if (itemData.timeLimited && !itemData.isTd) {
            // 如果时间限制在当前日历显示的月份有重合
            let result = dateInTheMonth(itemData.dateStr, calenderDate);
            if (result) {
                // 获得重合的起止日期
                let [startDateId, endDateId] = result;
                for (let i = startDateId; i < endDateId + 1; i++) {
                    if (dateTaskMap.has(i)) {
                        let value = dateTaskMap.get(i);
                        value.push({"msg": itemData.msg, "taskIndex": calenderTaskNum});
                        dateTaskMap.set(i, value);
                    } else {
                        dateTaskMap.set(i, [{"msg": itemData.msg, "taskIndex": calenderTaskNum}]);
                    }

                    // 更新最大值
                    let value = dateTaskMap.get(i);
                    if (value.length > calenderMaxTaskNum) calenderMaxTaskNum = value.length;
                }
                // 设置toggle标签颜色
                toggleColorMap.set(index, calenderTaskNum);
                calenderTaskNum++;
            }
        }

        // 过滤
        if (
            data.filter === 'All'
            || (data.filter === 'Active' && !itemData.completed)
            || (data.filter === 'Completed' && itemData.completed)
            || (data.filter === 'Td' && itemData.isTd)
        ) {
            let item = createItem(data, itemData, index);
            todoList.insertBefore(item, todoList.firstChild);
        }
    });

    let newTodo = $('#new-todo');
    newTodo.value = data.msg;

    let count = $('#todo-count');
    count.innerHTML = (activeCount || 'No') + (activeCount > 1 ? ' items' : ' item') + ' left';

    // 展示选的filter
    let filters = makeArray($All('.filters li a'));
    filters.forEach(function (filter) {
        if (data.filter === filter.innerHTML) filter.classList.add(SELECTED);
        else filter.classList.remove(SELECTED);
    });

    // 预警
    sendWarningMsg();

    // 更新日历的背景图，展示
    updateCalenderBg();

    function checkDelay(dateStr) {
        let endStr = dateStr.substring(dateStr.length / 2 + 1, dateStr.length);
        let endY = parseInt(endStr.substr(0, 4));
        let endM = parseInt(endStr.substr(5, 2));
        let endD = parseInt(endStr.substr(8, 2));

        let endDate = new Date(endY, endM - 1, endD);
        let advanced_days_ago = new Date(endDate.getTime() - 24 * 60 * 60 * 1000 * ADVANCED_DAY);
        let curDate = new Date();

        let endDateStr = dateFormat(endDate);
        let advanced_days_ago_Str = dateFormat(advanced_days_ago);
        let curDateStr = dateFormat(curDate);

        // 已过期
        if (curDateStr > endDateStr) {
            return -1;
        }

        // 安全
        if (curDateStr < advanced_days_ago_Str) {
            return -2;
        }

        // 剩不到3天，预警提醒
        let remainingDay;
        switch (curDateStr) {
            case endDateStr:
                remainingDay = 1;
                break;
            case advanced_days_ago_Str:
                remainingDay = 3;
                break;
            default:
                remainingDay = 2;
                break;
        }
        return remainingDay;

    }

}

// 重置全局变量
function resetGlobal() {
    // 全局变量清零；
    calenderMaxTaskNum = 0;
    dateTaskMap.clear();
    toggleColorMap.clear();

    // todoList清空
    let todoList = $('#todo-list');
    todoList.innerHTML = '';

    // 日历重新建立
    initCalender(calenderDate);
}

// 创建item
function createItem(data, itemData, index) {
    let item = document.createElement('div');
    item.className = 'todo-item';
    if (itemData.completed) item.classList.add(COMPLETED);

    let id = 'item' + itemId++;
    item.setAttribute('id', id);

    let itemToggle = createItemToggle();
    let itemContent = createItemContent();
    let itemDate = createItemDate();
    let itemSwipeBtns = createItemSwipeBtns();

    if (toggleColorMap.has(index)) {
        let toggleColor = calenderColor[toggleColorMap.get(index) % calenderColor.length];
        itemToggle.style.cssText += 'background-color:' + toggleColor + ';';
    }

    item.appendChild(itemToggle);
    item.appendChild(itemContent);
    item.appendChild(itemDate);
    item.appendChild(itemSwipeBtns);

    addSwipeLeft();
    createEdit();
    createAllContent();
    createTapBlur();
    return item;

    function createItemToggle() {
        let itemCheckBtn = document.createElement('div');
        itemCheckBtn.classList.add('item-toggle');

        // 实现Complete
        itemCheckBtn.addEventListener('click', function () {
            itemData.completed = !itemData.completed;
            update();
        }, false);
        return itemCheckBtn;
    }

    function createItemContent() {
        let itemContent = document.createElement('div');
        itemContent.innerHTML = itemData.msg;
        itemContent.className = 'item-content';
        return itemContent;
    }

    function createItemDate() {
        let itemDate = document.createElement('div');
        itemDate.className = 'item-date';

        if (!itemData.timeLimited) {
            itemDate.innerHTML = '';
        } else {
            if (itemData.isTd) {
                itemDate.innerHTML = 'Td';
                itemDate.classList.add('td');
            } else {
                itemDate.innerHTML = itemData.dateStr;
            }
        }
        return itemDate;
    }

    function createItemSwipeBtns() {
        let itemSwipeBtns = document.createElement('div');
        itemSwipeBtns.className = 'item-btns';

        let itemDelBtn = document.createElement('div');
        itemDelBtn.innerHTML = 'DEL';
        itemDelBtn.className = 'item-delete';

        let itemTopBtn = document.createElement('div');
        itemTopBtn.innerHTML = 'TOP';
        itemTopBtn.className = 'item-top';

        itemDelBtn.addEventListener('click', function () {
            data.items.splice(index, 1);
            update();
        }, false);

        itemTopBtn.addEventListener('click', function () {
            let top = data.items.splice(index, 1);
            data.items.push(top[0]);
            update();
        }, false);
        itemSwipeBtns.appendChild(itemDelBtn);
        itemSwipeBtns.appendChild(itemTopBtn);
        return itemSwipeBtns;
    }

    function addSwipeLeft() {
        let x_start, y_start, x_end, y_end, swipeX;
        item.addEventListener('touchstart', function (event) {
            x_start = event.changedTouches[0].pageX;
            y_start = event.changedTouches[0].pageY;
            swipeX = true;

        });

        item.addEventListener('touchmove', function (event) {
            x_end = event.changedTouches[0].pageX;
            y_end = event.changedTouches[0].pageY;
            // 左右滑动
            if (swipeX && Math.abs(x_end - x_start) - Math.abs(y_end - y_start) > 0) {
                // 阻止事件冒泡到父元素
                event.stopPropagation();
                if (x_end - x_start > 10) {   //右滑
                    let swipeBtns = this.lastChild;
                    event.preventDefault();
                    if (swipeBtns.classList.contains("swipe-left")) {
                        swipeBtns.classList.remove("swipe-left");
                    }
                }
                if (x_start - x_end > 10) {   //左滑
                    let swipeBtns = this.lastChild;
                    event.preventDefault();
                    swipeBtns.classList.add("swipe-left");
                    expansionItem = swipeBtns;
                }
            }
        });
    }

    function createEdit() {
        // Hammer实现双击的编辑
        let manager = new Hammer.Manager(itemContent);
        let DoubleTap = new Hammer.Tap({
            event: 'doubletap',
            taps: 2
        });
        manager.add(DoubleTap);
        // 双击的事件
        manager.on('doubletap', function (e) {
            item.classList.add(EDIT);
            //新建一个输入框
            let edit = document.createElement('input');
            let finished = false;
            edit.setAttribute('type', 'text');
            edit.setAttribute('class', 'edit');
            edit.setAttribute('value', itemContent.innerHTML);

            // 停止编辑
            function finish() {
                if (finished) return;
                finished = true;
                item.removeChild(edit);
                item.classList.remove(EDIT);
            }

            // 鼠标移开，失焦
            edit.addEventListener('blur', function () {
                finish();
            }, false);

            // 编辑完成
            edit.addEventListener('keyup', function (ev) {
                if (ev.keyCode === 27) { // Esc
                    finish();
                } else if (ev.keyCode === 13) {
                    let edit = ev.target;
                    itemContent.innerHTML = edit.value;
                    itemData.msg = edit.value;
                    update();
                }
            }, false);

            item.appendChild(edit);
            edit.focus();
        });
    }

    // Hammer实现长按展示全部文字
    function createAllContent() {
        let hammerTest = new Hammer(itemContent);

        // 长按后，展示全文文字
        hammerTest.on('press', function (ev) {
            console.log(ev.type);
            let itemAllContent = document.createElement('div');
            itemAllContent.className = 'item-all-content';
            let allText = document.createElement('div');
            allText.innerHTML = itemData.msg;
            itemAllContent.appendChild(allText);
            item.appendChild(itemAllContent);
        });

        // 抬起来时，记录展示全部文字的item
        hammerTest.on('pressup', function (ev) {
            fullTextItem = item;
        });
    }

    function createTapBlur() {
        $("body").addEventListener('touchstart', function (event) {
            let x = event.changedTouches[0].pageX;
            let y = event.changedTouches[0].pageY;

            // 如果已经有item是展开的，并且点击的不是DEL和TOP按钮，则收起来
            if (expansionItem) {
                // 判断是否tap在DEL和TOP按钮范围内
                let tapItemBtns = x < expansionItem.getBoundingClientRect().right && x > expansionItem.getBoundingClientRect().left && y < expansionItem.getBoundingClientRect().bottom && y > expansionItem.getBoundingClientRect().top;

                if (!tapItemBtns) expansionItem.classList.remove("swipe-left");
            }

            // 如果有item是在长按模式下，预览所有文字的，但触摸的是其它地方，收起来
            if (fullTextItem) {
                let fullText = fullTextItem.lastChild;
                let tapFullText = x < fullText.getBoundingClientRect().right && x > fullText.getBoundingClientRect().left && y < fullText.getBoundingClientRect().bottom && y > fullText.getBoundingClientRect().top;

                if (!tapFullText) {
                    fullTextItem.removeChild(fullTextItem.lastChild);
                    fullTextItem = null;
                }
            }

            // 如果有dayDetail展示出来，预览当日任务的，但触摸的是其它地方，收起来
            if (expansionDay) {
                let dayDetail = expansionDay.lastChild;
                let tapFullText = x < dayDetail.getBoundingClientRect().right && x > dayDetail.getBoundingClientRect().left && y < dayDetail.getBoundingClientRect().bottom && y > dayDetail.getBoundingClientRect().top;

                if (!tapFullText) {
                    expansionDay.removeChild(expansionDay.lastChild);
                    expansionDay = null;
                }
            }

        });
    }
}

// 预警
function sendWarningMsg() {
    if (warningMsg === '') return;

    ifttt(warningMsg, function () {
        if (iftttSuccess) {
            let data = model.data;
            warningIndexList.forEach(function (index) {
                data.items[index].alerted = true;
            });
            warningMsg = '';
            warningIndexList = [];
        }
        update();
    });
}

// 更新日历的背景图，展示
function updateCalenderBg() {
    let colorStep = 100 / calenderMaxTaskNum;
    for (let [key, value] of dateTaskMap) {
        let dayId = key > 9 ? 'd' + key : 'd0' + key;
        let dayDiv = $('#' + dayId);

        let bgImgText = '';

        // 画每一个任务的时间线
        for (let i = 0, j = 0; i < calenderMaxTaskNum; i++) {
            let color = "white";

            // 按照任务的index，确定任务颜色、确定任务颜色画的位置
            let temp = value[j];
            if (temp) {
                let taskIndex = temp.taskIndex;
                if (taskIndex === i) {
                    color = calenderColor[i % calenderColor.length];
                    j++;
                }
            }
            bgImgText += ", " + color + " " + colorStep * i + "%" + ", " + color + " " + colorStep * (i + 1) + "%";
        }

        bgImgText = "background-image: linear-gradient(to bottom" + bgImgText + ");";
        dayDiv.style.cssText += bgImgText;

        dayDiv.addEventListener('click', function (event) {
            let dayDetail = document.createElement('div');
            dayDetail.className = 'day-detail';

            // 如果有dayDetail展示出来，预览当日任务的，收起来
            if (expansionDay) {
                expansionDay.removeChild(expansionDay.lastChild);
                expansionDay = null;
            }

            let detailItem = document.createElement('div');
            detailItem.className = "detail-item";
            detailItem.innerHTML = yearDom.innerHTML + " " + monthDom.innerHTML + " " + dayDiv.innerHTML;
            dayDetail.appendChild(detailItem);

            value.forEach(function (val) {
                let detailItem = document.createElement('div');
                detailItem.className = "detail-item";

                let tag = document.createElement('div');
                tag.className = "tag";
                tag.style.cssText += 'background-color:' + calenderColor[val.taskIndex % calenderColor.length] + ';';

                let msg = document.createElement('div');
                msg.innerHTML = val.msg;
                msg.className = "msg";

                detailItem.appendChild(tag);
                detailItem.appendChild(msg);
                dayDetail.appendChild(detailItem);
            });

            dayDiv.appendChild(dayDetail);
            expansionDay = dayDiv;

            dayDetail.addEventListener('click', function (event) {
                event.stopPropagation();
                expansionDay.removeChild(expansionDay.lastChild);
                expansionDay = null;
            })
        }, false);
    }
}

// 初始化UI
function initUI(data) {
    let newTodo = $('#new-todo');
    let addBtn = $('#add-btn');
    let clearCompleted = $('#clear-btn');
    let toggleAll = $('.toggle-all');
    let filters = makeArray($All('.filters li a'));

    let lastMonBtn = $('.lastMBtn');
    let nextMonBtn = $('.nextMBtn');

    // newTodo
    newTodo.addEventListener('keyup', function () {
        data.msg = newTodo.value;
    });

    newTodo.addEventListener('change', function () {
        model.flush();
    });

    newTodo.addEventListener('keyup', function (ev) {
        if (ev.keyCode !== 13) return; // Enter
        addItem();
    }, false);

    // addBtn
    addBtn.addEventListener('click', addItem, false);

    // clearCompleted 改成从后向前删除，避免删除影响顺序
    clearCompleted.addEventListener('click', function () {
        for (let i = data.items.length - 1; i >= 0; i--) {
            if (data.items[i].completed) data.items.splice(i, 1);
        }
        update();
    }, false);

    // toggleAll
    toggleAll.addEventListener('click', function () {
        if (toggleAll.classList.contains(SELECTED_ALL)) {
            toggleAll.classList.remove(SELECTED_ALL);
            data.items.forEach(function (itemData) {
                itemData.completed = false;
            });
        } else {
            toggleAll.classList.add(SELECTED_ALL);
            data.items.forEach(function (itemData) {
                itemData.completed = true;
            });
        }
        update();
    }, false);

    // filters
    filters.forEach(function (filter) {
        filter.addEventListener('click', function () {
            data.filter = filter.innerHTML;
            filters.forEach(function (filter) {
                filter.classList.remove(SELECTED);
            });
            filter.classList.add(SELECTED);
            update();
        }, false);
    });

    // lastMonBtn
    lastMonBtn.addEventListener('click', function () {
        calenderDate.setMonth(calenderDate.getMonth() - 1);
        initCalender(calenderDate);

        update();
    }, false);

    // nextMBtn
    nextMonBtn.addEventListener('click', function () {
        calenderDate.setMonth(calenderDate.getMonth() + 1);
        initCalender(calenderDate);

        update();
    }, false);

    function addItem() {
        if (data.msg === '') {
            console.warn('input msg is empty');
            return;
        }

        let [_msg, _success, _isTd, _dateStr] = getDate(data.msg);
        // data.items.push({msg: msg, completed: false});
        data.items.push({
            msg: _msg,
            completed: false,
            timeLimited: _success,
            alerted: false,
            isTd: _isTd,
            dateStr: _dateStr
        });

        data.msg = '';
        update();

        function getDate(data) {
            let msg = data;
            let success = false, isTd = false;
            let dateStr = '', startStr = '', endStr = '';

            // 日期正则匹配
            let dateRegex = /\(\d{4}\.[0-1]\d\.[0-3]\d-\d{4}\.[0-1]\d\.[0-3]\d\)/g;
            let tdRegex = /\(td\)/g;

            // 进行正则匹配
            let dateSrc = dateRegex.exec(data);
            let tdSrc = tdRegex.exec(data);

            // 均匹配失败，默认为无时间，不处理msg
            if (!dateSrc && !tdSrc) {
                return [msg, success, isTd, dateStr];
            } else {
                success = true;
            }

            // (td)匹配成功，处理为今天
            if (tdSrc) {
                // 获取当前日期
                let date = new Date();

                msg = data.substring(0, tdSrc.index) + data.substring(tdRegex.lastIndex, data.length + 1);
                isTd = true;
                dateStr = dateFormat(date) + '-' + dateFormat(date);
                return [msg, success, isTd, dateStr];
            }

            // (yyyy.mm.dd-yyyy.mm.dd)匹配成功，处理时间
            if (dateSrc) {
                dateStr = dateSrc[0];
                startStr = dateStr.substring(1, 11);
                endStr = dateStr.substring(12, 22);

                // 如果时间是合理的
                if (startStr < endStr || startStr === endStr) {
                    msg = data.substring(0, dateSrc.index) + data.substring(dateRegex.lastIndex, data.length + 1);
                    return [msg, success, isTd, dateStr.substring(1, dateStr.length - 1)];
                }
            }
        }
    }
}

// 更新"Td"标签
function updateTd(data) {
    data.items.forEach(function (itemData) {
        if (itemData.isTd) {
            let itemTd = itemData.dateStr.substring(itemData.dateStr.length / 2 + 1, itemData.dateStr.length);
            let td = dateFormat(new Date());
            if (itemTd !== td) itemData.isTd = false;
        }
    });
}

window.onload = function () {
    model.init(function () {
        let data = model.data;

        initUI(data);

        updateTd(data);

        update();
    });
};