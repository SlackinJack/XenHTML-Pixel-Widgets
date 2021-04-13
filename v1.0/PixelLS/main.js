// Booleans
var shouldAbbreviateDate;
var shouldAbbreviateMonth;
var shouldUse24HourClock;

// Constants
const weekdaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**********************/
/******** Main ********/
/**********************/

function onload() {
    applyConfiguration();

    setInterval(doUpdates, 1000);
}

/**********************/
/****** Updaters ******/
/**********************/

function doUpdates() {
    const dateToday = new Date();

    var textHeading = formatTime(dateToday);
    setInnerTextForElement('pClock', textHeading);

    var textSubheading = (shouldAbbreviateDate ? weekdaysShort[dateToday.getDay()] : weekdays[dateToday.getDay()]) + ', ' +
            (shouldAbbreviateMonth ? monthsShort[dateToday.getMonth()] : months[dateToday.getMonth()]) + ' ' + dateToday.getDay();
    
    setInnerTextForElement('pSubheading', textSubheading);
}

/*********************/
/******* Utils *******/
/*********************/

function applyConfiguration() {
    shouldUse24HourClock = config.shouldUse24HourClock;
    shouldAbbreviateDate = config.shouldAbbreviateDate;
    shouldAbbreviateMonth = config.shouldAbbreviateMonth;
}

function formatTime(dateIn) {
    var hour = dateIn.getHours();
    var min = dateIn.getMinutes();

    if (min < 10) {
        min = "0" + min;
    }

    if (!shouldUse24HourClock) {
        if (hour > 12) {
            hour -= 12;
        }
    }

    return hour + ":" + min;
}

function setInnerTextForElement(elementIn, innerTextIn) {
    document.getElementById(elementIn).innerText = innerTextIn;
}