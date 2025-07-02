var currentMinutes = new Date().getMinutes();
var currentDay = new Date().getDate();
var intervalId = 0;
let globalBrewTime = 0;
let globalFullBrewTime = 0;


/* CONSTANTS */
const MAX_PERCENT = 100;
const BREWTIME_INTERVAL = 1000; // 1 second
const SEC_IN_MIN = 60;
const MONTH_OFFSET = 1;

const TOD = {
    MORNING: 0,
    AFTERNOON: 1,
    EVENING: 2,
    NIGHT: 3,
};

const ToD_Cutoff = {
    MORNING_CUTOFF: 12, // 12PM
    AFTERNOON_CUTOFF: 19, // 7PM
    EVENING_CUTOFF: 21 // 9PM
};

const MORNING_SUFFIX = "AM";
const AFTERNOON_SUFFIX = "PM";

const ToD_Symbols = {
    MORNING: "\u{1F304}",
    AFTERNOON: "\u{1F31E}",
    EVENING: "\u{1F307}",
    NIGHT: "\u{1F319}",
};

const BrewStatus = {
    READY: "Ready",
    BREWING: "Brewing",
};

const BrewSymbols = {
    READY: "\u{1F7E2}", // Green Dot
    BREWING: "\u{2615}", // Cup of coffee
    ERROR: "\u{1F534}", // Red Dot
};

const TimeOfYear = {
    SPRING_CUTOFF: 2,
    SUMMER_CUTOFF: 6,
    FALL_CUTOFF: 9,
    WINTER_CUTOFF: 12,
};

const TimeOfYearSymbols = {
    SPRING: "\u{1F337}", // Spring Flower
    SUMMER: "\u{1F3D6}\u{FE0F}", // Happy Sun
    FALL: "\u{1F342}", // Fall leaves
    WINTER: "\u{2744}\u{FE0F}", // Snowflake
};

/*** UTIL FUNCTIONS ***/
function capValue(value, max) {
    return value > max ? max : value;
}

function safelyGetElementById(id) {
    let ele;
    try {
        ele = document.getElementById(id);
        if (ele === null) {
            console.error(`No element with ID ${id}`);
            throw new Error("Element not found");
        }
    } catch(error) {
        console.error(`Err: ${error.message}`);
    }
    return ele;
}

/*** Coffee Functions ***/
function initCoffeeBrewTime() {
   setBrewTimeBasedOnSelect();
}

function setBrewTimeBasedOnSelect() {
    let brewTimer;
    try {
        brewTimer = safelyGetElementById("brew-time-selector");
    } catch(error) {
        console.error(`[SetBrewTime]: ${error.message}`);
    }
    let brewSeconds = brewTimer.value * SEC_IN_MIN;
    setBrewTimeText(brewSeconds);
    globalBrewTime = brewSeconds;
    globalFullBrewTime = brewSeconds;
}

function setBrewTimeText(totalBrew) {
    let brewTime;
    try {
        const brewTimeRemainId = "brew-time-remain";
        brewTime = safelyGetElementById(brewTimeRemainId);
    } catch(error) {
        console.error(`Error: ${error.message}`);
    }
    const times = calculateTime(totalBrew)
    const initString = `Time Remaining: ${timeToString(times)}`;
    brewTime.innerText = initString;
}

function calculateTime(totalSecs) {
    const minutes = Math.floor(totalSecs / SEC_IN_MIN); // Need to floor bc JS loves turning stuff to floats
    const seconds = totalSecs % SEC_IN_MIN;
    return [minutes, seconds]
}

function timeToString(times) {
    let mins = times[0].toString();
    let secs = times[1] < 10 ? `0${times[1]}` : times[1].toString();
    return `${mins}:${secs}`;
}

function logError(msg, error) {
    console.error(`${msg}: ${error.message}`);
}

function resetBrewTime() {
    setStatus(BrewStatus.READY);
    let brewPercentId = "brew-percentage";
    let brewProgressId = "brew-progress";
    try {
        safelyGetElementById(brewPercentId).innerText = "0%";
        safelyGetElementById(brewProgressId).style.width = "0%";
    } catch(error) {
        logError("Error resetting brew progress", error);
    }
    if (intervalId != 0) {
        clearInterval(intervalId);
    }
    initCoffeeBrewTime(globalBrewTime);
}

function updateCoffeeBrewTime() {
    if (globalBrewTime < 0) {
        resetBrewTime();
    } else {
        setBrewTimeText(globalBrewTime--);
        updateBrewPercent(globalBrewTime);
    }
}

function updateBrewPercent(currBrewTime)
{
    let percent = (globalBrewTime / globalFullBrewTime) * MAX_PERCENT;
    let brewPercentId = "brew-percentage";
    let brewProgressId = "brew-progress";
    const percentString = convertPercentToWidth(percent);
    try {
        safelyGetElementById(brewPercentId).innerText = percentString;
        safelyGetElementById(brewProgressId).style.width = percentString;
    } catch(error) {
        logError("Error updating brew percent", error);
    }
}

function convertPercentToWidth(percent) {
    let width = capValue(MAX_PERCENT - percent, MAX_PERCENT);
    return `${Math.floor(width)}%`;
}

function refreshDateTime() {
    let date = new Date();
    let mins = date.getMinutes();
    let days = date.getDate();
    let timeFieldId = "time-field";
    let timeField = safelyGetElementById(timeFieldId);
    if (mins != currentMinutes || timeField.innerText === '') {
        timeField.innerText =`Time: ${buildTimeString(date)}`;
    }
    let dateFieldId = "date-field";
    let dateField = safelyGetElementById("date-field");
    if (days != currentDay || dateField.innerText === '') {
        dateField.innerText = `Date: ${buildDateString(date)}`;
    }
}

function buildTimeString(date) {
    let hours = date.getHours();
    let mins = date.getMinutes();
    let timeOfDay = getTimeOfDay(hours);
    let amOrPm = hours < 12 ? MORNING_SUFFIX : AFTERNOON_SUFFIX;
    hours = hours % 12 == 0 ? hours : hours % 12;
    minString = mins < 10 ? `0${mins}` : `${mins}`; // pad time with leading 0 if less then 10
    return`${hours}:${minString}${amOrPm} ${timeOfDayToString(timeOfDay)}`;

}
function buildDateString(date) {
    let days = date.getDate();
    let months = date.getMonth() + MONTH_OFFSET;
    let year = date.getFullYear();
    let timeOfYear = getTimeOfYear(months);
    return `${months}/${days}/${year} ${timeOfYear}`;
}

function getTimeOfYear(months) {
    if (months > TimeOfYear.SPRING_CUTOFF && months < TimeOfYear.SUMMER_CUTOFF) {
        return TimeOfYearSymbols.SPRING;
    }
    else if (months >= TimeOfYear.SUMMER_CUTOFF && months < TimeOfYear.FALL_CUTOFF) {
        return TimeOfYearSymbols.SUMMER;
    }
    else if (months >= TimeOfYear.FALL_CUTOFF && months < TimeOfYear.WINTER_CUTOFF) {
        return TimeOfYearSymbols.FALL;
    }
    else {
        return TimeOfYearSymbols.WINTER;
    }
}

function timeOfDayToString(timeOfDay)
{
    switch (timeOfDay) {
        case TOD.MORNING:
            return ToD_Symbols.MORNING;
        case TOD.AFTERNOON:
            return ToD_Symbols.AFTERNOON;
        case TOD.EVENING:
            return ToD_Symbols.EVENING;
        case TOD.NIGHT:
            return ToD_Symbols.NIGHT; // Moon
    }
}

function getTimeOfDay(hours) {
    if (hours <= ToD_Cutoff.MORNING) {
        return TOD.MORNING;
    } else if (hours > ToD_Cutoff.MORNING && hours < ToD_Cutoff.AFTERNOON) {
        return TOD.AFTERNOON;
    } else if (hours < ToD_Cutoff.EVENING){
        return TOD.EVENING;
    } else {
        return TOD.NIGHT;
    }
}

function setStatus(status) {
    let statusFieldId = "status-field";
    try {
        safelyGetElementById(statusFieldId).innerText = `Status: ${status} ${getStatusEmoji(status)}`;
    } catch(error) {
        logError("Error setting status", error);
    }
}

function getStatusEmoji(status) {
    if (status == BrewStatus.READY) {
        return BrewSymbols.READY;
    } else if (status == BrewStatus.BREWING) {
        return BrewSymbols.BREWING;
    } else {
        return BrewSymbols.ERROR;
    }
}

function getDateTimeString(date)
{
    let minutes = date.getMinutes();
    let hour = date.getHours();
    let timeOfDay = getTimeOfDay(hour);
    let amOrPm = (hour >= ToD_Cutoffs.MORNING) ? AFTERNOON_SUFFIX : MORNING_SUFFIX;
}

async function brewHandler() {
    let res = await makeBrewRequest();

    if (res) {
        setStatus(BrewStatus.BREWING);
        updateCoffeeBrewTime();
        intervalId = setInterval(updateCoffeeBrewTime, BREWTIME_INTERVAL);
    } else {
        console.error("Brew request to coffee maker failed");
    }
}

async function makeBrewRequest()
{
    let brewUrl = `/brew-${globalFullBrewTime}`;
    let response = await fetch(brewUrl);

    if (response.ok) {
        console.error("Failed to post brewtime for coffee maker");
        return false;
    }

    return true;

}

function coffeeStartup() {
    const brewSelectorId = "brew-time-selector";
    const brewButtonId = "brew-button";
    const stopBrewButtonId = "stop-brew-button";
    initCoffeeBrewTime(globalBrewTime);
    try {
        safelyGetElementById(brewSelectorId).onchange = setBrewTimeBasedOnSelect;
        safelyGetElementById(brewButtonId).onclick = brewHandler;
        safelyGetElementById(stopBrewButtonId).onclick = resetBrewTime;
    } catch(error) {
        logError("Error setting up brew click handlers", error);
    }
    refreshDateTime();
    setStatus(BrewStatus.READY);
    setInterval(refreshDateTime, BREWTIME_INTERVAL, globalBrewTime);
}

document.addEventListener("DOMContentLoaded", function() {
    coffeeStartup();
});
