const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 实例化数据模版 blog and tag
const BATSchema = new Schema({
  blogID: {
    type: String,
    required: true,
  },
  tagID: {
    type: String,
    required: true,
  },
});

module.exports = BAT = mongoose.model("bat", BATSchema);
