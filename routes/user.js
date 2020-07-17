const express = require("express");
const UsernameApi = new express.Router();
var admin = require("firebase-admin");
var serviceAccount = require("./govid.json");


const db = admin.database().ref("/username");

const usernameRetrieve = async () => {
  let Usernames;
  await db.once(
    "value",
    function (snapShot) {
      Usernames = snapShot.val();
    },
    function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    }
  );
  return Usernames;
};
UsernameApi.post("/usernameCheck", async (req, res) => {
  const username = await usernameRetrieve();
  console.log(username)
  let UsernameReceived = req.body.username;
  console.log(UsernameReceived)
  if (username.includes(UsernameReceived)) {
    res.send(false);
  } else {
    res.send(true);
  }
});
UsernameApi.post("/usernameAdd", async (req, res) => {
  let user = await usernameRetrieve();
  const username = user.username;
  let UsernameReceived = req.body.username;
  if (username.includes(UsernameReceived)) {
    res.send(false);
    return false;
  }
  console.log(username);
  username.push(UsernameReceived);

  db.set({ username });
  res.send(true);
});
module.exports = UsernameApi;
