module.exports = {
  async up(db, client) {
    await db.collection('alumnis').updateMany({}, {$set: {footyPoints: 0}});
    await db.collection('students').updateMany({}, {$set: {footyPoints: 0}});
  },

  async down(db, client) {
    await db.collection('alumnis').updateMany({}, {$unset: {footyPoints: null}});
    await db.collection('students').updateMany({}, {$unset: {footyPoints: null}});
  }
};
