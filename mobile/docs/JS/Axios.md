# 「 `JS` 」 - `Axios` 源码解析

> **关于`axios`源码的解析，探讨了它的调用方式、核心函数`request`和`dispatchRequest`的实现原理，以及`axios`中一些内置方法的学习。**

## `Axios`调用

作为函数调用：`axios(config)、axios(url[, config])、axios(url)`

作为对象调用：`axios.request(config) / get / delete / head / post / put / options ...`

- **「 `axios`为什么既可以作为对象，又可以作为函数本身来进行调用。 」**

  **`axios`其实就是`bind`函数执行后返回的`wrap`函数。**

  **它会拷贝`axios`的原型属性和方法以及实例属性和方法，挂载到`instance`上，也就是`wrap`。**

  因为函数也是对象，所以就可以实现 👆 上面例子中展示的调用方式。

- `axios`函数执行的话其实就是执行`Axios.prototype.request`。并且执行时的`this`指向`axios`实例。

---

**`Axios`库的核心就是 「 `Axios-Class`、拦截器实现 以及 `Axios_request`方法的实现 」。**

- **「 `Axios - Config` 」**

  1. **`Config`肯定是和默认`config`进行合并后的结果。**

  2. `axios`调用/`get/post`等的别名调用，其实就是执行`request`方法。参数也会传递给`request`去执行。

  3. 然后会对`Config`进行策略合并，然后生成最终的`Config`。

     **「 `mergeConfig` 」就是合并`Config`的不同实现策略**

     [ 基础合并 / 谁有用谁 / 后者优先 / 后者没有的话用前者 / 如果是对象的话深度递归合并 ] 等策略。

     **自己和自己合并的目的就是去重。**

---

## `Axios Class`

- `Axios`请求方法封装

  `axios.request(config) / get / delete / head / post / put / options ...`

  **类似 👆 对象的调用方式，其实最终都执行的是`Axios.prototype.request`函数。**

  > `delete / get / head / options` 和 `post / put / patch`在`axios`调用上的区别就是后者需要传递`data`。

  ```js
  // Provide aliases for supported request methods - 为支持的请求方法提供别名
  /**
   * 往 Axios 原型对象上 挂载对象的 method 方法函数。
   */
  utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    /**
     * e.g Axios.prototype.delete = function(url, config) { ... }。
     * method 方法实际执行的时候，就是执行 this.request 函数。 就是上面的 Axios.prototype.request 函数。
     *
     * this.request 这里的this指向就指向了 Axios的实例。 [ 谁调用 this 就指向 谁 ]。
     *
     * mergeConfig 就是合并配置。
     * 将 config 和 后面定义的 配置对象进行合并。
     */
    Axios.prototype[method] = function(url, config) {
      return this.request(mergeConfig(config || {}, {
        method: method,
        url: url,
        data: (config || {}).data
      }));
    };
  });

  /**
   * post / put / patch 单独拿出来的原因是， 这三个方法 是需要接受传递 data 的。
   *
   * 具体实现和上面一样，有区别的是 data 是需要进行参数传递的。🍓🍓🍓
   */
  ...
  Axios.prototype[method] = function(url, data, config) {
    // ...
    {
      method: method,
      url: url,
      data: data
    }
  }
  ...

  ```

- `Axios`类 / 构造函数

  ```js
  /**
   * Axios类
   * 包含两个 实例属性 - defaults & interceptors
   * 有两个原型方法 - request & getUri。
   * 对 7个 不同请求方法进行了 配置合并 的操作。 并且都添加到了它的原型方法上。 🍓🍓🍓
   *  一共 9个 原型方法。
   */
  module.exports = Axios;
  ```

## `Axios_request`🍓🍓

1. **判断参数。**

   传递了`url`则合并进`config`中，如果没有传递，则默认第一个就是`config`。

2. **`Config`合并。**

   对传递进来的`config`和默认`config`进行合并。

   处理请求方法，最后`get`进行兜底。

3. 🍓🍓🍓 - **「 请求和响应的处理 」**

   这里实现：保证 **[ 请求拦截 -> 请求 -> 响应拦截 ]** 的顺序。✨~

   注意学习： **拦截器函数在源码中的设置，怎么更好的传递至让用户配置的。**

   > 请求、响应拦截器中，用户自定义的函数，就是下面的 `interceptor.fulfilled, interceptor.rejected`。
   >
   > **结合 `InterceptorManager` 类中`use`方法添加进去`handlers` 数组中的内容，来进行传递。**

   **为了保证顺序，必将重要的两个步骤。**

   1. `var chain = [dispatchRequest, undefined];`

      `Array.prototype.unshift.apply(chain, requestInterceptorChain);`

      `chain = chain.concat(responseInterceptorChain);`

      **🍓 - 为了保证顺序，`undefined`占位，以及 `unshift`添加请求拦截，`concat`添加响应拦截。**

      **🍓🍓🍓 因为 `promise`中的`catch`如果不对其进行捕获，是会继续向下传递的。这样就有了 `undefined`占位的`code`。**

   2. `promise = Promise.resolve(config);`

      `promise = promise.then(chain.shift(), chain.shift());`

      **🍓 - 不断重新赋值`promise`，利用 `promise`的链式调用。**

   ```js
   // 以下是 request 精简后的操作。

   /**
    * 过滤掉跳过的拦截器 😯 配置 runWhen，则可以跳过请求拦截。
    * 拦截请求链
    */
   var requestInterceptorChain = [];
   // requestInterceptorChain 链中添加 请求拦截的成功和失败的 Promise
   this.interceptors.request.forEach(function unshiftRequestInterceptors(
     interceptor
   ) {
     if (
       typeof interceptor.runWhen === "function" &&
       interceptor.runWhen(config) === false
     ) {
       return;
     }
     // 这里猜测就是在请求拦截前，进行 判断 是否为 同步操作的。
     synchronousRequestInterceptors =
       synchronousRequestInterceptors && interceptor.synchronous;

     requestInterceptorChain.unshift(
       interceptor.fulfilled,
       interceptor.rejected
     );
   });

   var responseInterceptorChain = []; // 响应拦截链
   // responseInterceptorChain 链中添加 响应拦截的成功和失败的 Promise
   this.interceptors.response.forEach(function pushResponseInterceptors(
     interceptor
   ) {
     responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
   });

   var promise;

   if (!synchronousRequestInterceptors) {
     // 如果不是同步请求
     /**
      * dispatchRequest 方法 - 是发起请求的真正方法。 🍓
      * undefined 是为了占位 来进行 请求和响应拦截的成对输出。 🍓🍓
      *
      * Chain => 链条 - 数组存储执行链
      */
     var chain = [dispatchRequest, undefined];

     /**
      * 这里头部添加 请求拦截, 然后尾部添加 响应拦截 🍓🍓🍓
      *
      * chain = [
      *  // 请求拦截数组中的函数
      *  requestInterceptorChain, 【这里是请求成功、请求失败 两个promise】
      *  // 发起请求 以及 undefined占位
      *  dispatchRequest, undefined
      *  // 响应拦截数组中的函数
      *  responseInterceptorChain 【这里是响应成功、响应失败 两个promise】
      * ]
      */
     Array.prototype.unshift.apply(chain, requestInterceptorChain);
     chain = chain.concat(responseInterceptorChain);

     /**
      * 创建一个成功状态的 Promise 实例，返回值为config（ 已经合并后的配置对象 ）。
      *
      * 这里 config 会被作为 成功状态的返回值， 来对 Promise链接调用传递。
      * 首先会被 👇 chain.shift() 使用。也就是 请求拦截器使用。 😯
      * 所以在 请求拦截器 中，是需要将 `config` 返回的。 🍓🍓🍓
      * 用于 dispatchRequest 接收处理。
      */
     promise = Promise.resolve(config);

     /**
      * 如果 chain 有值。
      * 1. 将 config 传递给 请求拦截器， 即 成功、失败 的一组 shift() 出来。
      * 2. 然后这里就可以做到请求阻塞，可以向 config配置 中添加参数。
      * 3. 依次成对执行，并用新的 promise 代替旧的 promise 🍓
      *		最后返回新的 promise 覆盖 `promise = ...` 这样Promise也会按照顺序一步一步执行的 😯🍓🍓🍓~
      *
      * while 循环，会不断执行，直至执行完 响应函数后， 排空 chain 数组为止。
      *
      * 这里 promise 的状态是根据请求完成后 并且 请求 / 响应 拦截函数返回 三种情况返回的。
      */
     while (chain.length) {
       promise = promise.then(chain.shift(), chain.shift()); // 🍓 比较重要的代码
     }

     /**
      * - 上面的所有操作以及`promise = ...` 都是同步执行。
      * - 所以是一次性的将 promise 进行 链式排开 定义的。promise 其实就是 👇
      *   	 promise.then(请求成功/失败).then(请求处理函数,undefined).then(响应成功/失败)
      *
      * - 🍓 这里的 promise 依然是 等待决议的状态。等请求返回并处理完成后，promise才会改变状态。
      * 这个 promise 最终返回的就是 响应拦截后的 response 数据。 🤔
      */
     return promise;
   }
   ```

## `Axios`拦截器

我们在项目中定义拦截器的写法：`axios.interceptors.request.use(fulfilled, rejected, options)`。

> 然后里面`fulfilled`，就是我们一般在成功的回调函数中 定义的处理事件。
>
> `rejected`就是失败的处理事件。`options`是我们可以在其中配置一些其他参数。

在`Promise.then`的链式回调中，我们 **必须在拦截器的回调函数中返回一个`config`。**

- 因为在请求拦截器中我们可以对 `config` 的参数进行修改。

- 然后再`dispatchRequest`发起真正的请求 - 请求拦截器的作用 😯🚗

- `dispatchRequest`请求后，返回一个`response`。

- 之后响应拦截器可以拿到`response`对其可以进行修改 - 响应拦截器的作用 😯🚗

```js
// 拦截器 use 方法
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  /**
   * use就是我们请求、响应拦截函数定义的，最终会添加到 handlers 数组中。
   *  -- 在请求拦截器中 fulfilled rejected 就是我们去定义的。 🍓 - 后面还有 options 可以配置
   *
   * handlers 数组中其实就是一个一个对象，每个对象都有一个成功 和 失败的回调属性。
   */
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null,
  });

  /**
   * 这里返回值可能只是返回数组的栈顶元素。
   */
  return this.handlers.length - 1;
};
```

**「 `use`方法是往`this.handlers`添加方法。最终调用的时候会在`request`中调用`InterceptorManager.forEach`。 」**

```js
InterceptorManager.prototype.forEach = function forEach(fn) {
  /**
   * 这里针对 handlers 中的每一项，判断不为空，
   * 然后执行 传递进来的fn 函数并且传递 它每一项作为参数。 🍓
   */
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};
```

## `Axios - dispatchRequest`

**「 真正发起请求的方法。`dispatchRequest` 」**

- 拿到的是`config`对象，最终返回的是`response`结果。

  > 对 请求和响应 拦截器 进行一个 对接以及发起请求 的作用。 😯 高级 ✨~

```js
function dispatchRequest(config) {
  // 保证了 config.headers 属性 必须有值。如果没有就是一个 {}
  config.headers = config.headers || {};

  /**
   * 对 请求数据config.data 进行 [ 转换/修改 ]。
   * 将下面 config.data / config.headers / config.transformRequest 的数据进行处理后，
   *  - 然后在赋值给 config.data。
   *  - config.transformRequest 其实是一个 函数数组 / 单个函数。 可以查看 default 文件中的定义。
   *   -- transformRequest函数定义： 将 data/header 传递参数将其传入它的 子项 中。
   * 然后 return回去 赋值给 config.data。
   *
   * 😄 这里注意 .call(config, ...) 传递config 是为了保证this指向
   */
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  /**
   * 将 config.headers 里面的属性层级的展平 🍓 - 🤔 可以借鉴操作
   *
   * 将 common / [ config.method ] / headers 里面的值都 copy 出来
   * 然后 进行平级接收。
   * 如果不主动配置，可以查看它的 `default`默认配置中的配置。
   */
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  /**
   * 遍历 7个请求方法， 然后删除对应在 header 属性的配置信息。
   * 因为已经展平了，对应信息已经放到了 headers 中。
   */
  utils.forEach(
    ["delete", "get", "head", "post", "put", "patch", "common"],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  /**
   * 👆 上面是一些 规范化 和 合并操作。
   * 🍓 adapter 适配器函数 比较关键。
   * 查看默认的 adapter， 因为 平常使用的时候，一般不去配置 adapter 方法。
   */
  var adapter = config.adapter || defaults.adapter;
}
```

### `adapter 🍓~`

1. **`defaults.adapter` 👇**

   ```js
   /**
    * 获取默认适配器  有两种情况
   	 { 通常就是在浏览器环境下 使用 axios  }
    *
    * 🍓 XMLHttpRequest 存在，说明在 浏览器环境下。
    *  就引用 ./adapters/xhr 文件，导出给 adapter
    *
    * 🍓 process !== 'undefined' ... 说明在 Node环境下。
    *  就引用 ./adapters/http 文件，导出给 adapter
    */
   function getDefaultAdapter() {
     var adapter;
     if (typeof XMLHttpRequest !== "undefined") {
       // 浏览器环境
       // For browsers use XHR adapter
       adapter = require("./adapters/xhr");
     } else if (
       typeof process !== "undefined" &&
       Object.prototype.toString.call(process) === "[object process]"
     ) {
       // Node 环境
       // For node use HTTP adapter
       adapter = require("./adapters/http");
     }
     return adapter;
   }
   ```

2. **`adapters/xhr _ xhrAdapter`**

   具体代码在下面展示 👇[`xhrAdapter`](./###`[ xhrAdapter ]`)

   **返回一个`Promise`实例，其实就是对浏览器的`XMLHttpRequest`发送请求的一个封装。 🍓**

   对错误响应进行`onError`处理，注意：`file:`协议大多数浏览器的`request.status`会返回`0`，即使请求成功。

   然后请求完成后，会对响应对象进行包装之后返回给 响应拦截器。😯

   **注意取消请求的方法定义。`onCanceled - rquest.abort()`🍓🍓🍓**

3. **`adapter` 方法调用**

   ```js
   // 查看默认的 adapter 方法，因为一般不去手动配置该信息。
   var adapter = config.adapter || defaults.adapter;

   /**
    * adapter 执行后返回一个新的 promise 实例
    * （ 就是 xhr_xhrAdapter 方法 return 的 new Promise ）✨~
    */
   return adapter(config).then(
     function onAdapterResolution(response) {
       // 成功回调
       /**
        * 如果异步执行成功了。 接收到 请求后的 response， 然后对其进行处理。
        * 这里就是对 response 做最后一层转换了。 😯
        *
        * 合并转换针对 transformResponse函数。 默认就是一个 转换响应的函数
        * 如果 data 是字符串的话，试着将其 转换为 JSON对象。
        * 在这个过程中，会捕获一下错误。- 🍓
        */
       throwIfCancellationRequested(config);

       // Transform response data - 转换响应数据
       response.data = transformData.call(
         config,
         response.data,
         response.headers,
         config.transformResponse
       );

       // 然后接着往下传递，将 response 传递出去。
       return response;
     },
     function onAdapterRejection(reason) {
       // 失败回调
       // 如果异步执行失败了的错误处理。
       if (!isCancel(reason)) {
         throwIfCancellationRequested(config);

         // Transform response data
         if (reason && reason.response) {
           reason.response.data = transformData.call(
             config,
             reason.response.data,
             reason.response.headers,
             config.transformResponse
           );
         }
       }

       return Promise.reject(reason);
     }
   );
   ```

## `Axios.Cancel` 🍓

- **`XMLHttpRequest.abort()`示例**

  如果一个请求已被发出，**`XMLHttpRequest.abort()`** 方法用于终止该请求。

  它的 [`readyState`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/readyState) 将被置为 `XMLHttpRequest.UNSENT(0)`，并且请求的 [`status`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/status) 置为`0`。

  ```js
  var xhr = new XMLHttpRequest(),
    method = "GET",
    url = "https://developer.mozilla.org/";
  xhr.open(method, url, true);

  xhr.send();

  if (OH_NOES_WE_NEED_TO_CANCEL_RIGHT_NOW_OR_ELSE) {
    // 我们需要马上取消，否则
    xhr.abort();
  }
  ```

### `CancelToken`

- **`CancelToken`类如此封装的主要目的就是为了能够分离`promise`和`resolve`方法。 🍓**

- **让用户可以自己调用`resolve`方法，一旦`resolve`后，就会触发`promise`的`then`方法 🍓**

  **接着就会执行取消`axios`内部的取消请求的操作。**

```js
/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 * “CancelToken” 是可用于请求取消操作的对象。
 * @class
 * @param {Function} executor The executor function.
 *
 * executor 是一个函数，用于执行取消操作的函数
 */
function CancelToken(executor) {
  // 传递进来的不是一个函数直接抛错跳出 😓
  if (typeof executor !== "function") {
    throw new TypeError("executor must be a function.");
  }

  var resolvePromise; // 这个变量就是Promise权限外放，可以控制Promise状态。

  /**
   * 将 Promise 的 resolve 方法控制权给了 resolvePromise。
   * 什么时候调用 resolvePromise，什么时候改变 Promise 的状态
   */
  this.promise = new Promise(function promiseExecutor(resolve) {
    // 将一个 微任务的成功状态决议 赋值给该变量。
    resolvePromise = resolve;
  });

  var token = this; // 保存this指向 😯

  /**
   * Promise 状态改变的时候， 执行一些 订阅/发布 事件。
   * 将 订阅列表中的每个函数执行传递进行的 cancel 参数。
   * ...
   */

  /**
   * 利用 callback 传递进来一个取消的 `message`。
   * 😯🍓 - executor = function (c) { c 就是用于取消当前请求的函数。 };
   * 🍓 - 这样 c 就可以传递进去一个 message 也可以控制 cacel 啥时候执行。
   */
  executor(function cancel(message) {
    if (token.reason) {
      // 判断 reason 标示！
      // Cancellation has already been requested
      // 说明该请求已经执行了 取消。
      return;
    }

    token.reason = new Cancel(message); // token.reason上挂载一个 Cancel 实例。
    // 执行resolvePromise 即就会将 this.promise 的状态改变
    // 然后就会主动执行 promise后面的两个 then 方法。
    resolvePromise(token.reason);
  });
}

/**
 * 返回一个对象，包含新的 `cancelToken`实例 以及 取消函数
 * cancel 函数调用时取消 请求方法。
 */
CancelToken.source = function source() {
  var cancel;
  /**
   * 这里定义的 executor - 对应上面的 executor。
   * 这里又是将同样操作 利用 cancel 将 c 的控制权引用 拿到。
   * -- cancel 就是 下面 c函数。 c函数调用的时候 就会取消当前请求。 😯 - 🍓🍓🍓
   *
   * CancelToken 类如此封装的主要目的就是为了能够 分离promise和resolve方法。 🍓
   * 让用户可以自己调用resolve方法，一旦resolve后，就会触发promise的then方法 🍓
   * 接着就会执行取消 axios 内部的取消请求的操作
   */
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token, // 这个token是CancelToken类的一个实例，可以访问到内部的promise。
    cancel: cancel,
  };
};

module.exports = CancelToken;
```

### `xhr.js` 中关于 `Cancel`部分

**当用户调用`cancel`后，就会立即执行`abort`方法取消请求。同时调用`reject`让外层的`promise`失败。**

**所以可以在`.catch`中接收到 取消后的事件回调。**

**`reject`中传递的是`new Cancel`，所以在编写业务逻辑的时候可以使用`isCancel`来判断。**

```js
if (config.cancelToken || config.signal) {
  // Handle cancellation
  // eslint-disable-next-line func-names
  onCanceled = function (cancel) {
    if (!request) {
      return;
    }
    reject(
      !cancel || (cancel && cancel.type) ? new Cancel("canceled") : cancel
    );
    request.abort();
    request = null;
  };

  config.cancelToken && config.cancelToken.subscribe(onCanceled);
  if (config.signal) {
    config.signal.aborted
      ? onCanceled()
      : config.signal.addEventListener("abort", onCanceled);
  }
}
```

## `Axios` 内置方法学习

### **[ `extend` ]**

```js
// 学习 - extend方法
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === "function") {
      a[key] = bind(val, thisArg); // 🍓 - 如果是函数赋值。注意它的this指向。
    } else {
      a[key] = val;
    }
  });
  return a;
}
```

### `[ isPlainObject ]` - 纯对象检测

```js
function isPlainObject(val) {
  if (toString.call(val) !== "[object Object]") {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  // 这里判断 null 或者 判断 Object.prototype 是因为 想要判断他是一个简单的对象
  // 没有继承， 是直接定义出来的 对象。
  // 这里是判断是一个 纯对象。 为了防止合并对象的多余属性。
  return prototype === null || prototype === Object.prototype;
}
```

### `[ forEach ]`

```js
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === "undefined") {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== "object") {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}
```

### `[ merge ]`

````js
/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 * 就是将多个对象的 key 进行合并。类似 ... 扩展运算符
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  /**
   * 如果是对象， val 和 key 则就是 属性值 和 属性。
   */
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      /**
       * 如果在 result 中的key已经存在并且是一个对象，并且 val 本身也是一个对象
       * 这里就需要进行递归了。 🍓🍓🍓 - 🤔？
       */
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      /**
       * 这里是判断 val 如果是对象，将 val 依次合并到一个新对象中。
       */
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      /**
       * 如果是数组，则 直接 slice 后创建一个新的数组。
       * 但是如果数组中有 引用类型，修改引用值， 也还是会将 原引用修改掉。🍓~
       */
      result[key] = val.slice();
    } else {
      /**
       * 如果是基础值，则直接赋值。
       * 如果是引用值，则进行合并。
       */
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    /**
     * 这里对每个参数[对象]进行遍历，之后对每一项执行 assignValue 函数。
     * forEach 进行了封装 可以对 非数组->包装成数组 / 对象 / 数组 进行遍历。
     */
    forEach(arguments[i], assignValue);
  }
  return result;
}
````

### `[ request ]`

```js
/**
 * Dispatch a request
 * 实例上的原型方法 request - 🍓🍓🍓~
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(configOrUrl, config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  /**
   * 如果 configOrUrl 第一个值是 string。
   * 那么 params-1 则为 url。 params-2 为配置对象。
   *
   * 反之，params-1 则就为 配置对象。
   */
  if (typeof configOrUrl === "string") {
    config = config || {};
    config.url = configOrUrl;
  } else {
    config = configOrUrl || {};
  }

  // 对默认配置 合并覆盖 处理。 this 指向axios实例
  config = mergeConfig(this.defaults, config);

  // Set config.method
  /**
   * 如果 有传递请求方法，则使用。否则使用默认配置。
   * 兜底，get
   */
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = "get";
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(
      transitional,
      {
        silentJSONParsing: validators.transitional(validators.boolean),
        forcedJSONParsing: validators.transitional(validators.boolean),
        clarifyTimeoutError: validators.transitional(validators.boolean),
      },
      false
    );
  }

  // filter out skipped interceptors
  /**
   * 过滤掉跳过的拦截器
   *
   * 拦截请求链
   */
  var requestInterceptorChain = [];
  /**
   * 同步请求拦截器
   */
  var synchronousRequestInterceptors = true;

  /**
   * 这里就是如果用户注册了请求的 use 函数。
   * 就会将其放在 chain 数组的前面 就是👇下面 Array.prototype.unshift.apply(chain, requestInterceptorChain);
   * 如果用户注册了响应的 use 函数
   * 就会将其放在 chain数组的后面 就是下面👇 chain = chain.concat(responseInterceptorChain);
   *
   * 最终可以理解为 形成了一条链条。
   */
  this.interceptors.request.forEach(function unshiftRequestInterceptors(
    interceptor
  ) {
    if (
      typeof interceptor.runWhen === "function" &&
      interceptor.runWhen(config) === false
    ) {
      return;
    }

    /**
     * 这里猜测就是在请求拦截前，进行 判断 是否为 同步操作的。
     */
    synchronousRequestInterceptors =
      synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(
      interceptor.fulfilled,
      interceptor.rejected
    );
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(
    interceptor
  ) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  /**
   * 如果不是 同步请求的话
   */
  if (!synchronousRequestInterceptors) {
    /**
     * dispatchRequest 方法 - 是发起请求的真正方法。
     * undefined 是为了占位 来进行 请求和响应拦截的成对输出。
     *
     * Chain => 链条 - 数组存储执行链
     */
    var chain = [dispatchRequest, undefined];

    /**
     * 这里头部添加 请求拦截
     * 然后尾部添加 响应拦截
     *
     * chain = [
     *  // 请求拦截数组中的函数
     *  requestInterceptorChain 【这里是请求成功 请求失败 两个promise】
     *  // undefined 以及响应拦截
     *  dispatchRequest, undefined
     *  // 响应拦截数组中的函数
     *  responseInterceptorChain 【这里是响应成功 响应失败 两个promise】
     * ]
     */
    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    /**
     * 创建定义了一个 成功状态的 Promise实例，返回值就是 config
     * config 已经就是 合并后的 配置对象。
     *
     * 这里的 config 就会被传入下面
     *  promise = promise.then(chain.shift(), chain.shift());
     * 被 chain.shift() 使用。也就是 请求拦截器使用。
     * 所以我们在 编写拦截器的时候，是需要将 config返回的，用于 dispatchRequest 接收并处理。😯
     */
    promise = Promise.resolve(config);

    /**
     * 如果 chain 有值。
     * promise = promise.then(chain.shift(), chain.shift());
     * 这一步就是 将 config 传递进去 到 请求拦截函数requestInterceptorChain中，即第一个 chain.shift()。
     * 第二个 chain.shift() 则为 处理请求拦截dispatchRequest的。 这里就可以做到 请求阻塞。
     *
     * 依次成对执行
     * 并用新的 promise 代替旧的 promise
     * 最后返回新的 promise 覆盖
     *
     * 这里使用的是 while 循环，所以会再次执行 直到执行完 响应函数后 排空chain数组为止。
     *
     * 这里 promise 的状态是根据请求完成后 并且 请求 / 响应 拦截函数返回 三种情况返回的。
     */
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    /**
     * ⚠️  这里的 promise 在上述执行完之后， 因为上述是同步执行。
     * 所以是一次性的将 promise 进行 链式排开 声明定义的。
     *
     * 所以这里的 promise 依然是 等待决议的状态。等请求返回并处理完成后，promise才会改变状态。
     * 这里的promise 其实是
     * promise.then(请求成功/失败).then(请求处理函数,undefined).then(响应成功/失败)
     *
     * 参考 dispatchRequest 函数的说明，在整个 promise都处理完之后，
     * 这个 promise最后返回的就是 response 数据。
     */
    return promise;
  }

  /**
   * 如果是同步请求？
   * 手动执行 然后 newConfig = onFulfilled(newConfig);
   * 然后再 一步一步 进行传递。
   */
  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(
      responseInterceptorChain.shift(),
      responseInterceptorChain.shift()
    );
  }

  return promise;
};
```

### `[ Promise.then ]` - 链式调用 🍓~

**「 学习 」**

```js
/** promise 是成功状态的。
 * 🍓 - 它返回的值，例如 1。就会被下一个 .then 接收到。
 */
var promise = Promise.resolve("1");

var chain = [
  /* 里面有几组成功和失败的promise */
];

/**
 * 想要按照顺序执行 就可以 promise = promise.then();
 * chain 数组成对的 返回出来。
 */
while (chain.length) {
  promise = promise.then(chain.shift(), chain.shift());
}

/** 🍓🍓🍓
 * 此时的 Promise 就是pending状态的 promise.then( chain数组成对的Promise还没有返回 )
 * 等待最后 Promise 状态有结果之后 promise就是最终结果的状态。
 * ✨ - 因为 上面是同步执行的 只是 不断赋值和不断shift 了。所以就还是 等待 状态。
 */
return promise;
```

### `[ transformRequest ]`

对应上面 `dispatchRequest`中的方法调用。

参考`defaultConfig`中的`transformRequest`的函数定义。

1. 规范化操作

   ```js
   function setContentTypeIfUnset(headers, value) {
     /**
      * 如果 headers 有值，但是没有 Content-Type 字段，那么就需要添加 该字段。
      */
     if (
       !utils.isUndefined(headers) &&
       utils.isUndefined(headers["Content-Type"])
     ) {
       headers["Content-Type"] = value;
     }
   }

   function normalizeHeaderName(headers, normalizedName) {
     utils.forEach(headers, function processHeader(value, name) {
       /**
        * 这里就是你传递进来的 字段和 规范化的字段不一致。
        * 但是 转化为大写的时候，是一致的。说明这个是不规范的， 🍓 - 🤔 可以借鉴。
        *
        * 这里就会对其进行 字段规范化配置。 value保持不变，删除原先不规范的配置。
        */
       if (
         name !== normalizedName &&
         name.toUpperCase() === normalizedName.toUpperCase()
       ) {
         headers[normalizedName] = value;
         delete headers[name];
       }
     });
   }
   ```

2. `transformRequest` 函数组

   ```js
   /**
    * 执行 dispatchRequest，遍历 transformRequest 的时候，也就会执行下面这个函数。
    *
    * 接收的是 config.data config.headers
    *
    * 规范了 头部字段
    * 规范了 不同情况下的 data数据
    */
   transformRequest: [
     function transformRequest(data, headers) {
       /**
        * 规范化 headers 中的头部字段名。
        * 也就说明 Accept Content-Type 是需要规范化的。不可以写错。🍓 - 🤔 可以借鉴。
        */
       normalizeHeaderName(headers, "Accept");
       normalizeHeaderName(headers, "Content-Type");

       /**
        * 如果 config.data 如果是下面这几种类型，就直接返回。不转换。🍓 - 🤔 可以借鉴。
        */
       if (
         utils.isFormData(data) ||
         utils.isArrayBuffer(data) ||
         utils.isBuffer(data) ||
         utils.isStream(data) ||
         utils.isFile(data) ||
         utils.isBlob(data)
       ) {
         return data;
       }

       /**
        * 如果是下面的就需要对其进行转换。 🍓 - 🤔 可以借鉴。
        */
       if (utils.isArrayBufferView(data)) {
         return data.buffer;
       }
       if (utils.isURLSearchParams(data)) {
         /**
          * 如果 headers 有值，但是没有 Content-Type 字段，那么就需要添加 该字段。
          */
         setContentTypeIfUnset(
           headers,
           "application/x-www-form-urlencoded;charset=utf-8"
         );

         /**
          * 如果data is URLSearchParams。 应该是 地址栏请求参数，get请求。
          * 就需要将其 转换为 string 类型
          */
         return data.toString();
       }

       var isObjectPayload = utils.isObject(data);
       var contentType = headers && headers["Content-Type"];

       /**
        * 如果 config.data 是一个对象， 并且 Content-Type 是 multipart/form-data 类型
        *  - 执行，toFormData 转换
        *
        * 如果 config.data 是一个对象，或者 Content-Type 是 application/json 类型
        *  - 指向 并进行 json转换。
        */
       if (isObjectPayload && contentType === "multipart/form-data") {
         return toFormData(
           data,
           new ((this.env && this.env.FormData) || FormData)()
         );
       } else if (isObjectPayload || contentType === "application/json") {
         setContentTypeIfUnset(headers, "application/json");
         return stringifySafely(data);
       }

       return data;
     },
   ];
   ```

### `[ xhrAdapter ]`

1. **`settle`**

   ```js
   /**
    * Resolve or reject a Promise based on response status.
    *
    * @param {Function} resolve A function that resolves the promise.
    * @param {Function} reject A function that rejects the promise.
    * @param {object} response The response.
    *
    * 根据响应状态解决或拒绝承诺。
    */
   module.exports = function settle(resolve, reject, response) {
     /**
      * 如果没有特别配置，一般获取 默认的 validateStatus
      * validateStatus: function validateStatus(status) {
         return status >= 200 && status < 300;
       },
       判断状态码 是不是在 200 到 300 之间。🍓
       这里配置 就可以进行判断 具体定义的 成功状态码。
      */
     var validateStatus = response.config.validateStatus;

     /**
      * 如果 response.status  不存在或者是0？ / 不存在 验证函数 / 通过了验证函数
      * 返回一个成功状态。
      *
      * 否则返回一个 错误状态码。
      */
     if (
       !response.status ||
       !validateStatus ||
       validateStatus(response.status)
     ) {
       resolve(response);
     } else {
       reject(
         createError(
           "Request failed with status code " + response.status,
           response.config,
           null,
           response.request,
           response
         )
       );
     }
   };
   ```

2. **`Xhr`**

   **就是利用`XMLHttpRequest`请求的，做了一些封装处理。**

   **注意取消请求的方法定义。`onCanceled`🍓🍓🍓**

   ```js
   function xhrAdapter(config) {
     // 返回一个 promise 实例。 promise进行封装的请求。
     return new Promise(function dispatchXhrRequest(resolve, reject) {
       var requestData = config.data;
       var requestHeaders = config.headers;
       var responseType = config.responseType;
       var onCanceled;
       function done() {
         if (config.cancelToken) {
           config.cancelToken.unsubscribe(onCanceled);
         }

         if (config.signal) {
           config.signal.removeEventListener("abort", onCanceled);
         }
       }

       /**
        * 判断 config.data 是不是 formData 格式，如果是 就删除请求头中的 Content-Type 字段
        * 这里就是 只需要让浏览器去 自动判断它。
        */
       if (utils.isFormData(requestData)) {
         delete requestHeaders["Content-Type"]; // Let the browser set it
       }

       /**
        * 下面就是 利用 XMLHttpRequest 想浏览器发起请求的一个过程。
        */
       var request = new XMLHttpRequest();

       // HTTP basic authentication
       // config.auth 存在的话，就去做一些 http验证操作。
       if (config.auth) {
         var username = config.auth.username || "";
         var password = config.auth.password
           ? unescape(encodeURIComponent(config.auth.password))
           : "";
         requestHeaders.Authorization =
           "Basic " + btoa(username + ":" + password);
       }

       // 构建完整的路径。 - 基础的URL 和 传递进来的URL做拼接。
       var fullPath = buildFullPath(config.baseURL, config.url);
       /**
        * open - 初始化一个请求。
        * params1 - 请求方法转大写
        * params2 - 将 path 和 params 以及 paramsSerializer序列化函数 构建一个 url
        * true - 代表 这是一个 异步请求。
        */
       request.open(
         config.method.toUpperCase(),
         buildURL(fullPath, config.params, config.paramsSerializer),
         true
       );

       // Set the request timeout in MS
       // 设置 ms 为单位的超时时间。
       request.timeout = config.timeout;

       function onloadend() {
         if (!request) {
           return;
         }
         // Prepare the response  准备响应对象。
         // 如果有 getAllResponseHeaders 的这个属性，就全部都给展现出来。
         var responseHeaders =
           "getAllResponseHeaders" in request
             ? parseHeaders(request.getAllResponseHeaders())
             : null;
         // 设置 responseData  如果没有明确设置 responseType 或者为 text / json
         // 那 responseData 就为 responseText 否则就为 response。
         var responseData =
           !responseType || responseType === "text" || responseType === "json"
             ? request.responseText
             : request.response;

         // 构建一个用于响应拦截起接受的 响应对象 🍓 - 😯
         var response = {
           data: responseData,
           status: request.status,
           statusText: request.statusText,
           headers: responseHeaders,
           config: config,
           request: request,
         };

         /**
          * 因为前面的处理结果， 这里的 readyState 一定是为4。
          * 一定就是响应好的数据。response 存在。
          *
          * settle 根据响应状态返回 resolve Or reject
          */
         settle(
           function _resolve(value) {
             // 然后成功后。调用上面new Promise里面的 resolve 进行返回 🍓😯
             resolve(value);
             done();
           },
           function _reject(err) {
             // 然后失败后。调用上面new Promise里面的 reject 进行返回 ✨
             reject(err);
             done();
           },
           response
         );

         // Clean up request
         request = null;
       }

       if ("onloadend" in request) {
         // Use onloadend if available
         request.onloadend = onloadend;
       } else {
         // Listen for ready state to emulate onloadend
         /**
          * 🍓 onreadystatechange 监听 request 的状态
          * 0 - 1 - 2 - 3 - 4 五步。
          * request.readyState !== 4 都不做处理。
          */
         request.onreadystatechange = function handleLoad() {
           if (!request || request.readyState !== 4) {
             return;
           }

           // The request errored out and we didn't get a response, this will be
           // handled by onerror instead
           // With one exception: request that using file: protocol, most browsers
           // will return status as 0 even though it's a successful request

           /**
            * 请求出错，我们没有得到响应，这将由onerror处理
            * 除了一个例外：请求使用file:protocol，大多数浏览器将返回状态为0，即使请求成功
            */
           if (
             request.status === 0 &&
             !(
               request.responseURL && request.responseURL.indexOf("file:") === 0
             )
           ) {
             return;
           }
           // readystate handler is calling before onerror or ontimeout handlers,
           // so we should call onloadend on the next 'tick'
           setTimeout(onloadend);
         };
       }

       // Handle browser request cancellation (as opposed to a manual cancellation)
       /**
        * 处理浏览器请求取消（与手动取消相反）
        * 请求中断的时候，执行该函数。 🍓🍓🍓
        */
       request.onabort = function handleAbort() {
         if (!request) {
           return;
         }

         reject(
           createError("Request aborted", config, "ECONNABORTED", request)
         );

         // Clean up request
         request = null;
       };

       // Handle low level network errors - 处理低级网络错误
       request.onerror = function handleError() {
         // Real errors are hidden from us by the browser
         // onerror should only fire if it's a network error
         reject(createError("Network Error", config, null, request));

         // Clean up request
         request = null;
       };

       // Handle timeout - 超时的时候
       request.ontimeout = function handleTimeout() {
         var timeoutErrorMessage = config.timeout
           ? "timeout of " + config.timeout + "ms exceeded"
           : "timeout exceeded";
         var transitional = config.transitional || defaults.transitional;
         if (config.timeoutErrorMessage) {
           timeoutErrorMessage = config.timeoutErrorMessage;
         }
         reject(
           createError(
             timeoutErrorMessage,
             config,
             transitional.clarifyTimeoutError ? "ETIMEDOUT" : "ECONNABORTED",
             request
           )
         );

         // Clean up request
         request = null;
       };

       // Add xsrf header
       // This is only done if running in a standard browser environment.
       // Specifically not if we're in a web worker, or react-native.
       /**
        * 添加xsrf头
        * 只有在标准浏览器环境中运行时才能执行此操作。
        * 特别是如果我们是网络工作者，或者是本地人
        */
       if (utils.isStandardBrowserEnv()) {
         // Add xsrf header
         var xsrfValue =
           (config.withCredentials || isURLSameOrigin(fullPath)) &&
           config.xsrfCookieName
             ? cookies.read(config.xsrfCookieName)
             : undefined;

         if (xsrfValue) {
           requestHeaders[config.xsrfHeaderName] = xsrfValue;
         }
       }

       // Add headers to the request - 向请求添加标题
       if ("setRequestHeader" in request) {
         utils.forEach(requestHeaders, function setRequestHeader(val, key) {
           if (
             typeof requestData === "undefined" &&
             key.toLowerCase() === "content-type"
           ) {
             // Remove Content-Type if data is undefined
             delete requestHeaders[key];
           } else {
             // Otherwise add header to the request
             request.setRequestHeader(key, val);
           }
         });
       }

       // Add withCredentials to request if needed - 如果需要，添加withCredentials以请求
       if (!utils.isUndefined(config.withCredentials)) {
         request.withCredentials = !!config.withCredentials;
       }

       // Add responseType to request if needed - 如果需要，将responseType添加到请求中
       if (responseType && responseType !== "json") {
         request.responseType = config.responseType;
       }

       // Handle progress if needed - 如果需要，处理进展
       if (typeof config.onDownloadProgress === "function") {
         request.addEventListener("progress", config.onDownloadProgress);
       }

       // Not all browsers support upload events -  并非所有浏览器都支持上传事件
       if (typeof config.onUploadProgress === "function" && request.upload) {
         request.upload.addEventListener("progress", config.onUploadProgress);
       }

       if (config.cancelToken || config.signal) {
         // Handle cancellation
         // eslint-disable-next-line func-names
         /**
          * 🍓🍓🍓 当用户调用cancel后，就会立即执行abort方法取消请求
          * 🍓🍓🍓 同时调用reject让外层的promise失败。
          *
          * 所以可以在 .catch 中接收到 取消后的事件回调。
          * 然后 reject 中传递的是 new Cancel 所以在，编写业务逻辑的时候 可以使用 isCancel 来判断。
          */
         onCanceled = function (cancel) {
           if (!request) {
             return;
           }
           reject(
             !cancel || (cancel && cancel.type)
               ? new Cancel("canceled")
               : cancel
           );
           request.abort();
           request = null;
         };

         config.cancelToken && config.cancelToken.subscribe(onCanceled);
         if (config.signal) {
           config.signal.aborted
             ? onCanceled()
             : config.signal.addEventListener("abort", onCanceled);
         }
       }

       if (!requestData) {
         requestData = null;
       }

       // Send the request - 发送请求 🍓😯✨~
       // 将请求的数据 发出~
       request.send(requestData);
     });
   }
   ```

### `[ axios.create ]`

**`axios.create`其实还是执行的 `createInstance` 函数。**

只不过参数是 默认以及传入参数 进行合并后的参数。

这样就会将 传入配置 和 默认配置合并，创建一个新的不同的·实例。

```js
// Factory for creating new instances - 用于创建新实例的工厂
instance.create = function create(instanceConfig) {
  return createInstance(mergeConfig(defaultConfig, instanceConfig));
};
```

## `Sum`

`dispatchRequest` 是利用`Promise`包装`XMLHttpRequest`的方法，对请求`config`和`response`数据结果进行处理。

比如对请求拦截器中自定义的`config`进行规范化，对响应拦截器接受的`response`进行封装后传递。

然后又 **因为 `promise`中的`catch`如果不对其进行捕获，是会继续向下传递的。这样就有了 `undefined`占位的`code`。**

---

`Axios`文件中最后返回的`promise`在其没有执行异步的时候，是一个等待状态的。

执行后异步并且有结果了之后，状态就会发生改变。 成功后返回的值那就是`response`。

之后我们就可以在响应拦截器中进行响应数据的处理。

---

- **函数可以充当函数 / 对象。 这样就可以造就一个灵活的`API` 调用方式。**

- **利用`Promise`特性`promise.then`去注册异步。不阻塞同步代码。**

- **队列逻辑[先进先出`FIFO`]。 请求拦截 - 请求 - 响应拦截。**
- **利用`promise = promise.then()`的链式调用进行顺序执行以及请求发送的逻辑。**

- **利用数组的 `shift` 以及 `unShift.apply(, [])`进行 添加和提取。**

- **优化 - 不同方式参数灵活传递，`axios`都可以对其进行规范化处理。**

- **可以在外部控制这个`promise`的成功了。要知道`new Promise`返回的对象是无法从外部决定它成功还是失败的。**

  ```js
  let resolveHandle;
  new Promise((resolve) => {
    resolveHandle = resolve;
  }).then((val) => {
    console.log("resolve", val);
  });
  resolveHandle("ok"); // resolve ok 我什么时候调用，它什么时候执行！！！🍓🍓🍓
  ```

  **明白了 类 / 构造函数 / 原型 还可以这样来使用 😯**
