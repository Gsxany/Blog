const mongoose = require("mongoose");

const checkLen = (val) => {
  if (typeof val !== "object") {
    throw new TypeError(`不支持检测 object 以外的类型`);
  }
  if (!val) return 0;
  return Object.keys(val).length;
};

const handleError = (err) => {
  if (typeof err === "string") throw new Error(err);
  throw new Error(JSON.stringify(err));
};

const getCollectionTotal = (model, condition) => {
  return new Promise((resolve, reject) => {
    model.countDocuments(condition, (err, count) => {
      if (err) {
        ctx.status = 400;
        ctx.body.msg = JSON.stringify(err);
        reject(err);
      } else {
        resolve(count);
      }
    });
  });
};

const setListPage = (model, ...condition) => {
  const [queryParams, { pageNo = 0, pageSize = 0, orderBy = {} }] = condition;
  const pageNumber = pageNo - 1 <= 0 ? 0 : pageNo - 1;
  const limitNumber = pageSize <= 0 ? 0 : +pageSize;

  return new Promise(async (resolve, reject) => {
    const list = await model
      .find(queryParams)
      .skip(pageNumber * limitNumber)
      .limit(limitNumber)
      .sort(orderBy)
      .exec();
    resolve(list);
  });
};

const objIDToStr = (id) => {
  return mongoose.Types.ObjectId(id).toString();
};

const strToObjID = (id) => {
  return mongoose.Types.ObjectId(id);
};

const updateIncOrSub = async (model, _id, fieldRule = {}) => {
  await model.findByIdAndUpdate(
    { _id },
    {
      $inc: fieldRule,
    },
    {
      new: true,
      upsert: true,
    }
  );
  return true;
};

module.exports = {
  checkLen,
  objIDToStr,
  strToObjID,
  setListPage,
  handleError,
  updateIncOrSub,
  getCollectionTotal,
};
