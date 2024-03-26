const catchAsync = require("../utils/catchAsync.js");
const User = require("../models/userModel.js");
const AppError = require("../utils/appError.js");
const factory = require("./handleFactory.js");
//
const filterObject = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.getAllUSer = factory.getAll(User);
exports.getUserById = factory.getOne(User);
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        "this route is not for password update. please use /updatePassword",
        400
      )
    );
  const filteredBody = filterObject(req.body, "name", "email");
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});
