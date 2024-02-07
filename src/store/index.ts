/** 监听对象 */
interface QWatch<T = unknown> {
  /** 监听回调 */
  watch: (callback: (value: T) => void) => void;
  /** 取消监听 */
  unwatch: () => void;
}

/** 关联实例 */
interface QStore<T = unknown> {
  /** 获取值 */
  get: () => T;
  /** 设置值 */
  set: (value: T) => void;
  /** 更新值 */
  update: (fn: (value: T) => T) => void;
  /** 监听值 */
  watch: (callback: (value: T) => void) => () => void;
  /** 计算监听 */
  map: <R>(fn?: (value: T) => R) => QWatch<T>;
}

/**
 * 创建关联对象
 * @param state 初始化数据
 */
export const createStore = <T = unknown>(state: T): QStore<T> => {
  /** 触发器 */
  const es = new Set<(value: T) => void>();
  /** 当前值 */
  let now = state;
  return {
    get: () => now,
    /** 设置值 */
    set: (value) => {
      now = value;
      es.forEach((f) => f(now));
    },
    update: (fn) => {
      now = fn(now);
      es.forEach((f) => f(now));
    },
    watch: (callback) => {
      es.add(callback);
      return () => es.delete(callback);
    },
    map: (fn) => {
      const ws = new Set();
      const watch = (value: T) => {};
      es.add(watch);
      return {
        watch: (callback) => {
          ws.add(callback);
        },
        unwatch: () => {
          es.delete(watch);
        },
      };
    },
  };
};
