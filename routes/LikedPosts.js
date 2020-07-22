const express = require("express");
const LikedPost = new express.Router();
const admin = require("firebase-admin");

const LikedDatabase = admin.database().ref(`liked`);
const PostDatabase = admin.database().ref(`posts`);

LikedPost.post("/likedPost", async (req, res) => {
  const { uid, paginatedValue } = req.body;
  let LikedData = [];
  let PostsData = [];

  await LikedDatabase.child(`/${uid}`)
    .orderByChild(`index`)
    .startAt(paginatedValue - 6)
    .endAt(paginatedValue)
    .once("value", (snap) => {
      snap.forEach((data) => {
        const DataString = data.ref.key;
        const res = DataString.split("__");
        const jsonData = { postNo: res[0], userID: res[1] };
        LikedData.push(jsonData);
      });
    });
  LikedData.map((item, index) => {
    PostDatabase.child(`${item.userID}/${item.postNo}`).once(
      "value",
      (snap) => {
        PostsData.push(snap.val());
        if (LikedData.length - 1 === index) {
          res.send(PostsData);
        }
      }
    );
  });
});

module.exports = LikedPost;
