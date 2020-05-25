const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

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
                delete timeSlot.text
                return timeSlot
            })
            return timeSlots
        }
        return timeSlots.map( timeSlot => {
            let newTimeRaw = timeSlot.time + (timezone * (-1))
            if (newTimeRaw < 0) {
                // move day backward
                timeSlot.day = getPrevDay(timeSlot.day)
            } else if ((Math.floor((Math.abs(newTimeRaw) / 2400)) > 0)) {
                // move day forward
                timeSlot.day = getNextDay(timeSlot.day)
            }
            timeSlot.time = (2400 + newTimeRaw) % 2400
            timeSlot.id = `${timeSlot.day}-${(timeSlot.time).toString()}`
            delete timeSlot.text
            return timeSlot
        })
    },
    // applies GMT offset and brings timeslot to given GMT for each timeSlot provided
    applyTimezone: (timeSlots, timezone) => {
        if (timezone === 0) {
            timeSlots.map( timeSlot => {
                delete timeSlot.text
                return timeSlot
            })
            return timeSlots
        }
        return timeSlots.map( timeSlot => {
            // if timezone is positive, we need to add offset
            // if timezone is negative, we need to substract offset 
            let newTimeRaw = timeSlot.time + timezone
            if (newTimeRaw < 0) {
                // move day backward
                timeSlot.day = getPrevDay(timeSlot.day)
            } else if (Math.floor((Math.abs(newTimeRaw) / 2400)) > 0) {
                // move day forward
                timeSlot.day = getNextDay(timeSlot.day)
            }
            timeSlot.time = (2400 + newTimeRaw) % 2400
            timeSlot.id = `${timeSlot.day}-${(timeSlot.time).toString()}`
            delete timeSlot.text
            return timeSlot
        })
    }
}

module.exports = timezoneUtil