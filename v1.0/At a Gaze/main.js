// Integers
var intTimeRange;
var intUpdateFreq;

// Booleans
var shouldUse24HourClock;
var shouldShowAllDayEvents;
var shouldShowEvents;
var shouldAbbreviateMonth;
var shouldShowNowPlaying;
var shouldShowTimeUntilEvent;

var subheadingIsShowingEvent = false;
var subheadingIsShowingMusic = false;

// Data
var dataCalendarLatest;
var dataMusicLatest;

// Constants
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**********************/
/******** Main ********/
/**********************/

function onload() {
    applyConfiguration();

    api.calendar.observeData(function (dataIn) {
        dataCalendarLatest = dataIn;
        updateCalendar();
    });

    api.media.observeData(function (dataIn) {
        dataMusicLatest = dataIn;
        updateMusic();
    });

    setInterval(doUpdates, intUpdateFreq);
}

/**********************/
/****** Updaters ******/
/**********************/

function doUpdates() {
    updateCalendar();
    updateMusic();
}

function updateCalendar() {
    const dateToday = new Date();
    const hasEvents = dataCalendarLatest.upcomingWeekEvents.length > 0;

    var shouldReset = false;

    if (hasEvents && shouldShowEvents) {
        const theEvent = dataCalendarLatest.upcomingWeekEvents[0];
        const timeEventStart = new Date(theEvent.start);
        const timeEventEnd = new Date(theEvent.end);
        const timeCurrentWithOffset = new Date(dateToday.getTime() + (intTimeRange * 60 * 60 * 1000));
        const hasEventWithinRange = timeEventStart.getTime() <= timeCurrentWithOffset.getTime();

        if (hasEventWithinRange) {
            if (!(timeEventEnd.getTime() <= dateToday.getTime())) {
                const isEventAllDay = theEvent.allDay;
                subheadingIsShowingEvent = true;
                document.getElementById('imgSubheading').src = 'assets/cal.png';

                if (isEventAllDay && shouldShowAllDayEvents) {
                    setHeadingString(theEvent.title, null);
                    const diffDays = timeEventStart.getDate() - dateToday.getDate();

                    if (diffDays <= 0) {
                        setSubheadingString('All day today', true);
                    } else {
                        if (diffDays === 1) {
                            setSubheadingString('All day tomorrow', true);
                        } else {
                            setSubheadingString('All day in ' + diffDays + ' days', true);
                        }
                    }
                } else if (!isEventAllDay) {
                    if (!shouldShowTimeUntilEvent) {
                        setHeadingString(theEvent.title, null);
                    } else {
                        var stringTimeRemaining;

                        if (timeEventStart.getTime() <= dateToday.getTime()) {
                            stringTimeRemaining = "now";
                        } else {
                            var diffMinutes = Math.floor((timeEventStart.getTime() - dateToday.getTime()) / 1000 / 60);
                            var hours = 0;

                            while (diffMinutes >= 60) {
                                diffMinutes -= 60;
                                hours += 1;
                            }

                            if (hours === 0) {
                                if (diffMinutes >= 1) {
                                    stringTimeRemaining = "in " + diffMinutes + (diffMinutes > 1 ? " mins" : " min");
                                } else {
                                    stringTimeRemaining = "soon";
                                }
                            } else {
                                stringTimeRemaining = "in " + hours + (hours > 1 ? " hours" : " hour");
                            }
                        }

                        setHeadingString(theEvent.title, stringTimeRemaining);
                    }

                    setSubheadingString(formatTime(timeEventStart) + " - " + formatTime(timeEventEnd), true);
                } else {
                    shouldReset = true;
                }
            } else {
                shouldReset = true;
            }
        } else {
            shouldReset = true;
        }
    } else {
        shouldReset = true;
    }

    if (shouldReset) {
        setHeadingString(null, null);

        if (!subheadingIsShowingMusic) {
            setSubheadingString(null, false);
        }

        subheadingIsShowingEvent = false;
    }
}

function updateMusic() {
    var shouldReset = false;

    if (!subheadingIsShowingEvent) {
        if (dataMusicLatest !== null) {
            if (shouldShowNowPlaying && !dataMusicLatest.isStopped && dataMusicLatest.isPlaying) {
                subheadingIsShowingMusic = true;
                document.getElementById('imgSubheading').src = 'assets/music.png';
                setSubheadingString(dataMusicLatest.nowPlaying.artist + ' - ' + dataMusicLatest.nowPlaying.title, false);
            } else {
                subheadingIsShowingMusic = false;
                shouldReset = true;
            }
        } else {
            subheadingIsShowingMusic = false;
            shouldReset = true;
        }
    } else {
        subheadingIsShowingMusic = false;
    }

    if (shouldReset) {
        setSubheadingString(null, false);
    }
}

/********************/
/******* Sets *******/
/********************/

function setHeadingString(stringHeadingIn, stringTimeRemainingIn) {
    setDisplayForElement('divEvent', 'none');
    setDisplayForElement('divCalendarAndWeather', 'none');

    if (stringHeadingIn === null) {
        setDisplayForElement('divCalendarAndWeather', 'initial');
        const dateToday = new Date();
        var monthText = shouldAbbreviateMonth ? monthsShort[dateToday.getMonth()] : months[dateToday.getMonth()];
        setInnerTextForElement('pCal', weekdays[dateToday.getDay()] + ', ' + monthText + ' ' + dateToday.getDate());
    } else {
        setDisplayForElement('divEvent', 'initial');
        setInnerTextForElement('pEvent', stringHeadingIn);

        if (stringTimeRemainingIn === null) {
            document.getElementById('pEvent').style.maxWidth = '22ch';
            setInnerTextForElement('pEventTime', '');
        } else {
            document.getElementById('pEvent').style.maxWidth = '14ch';
            setInnerTextForElement('pEventTime', stringTimeRemainingIn);
        }
    }
}

function setSubheadingString(stringSubheadingIn, shouldShowWeather) {
    if (shouldShowWeather) {
        setDisplayForElement('divSubheadingWeather', 'initial');
    } else {
        setDisplayForElement('divSubheadingWeather', 'none');
    }
    
    if (stringSubheadingIn === null) {
        setDisplayForElement('divSubheading', 'none');
    } else {
        setDisplayForElement('divSubheading', 'initial');
        setInnerTextForElement('pSubheading', stringSubheadingIn);
    }
}

/*********************/
/******* Utils *******/
/*********************/

function applyConfiguration() {
    intTimeRange = config.intTimeRange;
    intUpdateFreq = config.intUpdateFreq * 1000;

    shouldUse24HourClock = config.shouldUse24HourClock;
    shouldShowAllDayEvents = config.shouldShowAllDayEvents;
    shouldShowEvents = config.shouldShowEvents;
    shouldAbbreviateMonth = config.shouldAbbreviateMonth;
    shouldShowNowPlaying = config.shouldShowNowPlaying;
    shouldShowTimeUntilEvent = config.shouldShowTimeUntilEvent;
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

    return hour + ":" + min + (shouldUse24HourClock ? "" : (dateIn.getHours() >= 12 ? " pm" : " am"));
}

function setDisplayForElement(elementIn, displayIn) {
    document.getElementById(elementIn).style.display = displayIn;
}

function setInnerTextForElement(elementIn, innerTextIn) {
    document.getElementById(elementIn).innerText = innerTextIn;
}