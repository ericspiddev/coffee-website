
var globalBrewTime = 120;
var currentMinutes = new Date().getMinutes();
var currentDay = new Date().getDate();
var intervalId = 0;

const MORNING = 0;
const AFTERNOON = 1;
const EVENING = 2;
const NIGHT = 3;

function initCoffeeBrewTime(totalSecs) {
    setBrewTimeText(totalSecs);
}

function setBrewTimeText(totalBrew) {
    const brewTime = getCoffeeBrewTime();
    const times = calculateTime(totalBrew)
    const initString = `Time Remaining: ${timeToString(times)}`;
    if (brewTime === undefined) {
        return;
    }
    brewTime.innerText = initString;
}

function calculateTime(totalSecs) {
    const minutes = Math.floor(totalSecs / 60); // Need to floor bc JS loves turning stuff to floats
    const seconds = totalSecs % 60;
    return [minutes, seconds]
}

function timeToString(times) {
    let mins = times[0].toString();
    let secs = times[1] < 10 ? `0${times[1]}` : times[1].toString();
    return `${mins}:${secs}`;
}

function resetBrewTime() {
    setStatus("Ready");
    document.getElementById("brew-percentage").innerText = "0%";
    document.getElementById("brew-progress").style.width = "0%";
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
    let percent = (globalBrewTime / globalFullBrewTime) * 100;
    const progressBar = document.getElementById("brew-progress");
    const percentString = document.getElementById("brew-percentage");
    let width = 100 - percent > 100 ? 100 : 100 - percent;
    percentString.innerText = `${Math.floor(width)}%`
    progressBar.style.width = `${width}%`;
}

function refreshDateTime() {
    let date = new Date();
    let mins = date.getMinutes();
    let timeField = document.getElementById("time-field");
    if (mins != currentMinutes || timeField.innerText === '') {
        let hours = date.getHours();
        let timeOfDay = getTimeOfDay(hours);
        let amOrPm = hours < 12 ? "AM" : "PM"
        hours = hours % 12 == 0 ? hours : hours % 12;
        minString = mins < 10 ? `0${mins}` : `${mins}`; // pad time with leading 0 if less then 10
        timeField.innerText =`Time: ${hours}:${minString}${amOrPm} ${timeOfDayToString(timeOfDay)}`;
    }

    let dateField = document.getElementById("date-field");
    let days = date.getDate();
    if (days != currentDay || dateField.innerText === '') {
        let months = date.getMonth() + 1;
        let year = date.getFullYear();
        let timeOfYear = getTimeOfYear(months);
        dateField.innerText = `Date: ${months}/${days}/${year} ${timeOfYear}`
    }
}

function getTimeOfYear(months) {
    if (months > 2 && months < 6) {
        return "\u{1F337}";
    }
    else if (months >= 6 && months < 9) {
        return "\u{1F3D6}\u{FE0F}";
    }
    else if (months >= 9 && months < 12){
        return "\u{1F342}";
    }
    else {
        return "\u{2744}\u{FE0F}";
    }
}

function timeOfDayToString(timeOfDay)
{
    switch (timeOfDay) {
        case MORNING:
            return "\u{1F304}";
        case AFTERNOON:
            return "\u{1F31E}";
        case EVENING:
            return "\u{1F307}";
        case NIGHT:
            return "\u{1F319}";
    }
}

function getTimeOfDay(hours) {
    if (hours <= 12) {
        return MORNING;
    } else if (hours > 12 && hours < 19) {
        return AFTERNOON;
    } else if (hours < 21){
        return EVENING;
    } else {
        return NIGHT;
    }
}

function setStatus(status) {
    let statusField = document.getElementById('status-field');
    statusField.innerText = `Status: ${status} ${getStatusEmoji(status)}`
}

function getStatusEmoji(status) {
    if (status == "Ready") {
        return "\u{1F7E2}";
    } else if (status == "Brewing") {
        return "\u{2615}";
    } else {
        return "\u{1F534}";
    }
}

function getDateTimeString(date)
{
    let minutes = date.getMinutes();
    let hour = date.getHours();
    let timeOfDay = getTimeOfDay(hour);
    let amOrPm = (hour >= 12) ? "PM" : "AM"
}

function getCoffeeBrewTime() {
    const brewTime = document.getElementById("brew-time-remain");
    if (brewTime == undefined) {
        console.error("No brew time element found :\( ");
        return undefined;
    }
    return brewTime;
}

async function brewHandler() {
    let res = await makeBrewRequest();
    console.log("res is " + res);
    if (res) {
        setStatus("Brewing");
        updateCoffeeBrewTime();
        intervalId = setInterval(updateCoffeeBrewTime, 1000);
    } else {
        console.error("Brew request to coffee maker failed");
    }
}

async function makeBrewRequest()
{
    let brewUrl = "/brew";
    let response = await fetch(brewUrl);

    if (!response.ok) {
        console.error("Failed to fetch brew");
        return false;
    }

    const json = await response.json();
    console.log(json);
    return true;

}

document.addEventListener("DOMContentLoaded", function() {
    initCoffeeBrewTime(globalBrewTime);
    refreshDateTime();
    setStatus("Ready")
    document.getElementById("brew-button").onclick = brewHandler;
    document.getElementById("stop-brew-button").onclick = resetBrewTime;
    setInterval(refreshDateTime, 1000, globalBrewTime);
});
