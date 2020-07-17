const express = require("express");
const ProfilePicture = new express.Router();
const admin = require("firebase-admin");
const path = require("path"),
  os = require("os"),
  fs = require("fs");
const Busboy = require("busboy");
const UUID = require("uuid-v4");

const { Storage } = require("@google-cloud/storage");
const storage = new Storage({
  projectId: "govid-faa37",
  keyFilename: "./govid.json",
});
const db = admin.database().ref("/users");

const Upload = async (pathToFile, uniquePath, token) => {
  const Data = await storage
    .bucket("govid-faa37.appspot.com")
    .upload(pathToFile, {
      destination: `profile/${uniquePath}`,
      uploadType: "media",
      metadata: {
        contentType: "image/jpeg",
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

ProfilePicture.post("/profilePicture", (req, res) => {
  const busboy = new Busboy({ headers: req.headers });
  let uid, saveTo;
  let uuid = UUID();

  busboy.on("file", function (fieldName, file, filename, encoding, mimetype) {
    const pathToImage = filename + "." + "jpeg";
    uid = filename;
    saveTo = path.join(os.tmpDir(), path.basename(pathToImage));
    file.pipe(fs.createWriteStream(saveTo));
  });
  busboy.on("finish", async () => {
    const URL = await Upload(saveTo, uid, uuid);
    db.child(`${uid}/uri`).set(URL);
    res.send(true);
  });
  return req.pipe(busboy);
});

module.exports = ProfilePicture;
