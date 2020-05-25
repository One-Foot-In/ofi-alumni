const assert = require("assert")
const timezoneHelpers = require("../helpers/timezoneHelpers")

describe("test timezoneHelpers#stripTimezone", () => {
  it("strips timezone correctly for negative timezone", function() {
    let timeSlots = [
      {
        id: 'Sunday-400',
        day: 'Sunday',
        time: 400,
        text: 'Sunday (4am - 5am)'
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Sunday-500',
        day: 'Sunday',
        time: 500,
      }
    ]
    assert.deepEqual(timezoneHelpers.stripTimezone(timeSlots, -100), expectedTimeSlots);
  });

  it("strips timezone correctly for postive timezone", function() {
    let timeSlots = [
      {
        id: 'Sunday-400',
        day: 'Sunday',
        time: 400,
        text: 'Sunday (4am - 5am)'
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Sunday-300',
        day: 'Sunday',
        time: 300,
      }
    ]
    assert.deepEqual(timezoneHelpers.stripTimezone(timeSlots, 100), expectedTimeSlots);
  });

  it("strips timezone correctly for negative timezone and day needs moving forward", function() {
    let timeSlots = [
      {
        id: 'Sunday-2300',
        day: 'Sunday',
        time: 2300,
        text: 'Sunday (11pm - 12am)'
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Monday-400',
        day: 'Monday',
        time: 400,
      }
    ]
    assert.deepEqual(timezoneHelpers.stripTimezone(timeSlots, -500), expectedTimeSlots);
  });

  it("strips timezone correctly for positive timezone and day needs moving backward", function() {
    let timeSlots = [
      {
        id: 'Monday-100',
        day: 'Monday',
        time: 100,
        text: 'Monday (1am - 2am)'
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Sunday-2200',
        day: 'Sunday',
        time: 2200,
      }
    ]
    assert.deepEqual(timezoneHelpers.stripTimezone(timeSlots, 300), expectedTimeSlots);
  });

  it("strips timezone correctly for positive timezone and day needs moving backward to last week", function() {
    let timeSlots = [
      {
        id: 'Sunday-100',
        day: 'Sunday',
        time: 100,
        text: 'Sunday (1am - 2am)'
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Saturday-2200',
        day: 'Saturday',
        time: 2200,
      }
    ]
    assert.deepEqual(timezoneHelpers.stripTimezone(timeSlots, 300), expectedTimeSlots);
  });

  it("strips timezone correctly for negative timezone and day needs moving forward to next week", function() {
    let timeSlots = [
      {
        id: 'Saturday-2200',
        day: 'Saturday',
        time: 2200,
        text: 'Saturday (10pm - 11pm)'
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Sunday-100',
        day: 'Sunday',
        time: 100,
      }
    ]
    assert.deepEqual(timezoneHelpers.stripTimezone(timeSlots, -300), expectedTimeSlots);
  });

  it("strips timezone correctly multiple entries", function() {
    let timeSlots = [
      {
        id: 'Sunday-600',
        day: 'Sunday',
        time: 600,
        text: 'Sunday (6am - 7am)'
      },
      {
        id: 'Monday-0',
        day: 'Monday',
        time: 0,
        text: 'Monday (12am - 1am)'
      },
      {
        id: 'Saturday-1900',
        day: 'Saturday',
        time: 1900
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Sunday-100',
        day: 'Sunday',
        time: 100
      },
      {
        id: 'Sunday-1900',
        day: 'Sunday',
        time: 1900
      },
      {
        id: 'Saturday-1400',
        day: 'Saturday',
        time: 1400
      }
    ]
    assert.deepEqual(timezoneHelpers.stripTimezone(timeSlots, 500), expectedTimeSlots);
  });

  it("does not affect timeSlots when timezone is 0", function() {
    let timeSlots = [
      {
        id: 'Saturday-2200',
        day: 'Saturday',
        time: 2200,
        text: 'Saturday (10pm - 11pm)'
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Saturday-2200',
        day: 'Saturday',
        time: 2200
      }
    ]
    assert.deepEqual(timezoneHelpers.stripTimezone(timeSlots, 0), expectedTimeSlots);
  });

  it("does not change day when time brought to zero with positive timezone", function() {
    let timeSlots = [
      {
        id: 'Sunday-400',
        day: 'Sunday',
        time: 400,
        text: 'Sunday (4am - 5am)'
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Sunday-0',
        day: 'Sunday',
        time: 0,
      }
    ]
    assert.deepEqual(timezoneHelpers.stripTimezone(timeSlots, 400), expectedTimeSlots);
  });

  it("moves day forward when time brought to zero with negative timezone", function() {
    let timeSlots = [
      {
        id: 'Sunday-2100',
        day: 'Sunday',
        time: 2100,
        text: 'Sunday (9pm - 10m)'
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Monday-0',
        day: 'Monday',
        time: 0,
      }
    ]
    assert.deepEqual(timezoneHelpers.stripTimezone(timeSlots, -300), expectedTimeSlots);
  });
});

describe("test timezoneHelpers#applyTimezone", () => {
  it("applies timezone correctly for negative timezone", function() {
    let timeSlots = [
      {
        id: 'Sunday-400',
        day: 'Sunday',
        time: 400,
        text: 'Sunday (4am - 5am)'
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Sunday-300',
        day: 'Sunday',
        time: 300,
      }
    ]
    assert.deepEqual(timezoneHelpers.applyTimezone(timeSlots, -100), expectedTimeSlots);
  });

  it("applies timezone correctly for postive timezone", function() {
    let timeSlots = [
      {
        id: 'Sunday-400',
        day: 'Sunday',
        time: 400,
        text: 'Sunday (4am - 5am)'
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Sunday-500',
        day: 'Sunday',
        time: 500,
      }
    ]
    assert.deepEqual(timezoneHelpers.applyTimezone(timeSlots, 100), expectedTimeSlots);
  });

  it("applies timezone correctly for negative timezone and day needs moving backward", function() {
    let timeSlots = [
      {
        id: 'Tuesday-100',
        day: 'Tuesday',
        time: 100,
        text: 'Tuesday (1am - 2am)'
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Monday-2200',
        day: 'Monday',
        time: 2200,
      }
    ]
    assert.deepEqual(timezoneHelpers.applyTimezone(timeSlots, -300), expectedTimeSlots);
  });

  it("applies timezone correctly for positive timezone and day needs moving forward", function() {
    let timeSlots = [
      {
        id: 'Sunday-2300',
        day: 'Sunday',
        time: 2300,
        text: 'Sunday (11pm - 12am)'
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Monday-400',
        day: 'Monday',
        time: 400,
      }
    ]
    assert.deepEqual(timezoneHelpers.applyTimezone(timeSlots, 500), expectedTimeSlots);
  });

  it("applies timezone correctly for negative timezone and day needs moving backward to last week", function() {
    let timeSlots = [
      {
        id: 'Sunday-100',
        day: 'Sunday',
        time: 100,
        text: 'Sunday (1am - 2am)'
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Saturday-2200',
        day: 'Saturday',
        time: 2200,
      }
    ]
    assert.deepEqual(timezoneHelpers.applyTimezone(timeSlots, -300), expectedTimeSlots);
  });

  it("applies timezone correctly for positive timezone and day needs moving forward to next week", function() {
    let timeSlots = [
      {
        id: 'Saturday-2200',
        day: 'Saturday',
        time: 2200,
        text: 'Saturday (10pm - 11pm)'
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Sunday-100',
        day: 'Sunday',
        time: 100,
      }
    ]
    assert.deepEqual(timezoneHelpers.applyTimezone(timeSlots, 300), expectedTimeSlots);
  });

  it("applies timezone correctly multiple entries", function() {
    let timeSlots = [
      {
        id: 'Sunday-600',
        day: 'Sunday',
        time: 600,
        text: 'Sunday (6am - 7am)'
      },
      {
        id: 'Monday-2300',
        day: 'Monday',
        time: 2300,
        text: 'Monday (11pm - 12am)'
      },
      {
        id: 'Saturday-1800',
        day: 'Saturday',
        time: 1800
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Sunday-1100',
        day: 'Sunday',
        time: 1100
      },
      {
        id: 'Tuesday-400',
        day: 'Tuesday',
        time: 400
      },
      {
        id: 'Saturday-2300',
        day: 'Saturday',
        time: 2300
      }
    ]
    assert.deepEqual(timezoneHelpers.applyTimezone(timeSlots, 500), expectedTimeSlots);
  });

  it("does not affect timeSlots when timezone is 0", function() {
    let timeSlots = [
      {
        id: 'Saturday-2200',
        day: 'Saturday',
        time: 2200,
        text: 'Saturday (10pm - 11pm)'
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Saturday-2200',
        day: 'Saturday',
        time: 2200
      }
    ]
    assert.deepEqual(timezoneHelpers.applyTimezone(timeSlots, 0), expectedTimeSlots);
  });

  it("does not change day when time brought to zero with negative timezone", function() {
    let timeSlots = [
      {
        id: 'Sunday-400',
        day: 'Sunday',
        time: 400,
        text: 'Sunday (4am - 5am)'
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Sunday-0',
        day: 'Sunday',
        time: 0,
      }
    ]
    assert.deepEqual(timezoneHelpers.applyTimezone(timeSlots, -400), expectedTimeSlots);
  });

  it("moves day forward when time brought to zero with positive timezone", function() {
    let timeSlots = [
      {
        id: 'Sunday-2100',
        day: 'Sunday',
        time: 2100,
        text: 'Sunday (9pm - 10m)'
      }
    ]
    let expectedTimeSlots = [
      {
        id: 'Monday-0',
        day: 'Monday',
        time: 0,
      }
    ]
    assert.deepEqual(timezoneHelpers.applyTimezone(timeSlots, 300), expectedTimeSlots);
  });
});