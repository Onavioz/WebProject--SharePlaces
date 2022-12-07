const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const Users = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await Users.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong,could not find any users. ",
      500
    );
    return next(error);
  }

  if (!users) {
    const error = new HttpError(
      "Could not find a user for the provided id.",
      404
    );
    return next(error);
  }
  res.json({
    users: users.map((user) => user.toObject({ getters: true })),
  });
};

const logIn = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await Users.findOne({ email: email.toLowerCase() });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      "superSecret_OnAndKfir",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Logging in failed, token not valid.", 500);
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token
  });
};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(`Invalid inputs: ${errors}, please check your data.`, 422)
    );
  }

  const { name, email, password } = req.body;
  let existingUser;

  try {
    existingUser = await Users.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new HttpError(
        `Could not create user, The email: '${email}' is already exists.`,
        422
      );
      return next(error);
    }
  } catch (err) {
    const error = new HttpError(
      "Something went wrong,could not create user. ",
      500
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create user, please try again.",
      500
    );
    return next(error);
  }

  const createdUser = new Users({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "superSecret_OnAndKfir",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Signing up failed, token not valid.", 500);
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

exports.getUsers = getUsers;
exports.logIn = logIn;
exports.signUp = signUp;
