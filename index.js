const express = require("express");
const App = express();
const cors = require("cors");
const bodyparser = require("body-parser");

const UsernameApi = require("./routes/username");
const UserCreate = require("./routes/UserCreate");
const ProfilePicture = require("./routes/ProfilePicture");
const VideoUpload = require("./routes/VideoUpload");
const HomeFeed = require("./routes/HomeFeed");

App.use(bodyparser.urlencoded({ extended: false }));
App.use(express.json({ extended: false }));
App.use(bodyparser.json());
App.use(cors({ origin: true }));
App.use(UsernameApi);
App.use(UserCreate);
App.use(ProfilePicture);
App.use(VideoUpload);
App.use(HomeFeed);

App.listen(3001, () => {
  console.log("listening on port 3001");
});
