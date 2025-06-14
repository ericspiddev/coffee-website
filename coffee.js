let globalBrewTime = 120;

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
    console.log(totalSecs);
    const minutes = totalSecs / 60;
    const seconds = totalSecs % 60;
    return [minutes, seconds]
}

function timeToString(times) {
    let mins = times[0].toString();
    let secs = times[1] < 10 ? `0${times[1]}` : times[1].toString();
    return `${mins}:${secs}`;
}

function updateCoffeeBrewTime(currBrewTime) {
    console.log(currBrewTime);
    if (currBrewTime <= 0) {
        initCoffeeBrewTime(120);
    } else {
        setBrewTimeText(--currBrewTime);
    }
}

function getCoffeeBrewTime() {
    const brewTime = document.getElementById("brew-time-remain");
    if (brewTime == undefined) {
        console.error("No brew time element found :\( ");
        return undefined;
    }
    return brewTime;
}

document.addEventListener("DOMContentLoaded", function() {
    console.log("test");
    initCoffeeBrewTime(globalBrewTime);
    setInterval(updateCoffeeBrewTime, 1000, globalBrewTime);
});
