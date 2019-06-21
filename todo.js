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

let itemId = 0;
let COMPLETED = 'completed';
let SELECTED = 'selected';
let EDIT = 'edit';
let SELECTED_ALL = 'selected-all';
let expansion = null;

function update() {
    // 更新服务器的数据
    model.flush();
    // 获取全局变量model中的数据
    let data = model.data;
    let activeCount = 0;
    let todoList = $('#todo-list');
    todoList.innerHTML = '';

    data.items.forEach(function (itemData, index) {
        if (!itemData.completed) activeCount++;
        // 过滤
        if (
            data.filter === 'All'
            || (data.filter === 'Active' && !itemData.completed)
            || (data.filter === 'Completed' && itemData.completed)
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
}

function initUI(data) {
    let newTodo = $('#new-todo');
    let addBtn = $('#add-btn');
    let clearCompleted = $('#clear-btn');
    let toggleAll = $('.toggle-all');
    let filters = makeArray($All('.filters li a'));

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

    function addItem() {
        if (data.msg === '') {
            console.warn('input msg is empty');
            return;
        }
        data.items.push({msg: data.msg, completed: false});
        data.msg = '';
        update();
    }
}

function createItem(data, itemData, index) {
    let item = document.createElement('div');
    item.className = 'todo-item';
    if (itemData.completed) item.classList.add(COMPLETED);

    let id = 'item' + itemId++;
    item.setAttribute('id', id);

    let itemCheckBtn = createItemCheckBtn(itemData);

    let itemContent = document.createElement('div');
    itemContent.innerHTML = itemData.msg;
    itemContent.className = 'item-content';

    let itemSwipeBtns = createItemSwipeBtns(data, itemData, index);

    item.appendChild(itemCheckBtn);
    item.appendChild(itemContent);
    item.appendChild(itemSwipeBtns);

    addSwipeLeft(item);
    createEdit();
    return item;

    function createItemCheckBtn() {
        let itemCheckBtn = document.createElement('div');
        itemCheckBtn.classList.add('item-toggle');

        // 实现Complete
        itemCheckBtn.addEventListener('click', function () {
            itemData.completed = !itemData.completed;
            update();
        }, false);
        return itemCheckBtn;
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

        itemDelBtn.addEventListener('click', function (event) {
            data.items.splice(index, 1);
            update();
        }, false);

        itemTopBtn.addEventListener('click', function (event) {
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

            // 如果已经有item是展开的，并且点击的不是DEL和TOP按钮，则收起来
            if (expansion) {
                // 判断是否tap在DEL和TOP按钮范围内
                let tapItemBtns = x_start < expansion.getBoundingClientRect().right && x_start > expansion.getBoundingClientRect().left && y_start < expansion.getBoundingClientRect().bottom && y_start > expansion.getBoundingClientRect().top;

                if (!tapItemBtns) expansion.classList.remove("swipe-left");
            }
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
                    expansion = swipeBtns;
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
}

window.onload = function () {
    model.init(function () {
        let data = model.data;

        initUI(data);

        update();
    });
};