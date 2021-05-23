// Booleans
let shouldAbbreviateDate;
let shouldAbbreviateMonth;
let shouldUse24HourClock;
let shouldAddLeadingZeroToHours;

// Data

// Strings
let stringCalendarAppIdentifier;
let stringClockAppIdentifier;
let stringWeatherAppIdentifier;

// Constants
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**********************/
/***** Main Funcs *****/
/**********************/

function onLoad() {
    applyConfiguration();

    setInterval(doUpdates, 1000);
}

function onHeadingClick() {
    api.apps.launchApplication(stringClockAppIdentifier);
}

function onSubheadingClick() {
    api.apps.launchApplication(stringCalendarAppIdentifier);
}


function onWeatherClick() {
    api.apps.launchApplication(stringWeatherAppIdentifier);
}

/**********************/
/****** Updaters ******/
/**********************/

function doUpdates() {
    const dateToday = new Date();
    const theWeekday = weekdays[dateToday.getMonth()];
    const theMonth = months[dateToday.getMonth()];

    let textHeading = formatTime(dateToday);
    let textSubheading = (shouldAbbreviateDate ? truncateStringToLength(theWeekday, 3) : theWeekday) + ', ' +
                         (shouldAbbreviateMonth ? truncateStringToLength(theMonth, 3) : theMonth) + ' ' + dateToday.getDate();

    setInnerTextForElement('pClock', textHeading);
    setInnerTextForElement('pSubheading', textSubheading);
}

/*********************/
/******* Utils *******/
/*********************/

function applyConfiguration() {
    shouldUse24HourClock = config.shouldUse24HourClock;
    shouldAbbreviateDate = config.shouldAbbreviateDate;
    shouldAbbreviateMonth = config.shouldAbbreviateMonth;
    shouldAddLeadingZeroToHours = config.shouldAddLeadingZeroToHours;
    
    stringCalendarAppIdentifier = config.stringOverrideCalendarAppID;
    stringClockAppIdentifier = config.stringOverrideClockAppID;
    stringWeatherAppIdentifier = config.stringOverrideWeatherAppID;
}

function formatTime(dateIn) {
    let hour = dateIn.getHours();
    let min = dateIn.getMinutes();

    if (min < 10) {
        min = "0" + min;
    }

    if (!shouldUse24HourClock) {
        if (hour > 12) {
            hour -= 12;
        }
    }

    if (shouldAddLeadingZeroToHours) {
        if (hour < 10) {
            hour = "0" + hour;
        }
    }

    return hour + ":" + min;
}

function setInnerTextForElement(elementIn, innerTextIn) {
    document.getElementById(elementIn).innerText = innerTextIn;
}

function truncateStringToLength(stringIn, intLengthIn) {
    let stringOutput = '';

    for (let i = 0; i < intLengthIn; i++) {
        stringOutput = stringOutput + stringIn.charAt(i);
    }

    return stringOutput;
}