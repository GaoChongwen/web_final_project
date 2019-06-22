let yearDom = $(".year");
let monthDom = $(".month");
let daysDom = $(".days");

function initCalender(calenderDate) {
    let year = calenderDate.getFullYear();
    let month = calenderDate.toDateString().split(" ")[1];
    let day = isToday(calenderDate) ? calenderDate.toDateString().split(" ")[2] : null;

    setYear(year);
    setMonth(month);
    setDays(calenderDate, day);
}

function setYear(year) {
    yearDom.innerHTML = year;
}

function setMonth(month) {
    monthDom.innerHTML = month;
}

function setDays(date, highlightDay) {
    // 获取date月初
    let firstDate = new Date(date);
    firstDate.setDate(1);
    let firstDay = firstDate.getDay(); // 周几，如6，指周六

    // 获取date月末
    let endDate = new Date(date);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    let endDay = endDate.getDay(); // 周几，如0，指周日
    endDate = endDate.getDate();  // 月末

    // 获取date上个月月末
    let lastMonthEndDate = new Date(date);
    lastMonthEndDate.setDate(0);
    lastMonthEndDate = lastMonthEndDate.getDate(); // 上个月月末

    createDays();

    function createDays() {
        daysDom.innerHTML = '';
        // 上个月
        for (let i = 0; i < firstDay; i++) {
            let day = document.createElement('div');
            day.className = "not day";
            day.innerHTML = lastMonthEndDate - firstDay + i + 1;
            daysDom.appendChild(day);
        }

        // 本月
        for (let i = 1; i < endDate + 1; i++) {
            let day = document.createElement('div');
            day.className = "day";
            day.innerHTML = i;
            day.setAttribute('id', i > 9 ? 'd' + i : 'd0' + i);

            // 如果是当前日期，则高亮
            if (highlightDay && i === parseInt(highlightDay)) day.classList.add('highlight');
            daysDom.appendChild(day);
        }

        // 下个月
        for (let i = endDay, k = 0; i < 6; i++, k++) {
            let day = document.createElement('div');
            day.className = "not day";
            day.innerHTML = 1 + k;
            daysDom.appendChild(day);
        }
    }

}

// 日期格式化 -> "yyyy.mm.dd"
function dateFormat(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
    let day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
    let separator = '.';
    let dateStr = year + separator + month + separator + day;

    return dateStr;
}

// 检查dateDurChecked是否与dateStd所属的月份里有重合，若无重合，则返回null；有重合，则返回[重合起始日期，重合终止日期]
function dateInTheMonth(dateDurCheckedStr, dateStd) {
    // 获得月初日期
    let firstDate = new Date(dateStd);
    firstDate.setDate(1);
    let firstDateStr = dateFormat(firstDate);

    // 获得月末日期
    let endDate = new Date(dateStd);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    let endDateStr = dateFormat(endDate);

    // 获得起始与终止日期
    let endCheckedStr = dateDurCheckedStr.substring(dateDurCheckedStr.length / 2 + 1, dateDurCheckedStr.length);
    let startCheckedStr = dateDurCheckedStr.substring(0, dateDurCheckedStr.length / 2);

    // 无交集
    if (endCheckedStr < firstDateStr || startCheckedStr > endDateStr) return null;

    // 求交集
    let overlapStartDate = firstDateStr < startCheckedStr ? startCheckedStr : firstDateStr;
    let overlapEndDate = endDateStr > endCheckedStr ? endCheckedStr : endDateStr;

    let overlapStart = overlapStartDate.substr(8, 2);
    let overlapEnd = overlapEndDate.substr(8, 2);

    return [parseInt(overlapStart), parseInt(overlapEnd)];
}

function isToday(calenderDate) {
    return dateFormat(calenderDate) === dateFormat(new Date());
}
