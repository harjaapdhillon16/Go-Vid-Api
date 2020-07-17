const express = require("express");
const UserCreate = new express.Router();
const admin = require("firebase-admin");

const db = admin.database().ref("/users");

UserCreate.post("/userCreate", async (req, res) => {
  const { email, uid, name,username } = req.body;
  await db.child(`/${uid}`).set({
    name: name,
    email: email,
    uid: uid,
    username:username,
    followers:0,
    following:0,
    likes:0,
    bio:''
  });
  res.send(true);
});
module.exports= UserCreate;
