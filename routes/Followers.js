const Express = require("express");
const Follow = new Express.Router();
const admin = require("firebase-admin");

const FollowersDatabase = admin.database().ref("/followers");
const FollowingDatabase = admin.database().ref("/following");
const UsersDatabase = admin.database().ref(`/users`);

Follow.post("/followers", (req, res) => {
  const { uid } = req.body;
  FollowersDatabase.child(`${uid}`).once("value", async (snap) => {
    let users = [];
    let keys = [];
    if (snap.val() === null) {
      res.send([]);
    }
    snap.forEach((data) => {
      keys.push(data.ref.key);
    });
    keys.map(async (item, index) => {
      const userData = {};
      await UsersDatabase.child(`${item}/uri`).once("value", (data) => {
        userData.uri = data.val();
      });
      await UsersDatabase.child(`${item}/name`).once("value", (data) => {
        userData.name = data.val();
      });
      await UsersDatabase.child(`${item}/username`).once("value", (data) => {
        userData.username = data.val();
      });
      await UsersDatabase.child(`${item}/uid`).once("value", (data) => {
        userData.uid = data.val();
      });
      users.push(userData);
      if (index === keys.length - 1) {
        res.send(users);
      }
    });
  });
});

Follow.post("/following", (req, res) => {
  const { uid } = req.body;
  console.log(uid);
  FollowingDatabase.child(`${uid}`).once("value", async (snap) => {
    let users = [];
    let keys = [];
    if (snap.val() === null) {
      res.send([]);
    }
    snap.forEach((data) => {
      keys.push(data.ref.key);
    });
    keys.map(async (item, index) => {
      const userData = {};
      await UsersDatabase.child(`${item}/uri`).once("value", (data) => {
        userData.uri = data.val();
      });
      await UsersDatabase.child(`${item}/name`).once("value", (data) => {
        userData.name = data.val();
      });
      await UsersDatabase.child(`${item}/username`).once("value", (data) => {
        userData.username = data.val();
      });
      await UsersDatabase.child(`${item}/uid`).once("value", (data) => {
        userData.uid = data.val();
      });
      users.push(userData);
      if (index === keys.length - 1) {
        res.send(users);
      }
    });
  });
});

module.exports = Follow;
