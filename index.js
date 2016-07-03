const fs = require('fs');

const changes = require('concurrent-couch-follower');
const Request = require('request');

const db = 'https://replicate.npmjs.com';

var count = 0;
Request.get(db, function(err, req, body) {
  var end_sequence = JSON.parse(body).update_seq;
  var results = [];
  changes(function(change, done) {
    if (change.seq >= end_sequence) {
      fs.writeFileSync("results.txt", JSON.stringify(results, null, 2))
      process.exit(0);
    }
    if (change.doc.name && change.doc.readme && change.doc.versions && change.doc.time) {
      console.log("checking:" + change.doc.name);
      if(Object.keys(change.doc.versions).length <= 1) {
        var hit = {
          "name": change.doc.name,
          "last updated": change.doc.time.modified.slice(0, 10),
          "num updates": Object.keys(change.doc.versions).length
        }
        results.push(hit);
      }
    }
    done();
  }, {
    db: db,
    include_docs: true,
    now:false
  })
});
