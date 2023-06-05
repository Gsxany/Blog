import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * 🍓🍓🍓~
 * 自定义/系统 Hook 都是不可以在普通函数中运行的，只能在 其他Hook/组件 中运行。
 */

/**
 * 自定义Hook - 自定义防抖 Hook
 * 相关Hook - useEffect
 */
/**
 * 使用：
 * const debounceParam = useDebounce(param, 2000);
 * useEffect(() => {
 *  fetch(`...cleanObject(debounceParam)`).then(async res => {
 *  })
 * }, [debounceParam])
 */
export const useDebounce = <V>(value: V, delay?: number) => {
  // useState 在 react 是响应式的。value 转换成 debouncedValue 的话 需要使用 useState Hook
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // 每次 value/delay 变化的时候 都会新设置一个定时器。 然后设置 debouncedValue 的值
    const timeout = setTimeout(() => setDebouncedValue(value), delay);

    // 🍓 return 执行时机是在 ✨上一次✨ useEffect 运行完之后，才会执行的
    // ✨上一次✨ 运行完之后  清理定时器。
    return () => clearTimeout(timeout);
    // delay 一般是不会变化的
  }, [value, delay]);

  return debouncedValue;
};

/**
 * 自定义Hook - 获取页面尺寸调整
 * 相关Hook - useLayoutEffect
 */
export const useWindowSize: () => number[] = () => {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize(): void {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
};

/**
 * 自定义Hook - 获取页面滚动距离
 * 相关Hook - useEffect
 */
export const useDOMScroll: () => number[] = () => {
  const [scrollSize, setScrollSize] = useState([0, 0]);
  useEffect(() => {
    function updateScroll(): void {
      setScrollSize([window.scrollY, window.scrollX]);
      window.addEventListener("scroll", updateScroll);
    }
    updateScroll();
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  return scrollSize;
};

/**
 * 自定义Hook - 初始化加载事件
 * 相关Hook - useEffect
 */
export const useMount = (cb: () => void) => {
  // FIXME: 依赖项中加上 cb 会造成无限循环， 这个和 useCallback 以及 useMemo 有关系
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(cb, []);
};

// keepOnUnmount 当页面写在的时候 是否保留当前 title。
export const useDocumentTitle = (title: string, keepOnUnmount = true) => {
  // 做一个 cache title 用作缓存。
  // const oldTitle = document.title;
  const oldTitle = useRef(document.title).current;

  // 传入的 title 变化的时候，就会跟着改变
  // 但是这样做 就要求每个页面都 指定一个  title。
  useEffect(() => {
    document.title = title;
  }, [title]);

  // 下面的 hook 的代码，在页面加载的时候 执行一次~
  // 所以 里面用的是 闭包。
  // 作用域引用的时候，还是调用的 页面加载时候的值
  // 所以 打印值的时候 不会改变~

  // 🍓 所以 回调函数中 引用的，永远都是页面加载的时候 引用的值。
  // 后续页面无论怎么渲染 怎么变化 下面 hook 返回的方法 都不会执行了。
  // 将要 打印/引用 的值 放置进 依赖中，就可以保证 num 值永远都是最新的。
  // 🍓 所以在 hook 中遇到 闭包问题的话，一定要去对比 依赖项 中的代码。
  // 就是会在 页面卸载 的时候被调用。
  useEffect(() => {
    return () => {
      if (!keepOnUnmount) {
        document.title = oldTitle;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keepOnUnmount, oldTitle]);
};
