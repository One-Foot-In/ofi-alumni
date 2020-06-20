const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SLOTS = {
    0: '(12am - 1am)',
    100: '(1am - 2am)',
    200: '(2am - 3am)',
    300: '(3am - 4am)',
    400: '(4am - 5am)',
    500: '(5am - 6am)',
    600: '(6am - 7am)',
    700: '(7am - 8am)',
    800: '(8am - 9am)',
    900: '(9am - 10am)',
    1000: '(10am - 11am)',
    1100: '(11am - 12m)',
    1200: '(12pm - 1pm)',
    1300: '(1pm - 2pm)',
    1400: '(2pm - 3pm)',
    1500: '(3pm - 4pm)',
    1600: '(4pm - 5pm)',
    1700: '(5pm - 6pm)',
    1800: '(6pm - 7pm)',
    1900: '(7pm - 8pm)',
    2000: '(8pm - 9pm)',
    2100: '(9pm - 10pm)',
    2200: '(10pm - 11pm)',
    2300: '(11pm - 12am)',
}

function getPrevDay(day) {
    let dayIndex = DAYS.indexOf(day)
    if (dayIndex === 0) {
        return 'Saturday'
    } else {
        return DAYS[dayIndex - 1]
    }
}

function getNextDay(day) {
    let dayIndex = DAYS.indexOf(day)
    if (dayIndex === 6) {
        return 'Sunday'
    } else {
        return DAYS[dayIndex + 1]
    }
}

/*
    Each timezone slot will have shape:
    {
        id: 'Sunday-400',
        day: 'Sunday',
        time: 400
    }
*/

const timezoneUtil = {
    // strips GMT offset and brings timeslot to GMT+0 for each timeSlot provided
    stripTimezone: (timeSlots, timezone) => {
        if (timezone === 0) {
            timeSlots.map( timeSlot => {
                timeSlot.id = `${timeSlot.day}-${(timeSlot.time).toString()}`
                delete timeSlot.text
                return timeSlot
            })
            return timeSlots
        }
        return timeSlots.map( timeSlot => {
            let newTimeRaw = timeSlot.time - timezone
            let newTime = (2400 + newTimeRaw) % 2400
            if (newTimeRaw < 0) {
                // move day backward
                timeSlot.day = getPrevDay(timeSlot.day)
            } else if (
                (Math.floor((Math.abs(newTimeRaw) / 2400)) > 0) ||
                (newTime === 0 && timezone < 0)
            ) {
                // move day forward
                timeSlot.day = getNextDay(timeSlot.day)
            }
            timeSlot.time = newTime
            timeSlot.id = `${timeSlot.day}-${(timeSlot.time).toString()}`
            delete timeSlot.text
            return timeSlot
        })
    },
    // applies GMT offset and brings timeslot to given GMT for each timeSlot provided
    applyTimezone: (timeSlots, timezone) => {
        if (timezone === 0) {
            timeSlots.map( timeSlot => {
                timeSlot.id = `${timeSlot.day}-${(timeSlot.time).toString()}`
                delete timeSlot.text
                return timeSlot
            })
            return timeSlots
        }
        return timeSlots.map( timeSlot => {
            // if timezone is positive, we need to add offset
            // if timezone is negative, we need to substract offset 
            let newTimeRaw = timeSlot.time + (timezone)
            let newTime = (2400 + newTimeRaw) % 2400
            if (newTimeRaw < 0) {
                // move day backward
                timeSlot.day = getPrevDay(timeSlot.day)
            } else if (
                Math.floor((Math.abs(newTimeRaw) / 2400)) > 0 ||
                newTime === 0 && timezone > 0
            ) {
                // move day forward
                timeSlot.day = getNextDay(timeSlot.day)
            }
            timeSlot.time = newTime
            timeSlot.id = `${timeSlot.day}-${(timeSlot.time).toString()}`
            delete timeSlot.text
            return timeSlot
        })
    },
    getSlot: (time) => {
        return SLOTS[time]
    }
}

module.exports = timezoneUtil