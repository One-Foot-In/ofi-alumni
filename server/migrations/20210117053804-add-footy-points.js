module.exports = {
  async up(db, client) {
    await db.collection('alumnis').updateMany({}, {$set: {footyPoints: 0}});
    await db.collection('students').updateMany({}, {$set: {footyPoints: 0}});
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  },

  async down(db, client) {
    await db.collection('alumnis').updateMany({}, {$unset: {footyPoints: null}});
    await db.collection('students').updateMany({}, {$unset: {footyPoints: null}});
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
