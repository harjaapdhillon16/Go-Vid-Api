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
  await db.limitToLast(2).once("value", (snap) => {
    snap.forEach((data) => {
      let LatestData = {};
      LatestData.uid = data.val().uid;
      LatestData.postNo = data.val().postNo;
      latest.push(LatestData);
    });
  });
  latest.map(async (item, index) => {
    await db2
      .child(`${item.uid}/${item.postNo}`)
      .once("value", async (snapshot) => {
        let data = snapshot.val();
        await userDb
          .child(`${item.uid}/uri`)
          .once("value", (snap) => (data.uri = snap.val()));
        data.uid = item.uid;
        dataToBeSent.push(data);
        if (index === 0) {
          res.send(dataToBeSent);
        }
      });
  });
});
module.exports = HomeFeed;
