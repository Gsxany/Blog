/**
 * { 结构表示 👇
 *  'key1': [fn...], 数组保证函数顺序 - 有序
 *  'key2': [
 *    { fn: fn1, isOnce: false } // 标示是否是 once 绑定的函数
 *  ],
 *  'key3': [fn...]
 * }
 * @description
 * @class EventBus
 */
class EventBus {
  private events: {
    [key: string]: {
      fn: Function;
      isOnce: boolean;
    }[];
  };
  private static _instance: EventBus;

  constructor() {
    this.events = {};
  }

  static getInstance(): EventBus {
    if (!this._instance) {
      this._instance = new EventBus();
    }
    return this._instance;
  }

  on(type: string, fn: Function, isOnce: boolean = false): this {
    const events = this.events;
    if (events[type] === null) {
      events[type] = [];
    }
    events[type].push({ fn, isOnce });
    return this;
  }

  once(type: string, fn: Function): this {
    this.on(type, fn, true);
    return this;
  }

  off(type: string, fn?: Function): this {
    if (!fn) {
      this.events[type] = [];
    } else {
      const fnList = this.events[type];
      if (fnList.length) {
        this.events[type] = fnList.filter((_item) => _item.fn !== fn);
      }
    }

    return this;
  }

  emit(type: string, ...args: any[]) {
    const fnList = this.events[type];
    if (fnList == null) return;

    this.events[type] = fnList.filter((_item) => {
      const { fn, isOnce } = _item;
      fn(...args);

      if (!isOnce) return true;
      return false;
    });
  }
}

export default EventBus.getInstance();
