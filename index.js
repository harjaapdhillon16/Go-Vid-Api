const express = require("express");
const App = express();
const cors = require("cors");
const bodyparser = require("body-parser");

const UsernameApi = require("./routes/username");
const UserCreate = require("./routes/UserCreate");
const ProfilePicture = require("./routes/ProfilePicture");
const VideoUpload = require("./routes/VideoUpload");
const HomeFeed = require("./routes/HomeFeed");
const LikedPost = require("./routes/LikedPosts");
const FavoritePost = require("./routes/Favorite");
const Follow = require("./routes/Follow");
const Followers = require("./routes/Followers");
const Notifications = require("./routes/Notifications");

App.use(bodyparser.urlencoded({ extended: false }));
App.use(express.json({ extended: false }));
App.use(bodyparser.json());
App.use(cors({ origin: true }));
App.use(UsernameApi);
App.use(UserCreate);
App.use(ProfilePicture);
App.use(VideoUpload);
App.use(HomeFeed);
App.use(LikedPost);
App.use(FavoritePost);
App.use(Follow);
App.use(Followers);
App.use(Notifications);
const port = process.env.PORT || 3001;

App.listen(port, () => {
  console.log("listening on port 3001");
});
