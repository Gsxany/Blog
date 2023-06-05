const { handleError, setListPage, getCollectionTotal } = require("./../utils");
const Blog = require("../models/Blog");
const BAT = require("../models/BlogAndTag");
const Tag = require("../models/Tag");

module.exports = (router) => {
  /**
   * @route POST /api/tag/create
   * @desc Gsxany 创建标签
   * @access ~public
   * @params Tag.Schema
   */
  router.post("/tag/create", async (ctx, next) => {
    const tagData = ctx.request.body;
    const newTag = new Tag(tagData);
    await newTag
      .save()
      .then((_) => {
        ctx.status = 200;
        ctx.body = {
          result: "success",
          msg: "创建成功",
        };
      })
      .catch((err) => {
        handleError(err);
      });
  });

  /**
   * @route GET /api/tag/detail
   * @desc Gsxany 标签详情
   * @access ~public
   * @params id-tagID
   */
  router.get("/tag/detail", async (ctx, next) => {
    const { id } = ctx.query;
    try {
      const data = await Tag.findOne({ _id: id });
      ctx.status = 200;
      ctx.body = {
        result: "success",
        data,
      };
    } catch (error) {
      handleError(error);
    }
  });

  /**
   * @route DELETE /api/tag/remove
   * @desc Gsxany 删除对应标签 (如果标签对应下有文章不可删除)
   * @access ~public
   * @params id-blogID
   */
  router.delete("/tag/remove", async (ctx, next) => {
    const { id } = ctx.request.body;
    try {
      const blogList = await BAT.find({ tagID: id });
      if (!blogList.length) {
        await Tag.findByIdAndRemove({ _id: id });
        ctx.status = 200;
        ctx.body = {
          result: "success",
          msg: "删除成功",
        };
      } else {
        ctx.status = 400;
        ctx.body = {
          msg: "该标签下面还有文章，不可删除。",
        };
      }
    } catch (error) {
      handleError(error);
    }
  });

  /**
   * @route PUT /api/tag/update
   * @desc Gsxany 更新 对应标签
   * @access ~public
   * @params id-tagID && Tag.Schema
   */
  router.put("/tag/update", async (ctx, next) => {
    const tagData = ctx.request.body;

    const id = tagData.id;
    Reflect.deleteProperty(tagData, "id");
    await Tag.updateOne({ _id: id }, { $set: tagData })
      .then(async (tag) => {
        ctx.status = 200;
        ctx.body = {
          result: "success",
          msg: "更新成功",
        };
      })
      .catch((err) => {
        handleError(err);
      });
  });

  /**
   * @route GET /api/tag/list
   * @desc Gsxany 标签列表 - 查询对应
   * @access ~public
   * @params search-tagName
   */
  router.get("/tag/list", async (ctx, next) => {
    const { search = "", pageNo = 1, pageSize, isShowAll = false } = ctx.query;
    const searchReg = new RegExp(search, "i");
    const queryParams = { name: { $regex: searchReg } };

    try {
      const total = await getCollectionTotal(Tag, queryParams);
      const taglist = await setListPage(Tag, queryParams, { pageNo, pageSize });
      const blogTotal = await getCollectionTotal(BAT, {});

      const list = isShowAll
        ? [
            {
              _id: "showAll",
              color: "#f50",
              fontColor: "#fff",
              count: blogTotal,
              name: "Show All",
            },
            ...taglist,
          ]
        : taglist;

      ctx.status = 200;
      ctx.body = {
        result: "success",
        list: list,
        total,
      };
    } catch (error) {
      handleError(error);
    }
  });

  /**
   * @route GET /api/tag/blog-list
   * @desc Gsxany 查询标签对应的博客列表
   * @access ~public
   * @params search-tagID
   */
  router.get("/tag/blog-list", async (ctx, next) => {
    const { tagID = "", pageNo = 1, pageSize } = ctx.query;
    const queryParams = tagID ? { tagID } : {};

    try {
      const total = await getCollectionTotal(BAT, queryParams);
      const blogAcclist = await setListPage(BAT, queryParams, {
        pageNo,
        pageSize,
      });
      blogIdlist = blogAcclist.map((_blog) => _blog.blogID);
      const blogList = await Blog.find({
        _id: {
          $in: [...blogIdlist],
        },
      }).sort({
        isTop: -1,
        updateDate: -1,
      });
      const list = blogList.map((_blog) => {
        _blog = _blog.toObject();
        delete _blog.body;
        return _blog;
      });

      ctx.status = 200;
      ctx.body = {
        result: "success",
        list,
        total,
      };
    } catch (error) {
      handleError(error);
    }
  });
};
