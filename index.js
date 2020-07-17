const express = require("express");
const App = express();
const cors = require("cors");
const bodyparser = require("body-parser");

const UsernameApi = require("./routes/username");
const UserCreate = require("./routes/UserCreate");
const ProfilePicture = require("./routes/ProfilePicture");

App.use(bodyparser.urlencoded({ extended: false }));
App.use(bodyparser.json());
App.use(cors({ origin: true }));
App.use(UsernameApi);
App.use(UserCreate);
App.use(ProfilePicture);

App.listen(3001, () => {
  console.log("listening on port 3001");
});
