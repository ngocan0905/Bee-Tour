const { promisify } = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel.js");
const AppError = require("../utils/appError.js");
const sendMail = require("../utils/email.js");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  user.password = undefined;
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV !== "developer") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  sendToken(newUser, 200, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("please provide email and password", 400));
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("incorrect email or password", 401));
  sendToken(user, 201, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1/ lấy token và kiểm tra
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError("you are not logged in! please log in to get access", 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError("the user belonging to token does no longer exist")
    );
  if (currentUser.changedPasswordAffter(decoded.iat)) {
    return next(
      new AppError("user recently changed password! please log in again", 401)
    );
  }
  req.user = currentUser;
  next();
  // 2/
});
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError("you do not have permission to perform this action", 403)
      );
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError("there is no user with email address", 404));
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `forgot your password? submit a PATCH request with you new password and passwordConfirm to: ${resetURL}.\nif you didn't forget your password, please ignore this email!`;
  try {
    await sendMail({
      email: user.email,
      subject: `your password  reset token (valid for 10min)`,
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token send to email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("there was an error sending the email. try again later", 500)
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("token is invalid or has exprired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  sendToken(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError("your current password is wrong", 401));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  sendToken(user, 200, res);
});
