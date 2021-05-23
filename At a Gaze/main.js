// Integers
let intTimeRange;
let intUpdateFreq;

// Booleans
let shouldAbbreviateMonth;
let shouldAddLeadingZeroToHours;
let shouldShowAllDayEvents;
let shouldShowEvents;
let shouldShowNowPlaying;
let shouldShowOverdueReminders;
let shouldShowReminders;
let shouldShowTimeUntilEvent;
let shouldUse24HourClock;

// Data
let dataReminderLatest = null;
let dataCalendarLatest = null;
let dataMusicLatest = null;
let dataCurrentAppIdentifierHeading = 'com.apple.mobilecal';
let dataCurrentAppIdentifierSubheading = 'com.apple.mobilecal';

// Constants
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const imgCalAsset = 'assets/cal.png';
const idCal = 'com.apple.mobilecal';
const imgPlayingAsset = 'assets/playing.png';
const imgMusicAsset = 'assets/music.png';
const imgReminderAsset = 'assets/reminder.png';
const idReminder = 'com.apple.reminders';
const imgSpotifyAsset = 'assets/spotify.png';
const imgYoutubeAsset = 'assets/youtube.png';
const imgYoutubeMusicAsset = 'assets/youtubemusic.png';

/**********************/
/***** Main Funcs *****/
/**********************/

function onLoad() {
    applyConfiguration();

    api.reminders.observeData(function (dataIn) {
        dataReminderLatest = dataIn;
    });

    api.calendar.observeData(function (dataIn) {
        dataCalendarLatest = dataIn;
    });

    api.media.observeData(function (dataIn) {
        dataMusicLatest = dataIn;
    });

    doUpdates();
    setInterval(doUpdates, intUpdateFreq);
}

function onHeadingClick() {
    api.apps.launchApplication(dataCurrentAppIdentifierHeading);
}

function onSubheadingClick() {
    api.apps.launchApplication(dataCurrentAppIdentifierSubheading);
}


function onWeatherClick() {
    api.apps.launchApplication('com.apple.weather');
}

/**********************/
/****** Updaters ******/
/**********************/

function doUpdates() {
    let dataToUse = getData();

    setHeadingString(dataToUse[1], dataToUse[4]);
    setSubheadingString(dataToUse[2], dataToUse[5]);
    setSubheadingImage(dataToUse[3]);
    setAppToOpen(dataToUse[6], dataToUse[7]);
}

function getData() {
    let dataReminder = updateReminder();
    let dataCalendar = updateCalendar();

    if (dataReminder[0] === -1 && dataCalendar[0] === -1) {
        return updateDefault();
    } else {
        if (dataReminder[0] !== -1 && dataCalendar[0] !== -1) {
            if (dataReminder[0] <= dataCalendar[0]) {
                return dataReminder;
            } else {
                return dataCalendar;
            }
        } else {
            if (dataCalendar[0] >= 0) {
                return dataCalendar;
            } else {
                return dataReminder;
            }
        }
    }
}

function updateReminder() {
    let timestamp = -1;
    let stringHeading = '';
    let stringSubheading = '';

    if (shouldShowReminders) {
        if (dataReminderLatest !== null && dataReminderLatest.pending.length > 0) {
            const timeCurrent = new Date();
            const timeCurrentWithOffset = new Date(timeCurrent.getTime() + (intTimeRange * 60 * 60 * 1000));
            let nearestReminder = null;

            for (let i = 0; i < dataReminderLatest.pending.length; i++) {
                let theReminder = dataReminderLatest.pending[i];

                if (theReminder.due > -1) {
                    if (theReminder.due < timeCurrent.getTime()) {
                        if (!shouldShowOverdueReminders) {
                            continue;
                        } else {
                            nearestReminder = theReminder;
                            break;
                        }
                    } else {
                        if (theReminder.due <= timeCurrentWithOffset.getTime()) {
                            nearestReminder = theReminder;
                            break;
                        }
                    }
                }
            }

            if (nearestReminder !== null) {
                timestamp = nearestReminder.due;
                const timeDifference = getApproximateTimeDifference(timeCurrent.getTime(), nearestReminder.due);
                const truncatedTitle = truncateStringToLength(nearestReminder.title, 24, true);

                if (timeDifference[0] > 0) {
                    stringHeading = timeDifference[0] + ' ' + timeDifference[1] + ': ' + truncatedTitle;
                } else if (timeDifference[0] < 0) {
                    stringHeading = 'Now: ' + truncatedTitle;
                } else {
                    stringHeading = 'Soon: ' + truncatedTitle;
                }

                stringSubheading = 'at ' + formatTime(nearestReminder.due);
            }
        }
    }

    return [timestamp, stringHeading, stringSubheading, imgReminderAsset, false, true, idReminder, idReminder];
}

function updateCalendar() {
    let intTimestamp = -1;
    let stringHeading = '';
    let stringSubheading = '';

    if (shouldShowEvents) {
        if (dataCalendarLatest !== null && dataCalendarLatest.upcomingWeekEvents.length > 0) {
            const nearestEvent = dataCalendarLatest.upcomingWeekEvents[0];
            const timeCurrent = new Date();
            const timeCurrentWithOffset = new Date(timeCurrent.getTime() + (intTimeRange * 60 * 60 * 1000));
            const timeNearestEventStart = new Date(nearestEvent.start);

            if (nearestEvent.start <= timeCurrentWithOffset.getTime()) {
                if (nearestEvent.end >= timeCurrent.getTime()) {
                    if (nearestEvent.allDay && shouldShowAllDayEvents) {
                        intTimestamp = nearestEvent.start;
                        stringHeading = truncateStringToLength(nearestEvent.title, 22, true);
                        const doubleTimeDifference = (nearestEvent.start - timeCurrent.getTime()) / 1000 / 60 / 60 / 24;

                        if (doubleTimeDifference < 1 && timeNearestEventStart.getDate() === timeCurrent.getDate()) {
                            stringSubheading = 'All day today';
                        } else {
                            if (doubleTimeDifference <= 1) {
                                stringSubheading = 'All day tomorrow';
                            } else {
                                const roundedDifference = Math.ceil(doubleTimeDifference);
                                stringSubheading = 'All day in ' + roundedDifference + ' ' + formatPluralSingular(roundedDifference, 'day');
                            }
                        }
                    } else if (!nearestEvent.allDay) {
                        intTimestamp = nearestEvent.start;
                        stringSubheading = formatTime(nearestEvent.start) + ' - ' + formatTime(nearestEvent.end);

                        if (!shouldShowTimeUntilEvent) {
                            stringHeading = truncateStringToLength(nearestEvent.title, 22, true);
                        } else {
                            const timeDifference = getApproximateTimeDifference(timeCurrent.getTime(), nearestEvent.start);
                            let stringTimeRemaining = '';

                            if (timeDifference[0] > 0) {
                                stringTimeRemaining = ' in ' + timeDifference[0] + ' ' + timeDifference[1];
                            } else if (timeDifference[0] < 0) {
                                stringTimeRemaining = ' now';
                            } else {
                                stringTimeRemaining = ' soon';
                            }

                            stringHeading = truncateStringToLength(nearestEvent.title, 14, true) + stringTimeRemaining;
                        }
                    }
                }
            }
        }
    }

    return [intTimestamp, stringHeading, stringSubheading, imgCalAsset, false, true, idCal, idCal];
}

function updateDefault() {
    const dateToday = new Date();
    let monthText = shouldAbbreviateMonth ? truncateStringToLength(months[dateToday.getMonth()], 3, false) : months[dateToday.getMonth()];
    let stringHeading = weekdays[dateToday.getDay()] + ', ' + monthText + ' ' + dateToday.getDate();
    let stringSubheading = '';
    let imgAsset = 'none';
    let idAppToOpen = idCal;

    if (shouldShowNowPlaying) {
        if (dataMusicLatest !== null) {
            if (!dataMusicLatest.isStopped && dataMusicLatest.isPlaying) {
                idAppToOpen = dataMusicLatest.nowPlayingApplication.identifier;
                
                switch (idAppToOpen) {
                    case 'com.spotify.client':
                        imgAsset = imgSpotifyAsset;
                        break;
                    case 'com.google.ios.youtube':
                        imgAsset = imgYoutubeAsset;
                        break;
                    case 'com.apple.Music':
                        imgAsset = imgMusicAsset;
                        break;
                    case 'com.google.ios.youtubemusic':
                        imgAsset = imgYoutubeMusicAsset;
                        break;
                    default:
                        imgAsset = imgPlayingAsset;
                        break;
                }

                stringSubheading = truncateStringToLength(dataMusicLatest.nowPlaying.artist + ' - ' + dataMusicLatest.nowPlaying.title, 40, true);
            }
        }
    }


    return [-1, stringHeading, stringSubheading, imgAsset, true, false, idCal, idAppToOpen];
}

/********************/
/******* Sets *******/
/********************/

function setHeadingString(stringHeadingIn, shouldShowWeather) {
    setDisplayForElement('divCalendarAndWeather', shouldShowWeather ? 'initial' : 'none');
    setDisplayForElement('pSeparator', shouldShowWeather ? 'initial' : 'none');
    setInnerTextForElement('pHeading', stringHeadingIn);
}

function setSubheadingString(stringSubheadingIn, shouldShowWeather) {
    setDisplayForElement('divSubheadingWeather', shouldShowWeather ? 'initial' : 'none');
    setDisplayForElement('pSeparatorSubheading', shouldShowWeather ? 'initial' : 'none');
    setInnerTextForElement('pSubheading', stringSubheadingIn);
}

function setSubheadingImage(assetIn) {
    if (assetIn === 'none') {
        setDisplayForElement('imgSubheading', 'none');
    } else {
        document.getElementById('imgSubheading').src = assetIn;
        setDisplayForElement('imgSubheading', 'initial');
    }
}

function setAppToOpen(idForHeadingIn, idForSubheadingIn) {
    dataCurrentAppIdentifierHeading = idForHeadingIn;
    dataCurrentAppIdentifierSubheading = idForSubheadingIn;
}

function setDisplayForElement(elementIn, displayIn) {
    document.getElementById(elementIn).style.display = displayIn;
}

function setInnerTextForElement(elementIn, innerTextIn) {
    document.getElementById(elementIn).innerText = innerTextIn;
}

/*********************/
/******* Utils *******/
/*********************/

function applyConfiguration() {
    intTimeRange = config.intTimeRange;
    intUpdateFreq = config.intUpdateFreq * 1000;

    shouldAbbreviateMonth = config.shouldAbbreviateMonth;
    shouldAddLeadingZeroToHours = config.shouldAddLeadingZeroToHours;
    shouldShowAllDayEvents = config.shouldShowAllDayEvents;
    shouldShowEvents = config.shouldShowEvents;
    shouldShowNowPlaying = config.shouldShowNowPlaying;
    shouldShowOverdueReminders = config.shouldShowOverdueReminders;
    shouldShowReminders = config.shouldShowReminders;
    shouldShowTimeUntilEvent = config.shouldShowTimeUntilEvent;
    shouldUse24HourClock = config.shouldUse24HourClock;
}

function formatPluralSingular(intNumberIn, stringTextIn) {
    return ((intNumberIn !== 1) ? (stringTextIn + 's') : stringTextIn);
}

function formatTime(dateIn) {
    let theDate = new Date(dateIn);

    let hour = theDate.getHours();
    let min = theDate.getMinutes();

    if (min < 10) {
        min = '0' + min;
    }

    if (!shouldUse24HourClock) {
        if (hour > 12) {
            hour -= 12;
        }
    }

    if (shouldAddLeadingZeroToHours) {
        if (hour < 10) {
            hour = '0' + hour;
        }
    }

    return hour + ':' + min + (shouldUse24HourClock ? '' : (theDate.getHours() >= 12 ? ' pm' : ' am'));
}

function getApproximateTimeDifference(time1In, time2In) {
    if (time2In <= time1In) {
        return [-1, 'now'];
    } else {
        const doubleDaysDifference = (time2In - time1In) / 1000 / 60 / 60 / 24;
        if (doubleDaysDifference < 1) {
            const doubleHoursDifference = (time2In - time1In) / 1000 / 60 / 60;
            if (doubleHoursDifference < 1) {
                const doubleMinsDifference = (time2In - time1In) / 1000 / 60;
                if (doubleMinsDifference < 1) {
                    return [0, 'soon'];
                } else {
                    const roundedDifference = Math.round(doubleMinsDifference);
                    return [roundedDifference, formatPluralSingular(roundedDifference, 'min')];
                }
            } else {
                const roundedDifference = Math.round(doubleHoursDifference);
                return [roundedDifference, formatPluralSingular(roundedDifference, 'hour')];
            }
        } else {
            const roundedDifference = Math.round(doubleDaysDifference);
            return [roundedDifference, formatPluralSingular(roundedDifference, 'day')];
        }
    }
}

function truncateStringToLength(stringIn, intLengthIn, shouldAddEllipsis) {
    let stringOutput = '';
    let canAddEllipsis = shouldAddEllipsis;
    let isLastCharacterSpace = false;

    if (shouldAddEllipsis && stringIn.length <= intLengthIn) {
        canAddEllipsis = false;
    }

    for (let i = 0; i < intLengthIn; i++) {
        stringOutput = stringOutput + stringIn.charAt(i);

        if (i === (intLengthIn - 1)) {
            isLastCharacterSpace = (stringIn.charAt(i) === ' '.charAt(0));
        }
    }

    return stringOutput + (isLastCharacterSpace ? '' : ' ') + (canAddEllipsis ? '...' : '');
}