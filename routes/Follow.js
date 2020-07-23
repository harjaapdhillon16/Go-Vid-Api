const express = require("express");
const Follow = new express.Router();
const admin = require("firebase-admin");

Follow.post("/unFollow", (req, res) => {
  const { uid, userID } = req.body;
  admin
    .database()
    .ref(`users/${uid}/following`)
    .once("value", (snap) => {
      admin
        .database()
        .ref(`users/${uid}/following`)
        .set(snap.val() - 1);
    });
  admin.database().ref(`following/${uid}/${userID}`).remove();
  admin.database().ref(`users/${userID}/followers`).once("value", (data) => {
    admin.database().ref(`users/${userID}/followers`).set(data.val() - 1);
    admin.database().ref(`followers/${userID}/${uid}`).remove();
  });
  res.send(true);
});

Follow.post("/follow", (req, res) => {
  const { uid, userID } = req.body;
  admin
    .database()
    .ref(`users/${uid}/following`)
    .once("value", (snap) => {
      admin
        .database()
        .ref(`users/${uid}/following`)
        .set(snap.val() + 1);
    });
  console.log(userID);
  const followingDb = admin.database().ref(`following/${uid}/${userID}`);
  const followersDb = admin.database().ref(`followers/${userID}/${uid}`)
  const UserDb = admin.database().ref(`users/${userID}/followers`);
  followingDb.set(true);
  followersDb.set(true);
  UserDb.once("value", (data) => {
    UserDb.set(data.val() + 1);
  });
  res.send(true);
});
module.exports = Follow;