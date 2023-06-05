const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 实例化数据模版
const TagSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  fontColor: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
});

module.exports = Tag = mongoose.model("tag", TagSchema);
