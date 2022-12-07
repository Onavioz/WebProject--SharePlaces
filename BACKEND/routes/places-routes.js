const express = require("express");
const { check } = require("express-validator");
const placesControllers = require("../controllers/places-controllers");
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');
const router = express.Router();

//#region "Get Methods"
router.get("/:pid", placesControllers.getPlaceById);
router.get("/user/:uid", placesControllers.getPlacesByUserId);
//#endregion

router.use(checkAuth);

//#region  "POST Methods"
router.post(
  "/",
  fileUpload.single('image'),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesControllers.createPlace
);
//#endregion

//#region  "PATCH Methods"
router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesControllers.updatePlaceById
);
//#endregion

//#region  "DELETE Methods"
router.delete("/:pid", placesControllers.deletePlaceById);
//#endregion

module.exports = router;
