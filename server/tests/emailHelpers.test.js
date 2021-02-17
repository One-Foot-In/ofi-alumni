const assert = require("assert")
const emailHelpers = require("../routes/helpers/emailHelpers")

describe("Weekly email digests summary strings for alumni messages exchanged are constructed reliably", () => {
    it("the alumni summary string is correct generated for 5 alumni entries, when last summary has more than one message", () => {
        let mockMessageCountByAlumniData = {
            "Marty (Madagascar, graduated: 2003)": 10,
            "Alex (NY Zoo, graduated: 2004)": 3,
            "Gloria (Broadway, graduated: 1999)": 4,
            "Maurice (Madagascar, graduated: 1997)": 5,
            "Lizard King (Madagascar, graduated: 1980)": 5
        }
        assert.deepEqual(
            emailHelpers.getNewMessagesForAlumniString(mockMessageCountByAlumniData),
            'You have 10 messages from Marty (Madagascar, graduated: 2003), 3 messages from Alex (NY Zoo, graduated: 2004), 4 messages from Gloria (Broadway, graduated: 1999), and 10 messages from 2 other alumni...'
            )
    })

    it("the alumni summary string is correct generated for 4 alumni entries, when last summary has one message", () => {
        let mockMessageCountByAlumniData = {
            "Marty (Madagascar, graduated: 2003)": 10,
            "Alex (NY Zoo, graduated: 2004)": 3,
            "Gloria (Broadway, graduated: 1999)": 4,
            "Maurice (Madagascar, graduated: 1997)": 1
        }
        assert.deepEqual(
            emailHelpers.getNewMessagesForAlumniString(mockMessageCountByAlumniData),
            'You have 10 messages from Marty (Madagascar, graduated: 2003), 3 messages from Alex (NY Zoo, graduated: 2004), 4 messages from Gloria (Broadway, graduated: 1999), and 1 message from 1 other alumnus...'
            )
    })

    it("the alumni summary string is correct generated for 3 alumni entries", () => {
        let mockMessageCountByAlumniData = {
            "Marty (Madagascar, graduated: 2003)": 10,
            "Alex (NY Zoo, graduated: 2004)": 3,
            "Gloria (Broadway, graduated: 1999)": 4
        }
        assert.deepEqual(
            emailHelpers.getNewMessagesForAlumniString(mockMessageCountByAlumniData),
            'You have 10 messages from Marty (Madagascar, graduated: 2003), 3 messages from Alex (NY Zoo, graduated: 2004), 4 messages from Gloria (Broadway, graduated: 1999)'
            )
    })
})