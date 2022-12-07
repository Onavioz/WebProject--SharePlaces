const express = require("express");
const { check } = require("express-validator");
const usersControllers = require("../controllers/users-controllers");
const fileUpload = require('../middleware/file-upload');
const router = express.Router();

//#region "Get Methods"
router.get("/", usersControllers.getUsers);
//#endregion


//#region  "POST Methods"
router.post(
  "/signup",
  fileUpload.single('image'),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllers.signUp
);
router.post("/login", usersControllers.logIn);
//#endregion

module.exports = router;
