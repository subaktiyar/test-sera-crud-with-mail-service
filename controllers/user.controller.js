const User = require("../models/user.model");
const { sendMessageToQueue } = require("../configs/rabbitmq");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.createUser = async (req, res) => {
  const { name, email, age } = req.body;
  try {
    const user = new User({ name, email, age });
    await user.save();

    const emailMessage = {
      to: email,
      subject: "Create User",
      text: "Your user has been created",
    };

    sendMessageToQueue(emailMessage);

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.getUsers = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    const skip = page * limit - limit;

    const findData = await User.find().skip(skip).limit(limit);
    const totalData = await User.countDocuments();

    return res.status(200).json({ data: findData, page, limit, total: totalData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, age } = req.body;
  try {
    const user = await User.findByIdAndUpdate(id, { name, email, age }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    const emailMessage = {
      to: user.email,
      subject: "Update User",
      text: "Your user has been updated",
    };

    sendMessageToQueue(emailMessage);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const emailMessage = {
      to: user.email,
      subject: "Delete User",
      text: "Your user has been deleted",
    };

    sendMessageToQueue(emailMessage);
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
