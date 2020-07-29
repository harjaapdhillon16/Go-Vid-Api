const express = require("express");
const Notifications = new express.Router();
const admin = require("firebase-admin");

const NotificationDatabase = admin.database().ref(`notifications`);

Notifications.post("/notifications", async (req, res) => {
  const { user, uid, notificationType, uri, username, image,postNo } = req.body;
  await NotificationDatabase.child(`${uid}/${postNo}`).set({
    notificationType: notificationType,
    uri: uri,
    username: username,
    image: image,
    uid:uid
  });
  res.send(true);
});
module.exports = Notifications;
