const {
  objIDToStr,
  handleError,
  setListPage,
  updateIncOrSub,
  getCollectionTotal,
} = require("./../utils");
const Blog = require("../models/Blog");
const BAT = require("../models/BlogAndTag");
const Tag = require("../models/Tag");

module.exports = (router) => {
  /**
   * @route POST /api/blog/create
   * @desc Gsxany 创建博客
   * @access ~public
   * @params Blog.Schema
   */
  router.post("/blog/create", async (ctx, next) => {
    const blogData = ctx.request.body;
    const newBlog = new Blog(blogData);
    await newBlog
      .save()
      .then(async (blog) => {
        const { tagID } = blogData;
        const { _id: blogID } = blog;
        const newBAT = new BAT({ blogID, tagID });
        if (tagID) await updateIncOrSub(Tag, tagID, { count: 1 });
        await newBAT.save();

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
   * @route GET /api/blog/detail
   * @desc Gsxany 博客详情
   * @access ~public
   * @params id-blogID
   */
  router.get("/blog/detail", async (ctx, next) => {
    const { id } = ctx.query;
    try {
      const _blogItem = await Blog.findOne({ _id: id });
      const _tagInfo = await Tag.findOne({
        _id: _blogItem.tagID,
      });
      const blogItem = _blogItem.toObject();
      const tagInfo = _tagInfo.toObject();

      ctx.status = 200;
      ctx.body = {
        result: "success",
        data: {
          ...blogItem,
          tagInfo,
        },
      };
    } catch (error) {
      handleError(error);
    }
  });

  /**
   * @route PUT /api/blog/update
   * @desc Gsxany 更新 对应博客
   * @access ~public
   * @params id-blogID && Blog.Schema
   */
  router.put("/blog/update", async (ctx, next) => {
    const updateTime = +new Date();
    const blogData = ctx.request.body;

    const id = blogData.id;
    Reflect.deleteProperty(blogData, "id");
    blogData.updateDate = updateTime;
    await Blog.updateOne(
      { _id: id },
      {
        $set: blogData,
      }
    )
      .then(async (blog) => {
        const { tagID } = blogData; // 即将要更新的 tagID
        const { tagID: BATItemTagID = "" } = await BAT.findOne({ blogID: id }); // 旧 tagID
        if (BATItemTagID !== tagID) {
          await BAT.updateOne({ blogID: id }, { $set: { blogID: id, tagID } });
          await updateIncOrSub(Tag, tagID, { count: 1 });
          await updateIncOrSub(Tag, BATItemTagID, { count: -1 });
        }

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
   * @route DELETE /api/blog/remove
   * @desc Gsxany 删除对应博客
   * @access ~public
   * @params id-blogID
   */
  router.delete("/blog/remove", async (ctx, next) => {
    const { id } = ctx.request.body;
    try {
      await Blog.findByIdAndRemove({ _id: id });
      const { tagID } = await BAT.findOne({ blogID: id });
      await BAT.deleteOne({ blogID: id });
      if (tagID) await updateIncOrSub(Tag, tagID, { count: -1 });
      ctx.status = 200;
      ctx.body = {
        result: "success",
        msg: "删除成功",
      };
    } catch (error) {
      handleError(error);
    }
  });

  /**
   * @route GET /api/blog/list
   * @desc Gsxany 博客列表 - 查询对应
   * @access ~public
   * @params search-blog标题
   */
  router.get("/blog/list", async (ctx, next) => {
    const { search = "", pageNo = 1, pageSize } = ctx.query;
    const searchReg = new RegExp(search, "i");
    const queryParams = { title: { $regex: searchReg } };

    try {
      const total = await getCollectionTotal(Blog, queryParams);
      const blogList = await setListPage(Blog, queryParams, {
        pageNo,
        pageSize,
        orderBy: {
          isTop: -1,
          updateDate: -1,
        },
      });

      // const tagMap = new Map();
      // const list = await Promise.all(blogList.map(async (_blog) => {
      //   const _blogItem = _blog.toObject();
      //   const tagID = objIDToStr(_blogItem.tagID);
      //   if (tagMap.has(tagID)) {
      //     _blogItem.tagInfo = tagMap.get(tagID);
      //   } else {
      //     const tagInfo = await Tag.findOne({ _id: tagID });
      //     tagMap.set(tagID, tagInfo);
      //     _blogItem.tagInfo = tagInfo;
      //   }
      //   return _blogItem;
      // }));
      // ----------------------------------------------------------------------
      const tagIdList = new Set(blogList.map((_blog) => _blog.tagID));
      const tagList = await Tag.find({
        _id: {
          $in: [...tagIdList],
        },
      });
      const list = blogList.map((_blog) => {
        const tagInfo = tagList.find(
          ({ _id }) => objIDToStr(_id) === objIDToStr(_blog.tagID)
        );
        const _blogItem = _blog.toObject();
        _blogItem.tagInfo = tagInfo;
        delete _blogItem.body;
        return _blogItem;
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
