const Express = require("express");
const HomeFeed = new Express.Router();
const admin = require("firebase-admin");

const db = admin.database().ref(`latestPosts`);
const db3 = admin.database().ref(`popularPosts`);
const db2 = admin.database().ref(`posts`);
const userDb = admin.database().ref(`users`);

HomeFeed.get("/homeFeed", async (req, res) => {
  let latest = [],
    popular = [],
    dataToBeSent = [];
  await db.once("value", (snap) => {
    snap.forEach((data) => {
      let LatestData = {};
      LatestData.uid = data.val().uid;
      LatestData.postNo = data.val().postNo;
      latest.push(LatestData);
      latest.reverse();
    });
  });
  latest.map(async (item, index) => {
    await db2
      .child(`${item.uid}/${item.postNo}__${item.uid}`)
      .once("value", async (snapshot) => {
        let data = snapshot.val();
        await userDb.child(`${item.uid}/uri`).once("value", (snap) => {
          const uri = snap.val();
          data.uri = uri;
          data.uid = item.uid;
          data.postNo = snapshot.ref.key;
          dataToBeSent.push(data);
        });
        if (index === latest.length - 1) {
          res.send(dataToBeSent);
        }
      });
  });
});
module.exports = HomeFeed;
