const express = require("express");
const FavoritePost = new express.Router();
const admin = require("firebase-admin");

const FavoriteDatabase = admin.database().ref(`favorite`);
const PostDatabase = admin.database().ref(`posts`);

FavoritePost.post("/favoritePost", async (req, res) => {
  const { uid, paginatedValue } = req.body;
  let FavoriteData = [];
  let PostsData = [];

  await FavoriteDatabase.child(`/${uid}`)
    .orderByChild(`index`)
    .startAt(paginatedValue - 6)
    .endAt(paginatedValue)
    .once("value", (snap) => {
      snap.forEach((data) => {
        const DataString = data.ref.key;
        const res = DataString.split("__");
        const jsonData = { postNo: res[0], userID: res[1] };
        FavoriteData.push(jsonData);
      });
    });
  FavoriteData.map((item, index) => {
    PostDatabase.child(`${item.userID}/${item.postNo}__${item.userID}`).once(
      "value",
      (snap) => {
        PostsData.push(snap.val());
        if (FavoriteData.length - 1 === index) {
          res.send(PostsData);
        }
      }
    );
  });
});

module.exports = FavoritePost;
