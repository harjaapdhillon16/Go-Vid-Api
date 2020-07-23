const express = require("express");
const VideoUpload = new express.Router();
const Busboy = require("busboy");
const admin = require("firebase-admin");
const UUID = require("uuid-v4");
const os = require("os"),
  path = require("path"),
  fs = require("fs");

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const { Storage } = require("@google-cloud/storage");
const { database } = require("firebase-admin");

const storage = new Storage({
  projectId: "govid-faa37",
  keyFilename: "./govid.json",
});
ffmpeg.setFfmpegPath(ffmpegPath);

const PostsDatabase = admin.database().ref("/posts");
const NoOfPostsDatabase = admin.database().ref("/postNo");
const UsersDatabase = admin.database().ref("/users");
const LatestDatabase = admin.database().ref("/latestPosts");

const Upload = async (pathToFile, userID, postNo, token, image) => {
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
  const Data2 = await storage.bucket("govid-faa37.appspot.com").upload(image, {
    destination: `posts/${userID}/${postNo}image`,
    uploadType: "media",
    metadata: {
      contentType: "image/png",
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  });
  return [
    "https://firebasestorage.googleapis.com/v0/b/" +
      "govid-faa37.appspot.com" +
      "/o/" +
      encodeURIComponent(Data[0].name) +
      "?alt=media&token=" +
      token,
    "https://firebasestorage.googleapis.com/v0/b/" +
      "govid-faa37.appspot.com" +
      "/o/" +
      encodeURIComponent(Data2[0].name) +
      "?alt=media&token=" +
      token,
  ];
};

VideoUpload.post("/videoUpload", (req, res) => {
  const uuid = UUID();

  const busboy = new Busboy({ headers: req.headers });
  let uid, saveTo, caption, image;
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
    const image = path.join(os.tmpdir(), uid + ".png");
    console.log(image);
    async function SetValues() {
      await NoOfPostsDatabase.child(`${uid}`).once("value", (snap) => {
        let PostNo = snap.val();
        if (PostNo === null) {
          PostNo = 0;
          NoOfPostsDatabase.child(`${uid}`).set(0);
        } else {
          PostNo += 1;
          NoOfPostsDatabase.child(`${uid}`).set(PostNo);
        }

        Upload(saveTo, uid, PostNo, uuid, image).then(async (url) => {
          await UsersDatabase.child(`${uid}`).once("value", (snapShot) => {
            const { username } = snapShot.val();
            PostsDatabase.child(`${uid}/${PostNo}__${uid}`).set({
              image: url[1],
              url: url[0],
              username,
              caption: caption,
              likes: 0,
              comments: 0,
              timeStamp: Date.now(),
              index: PostNo,
            });
            LatestDatabase.push({
              uid: uid,
              postNo: PostNo,
            });
            fs.unlink(saveTo, function (err) {
              if (err) {
                throw err;
              } else {
                console.log("Successfully deleted the file.");
              }
            });
            res.send(true);
          });
        });
      });
    }
    ffmpeg()
      .input(saveTo)
      .output(image)
      .withSize("135x240")
      .on("error", function (err) {
        SetValues();
      })
      .takeScreenshots({
        count: 1,
        timemarks: ["00:00:0.500"],
      });
  });
  return req.pipe(busboy);
});

module.exports = VideoUpload;
