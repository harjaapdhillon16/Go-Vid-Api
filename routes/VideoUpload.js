const express = require("express");
const VideoUpload = new express.Router();
const Busboy = require("busboy");
const admin = require("firebase-admin");
const UUID = require("uuid-v4");
const os = require("os"),
  path = require("path"),
  fs = require("fs");
const { Storage } = require("@google-cloud/storage");
const { database } = require("firebase-admin");
const storage = new Storage({
  projectId: "govid-faa37",
  keyFilename: "./govid.json",
});

const db = admin.database().ref("/posts");
const db2 = admin.database().ref("/postNo");
const db3 = admin.database().ref("/users");
const db4 = admin.database().ref("/latestPosts");

const Upload = async (pathToFile, userID, postNo, token) => {
  const Data = await storage
    .bucket("govid-faa37.appspot.com")
    .upload(pathToFile, {
      destination: `posts/${userID}/${postNo}`,
      uploadType: "media",
      metadata: {
        contentType: "video/mp4",
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

  return (
    "https://firebasestorage.googleapis.com/v0/b/" +
    "govid-faa37.appspot.com" +
    "/o/" +
    encodeURIComponent(Data[0].name) +
    "?alt=media&token=" +
    token
  );
};

VideoUpload.post("/videoUpload", (req, res) => {
  const uuid = UUID();

  const busboy = new Busboy({ headers: req.headers });
  let uid, saveTo, caption;
  console.log("aa");

  busboy.on("file", (fieldName, file, filename, encoding, mimetype) => {
    const pathToVideo = filename + "." + "mp4";
    uid = filename;
    saveTo = path.join(os.tmpDir(), path.basename(pathToVideo));
    file.pipe(fs.createWriteStream(saveTo));
  });
  busboy.on("field", (fieldName, val) => {
    console.log(val);
    caption = val;
  });

  busboy.on("finish", async () => {
    await db2.child(`${uid}`).once("value", (snap) => {
      let PostNo = snap.val();
      if (PostNo === null) {
        PostNo = 0;
        db2.child(`${uid}`).set(0);
      } else {
        PostNo += 1;
        db2.child(`${uid}`).set(PostNo);
      }
      Upload(saveTo, uid, PostNo, uuid).then(async (url) => {
        await db3.child(`${uid}`).once("value", (snapShot) => {
          const {  username } = snapShot.val();
          db.child(`${uid}/${PostNo}`).set({
            url: url,
            username,
            caption: caption,
            likes: 0,
            comments: 0,
          });
          db4.push({
            uid: uid,
            postNo: PostNo,
          });
          res.send(true);
        });
      });
    });
  });
  return req.pipe(busboy);
});

module.exports = VideoUpload;
