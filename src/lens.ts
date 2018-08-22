export interface Lens<A, B> {
  readonly get: (a: A) => B;
  readonly set: (b: B) => (a: A) => A;
}

export namespace Lens {
  const _update = <A, B> (lens: Lens<A, B>, f: (b: B) => B, a: A) => lens.set(f(lens.get(a)))(a);

  const _curriedUpdate = <A, B> (lens: Lens<A, B>) => (f: (b: B) => B) => (a: A): A =>
    _update(lens, f, a);

  export function update<A, B>(lens: Lens<A, B>, f: (b: B) => B, a: A): A;
  export function update<A, B>(lens: Lens<A, B>): (f: (b: B) => B) => (a: A) => A;
  export function update<A, B>(lens: Lens<A, B>, f?: (b: B) => B, a?: A) {
    return f ? _update(lens, f, a) : _curriedUpdate(lens);
  }

  const _compose = <A, B, C> (l1: Lens<A, B>, l2: Lens<B, C>): Lens<A, C> => ({
    get: (a: A): C => l2.get(l1.get(a)),
    set: (c: C) => update(l1)(l2.set(c))
  });

  const _curriedCompose = <A, B, C> (l2: Lens<B, C>) => (l1: Lens<A, B>): Lens<A, C> =>
    _compose(l1, l2);

  const _composeMany = (...lenses: Lens<any, any>[]) => lenses.slice(1).reduce(_compose, lenses[0]);

  export function compose<A, B, C>(l2: Lens<B, C>): (l1: Lens<A, B>) => Lens<A, C>;
  export function compose<A, B, C>(l1: Lens<A, B>, l2: Lens<B, C>): Lens<A, C>;
  export function compose<A, B, C, D>(l1: Lens<A, B>, l2: Lens<B, C>, l3: Lens<C, D>): Lens<A, D>;
  export function compose<A, B, C, D, E>(
    l1: Lens<A, B>, l2: Lens<B, C>, l3: Lens<C, D>, l4: Lens<D, E>
  ): Lens<A, E>;
  export function compose<A, B, C, D, E, F>(
    l1: Lens<A, B>, l2: Lens<B, C>, l3: Lens<C, D>, l4: Lens<D, E>, l5: Lens<E, F>
  ): Lens<A, F>;
  export function compose<A, B, C, D, E, F, G>(
    l1: Lens<A, B>, l2: Lens<B, C>, l3: Lens<C, D>, l4: Lens<D, E>, l5: Lens<E, F>, l6: Lens<F, G>
  ): Lens<A, G>;
  export function compose<A, B, C, D, E, F, G, H>(
    l1: Lens<A, B>, l2: Lens<B, C>, l3: Lens<C, D>, l4: Lens<D, E>, l5: Lens<E, F>, l6: Lens<F, G>,
    l7: Lens<G, H>
  ): Lens<A, H>;
  export function compose<A, B, C, D, E, F, G, H, I>(
    l1: Lens<A, B>, l2: Lens<B, C>, l3: Lens<C, D>, l4: Lens<D, E>, l5: Lens<E, F>, l6: Lens<F, G>,
    l7: Lens<G, H>, l8: Lens<H, I>
  ): Lens<A, I>;
  export function compose<A, B, C, D, E, F, G, H, I, J>(
    l1: Lens<A, B>, l2: Lens<B, C>, l3: Lens<C, D>, l4: Lens<D, E>, l5: Lens<E, F>, l6: Lens<F, G>,
    l7: Lens<G, H>, l8: Lens<H, I>, l9: Lens<I, J>
  ): Lens<A, J>;
  export function compose<A, B, C, D, E, F, G, H, I, J, K>(
    l1: Lens<A, B>, l2: Lens<B, C>, l3: Lens<C, D>, l4: Lens<D, E>, l5: Lens<E, F>, l6: Lens<F, G>,
    l7: Lens<G, H>, l8: Lens<H, I>, l9: Lens<I, J>, l10: Lens<J, K>
  ): Lens<A, K>;
  export function compose<A, B, C>(first: Lens<any, any>, ...lenses: Lens<any, any>[]) {
    return lenses.length === 0 ? _curriedCompose(first) : _composeMany(first, ...lenses);
  }

  const _over = <T, K extends keyof T> (key: K): Lens<T, T[K]> => ({
    get: (t: T): T[K] => t[key],
    set: (data: T[K]) => (t: T): T =>
      t === undefined || t === null ? t :
      Array.isArray(t) ?
      [...t.slice(0, +key), data, ...t.slice(+key + 1)] :
      {...(t as any), [key]: data}
  });

  export function over<T>(key: keyof T): Lens<T, T[keyof T]>;
  export function over<T, K1 extends keyof T = keyof T, K2 extends keyof T[K1] = keyof T[K1]>(
    k1: K1, k2: K2
  ): Lens<T, T[K1][K2]>;
  export function over<
    T, K1 extends keyof T = keyof T, K2 extends keyof T[K1] = keyof T[K1],
    K3 extends keyof T[K1][K2] = keyof T[K1][K2]
  >(k1: K1, k2: K2, k3: K3): Lens<T, T[K1][K2][K3]>;
  export function over<
    T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3]
  >(k1: K1, k2: K2, k3: K3, k4: K4): Lens<T, T[K1][K2][K3][K4]>;
  export function over<
    T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3], K5 extends keyof T[K1][K2][K3][K4]
  >(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5): Lens<T, T[K1][K2][K3][K4][K5]>;
  export function over<
    T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3], K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5]
  >(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6): Lens<T, T[K1][K2][K3][K4][K5][K6]>;
  export function over<
    T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3], K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5], K7 extends keyof T[K1][K2][K3][K4][K5][K6]
  >(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, k7: K7): Lens<T, T[K1][K2][K3][K4][K5][K6][K7]>;
  export function over<
    T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3], K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5], K7 extends keyof T[K1][K2][K3][K4][K5][K6],
    K8 extends keyof T[K1][K2][K3][K4][K5][K6][K7]
  >(
    k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, k7: K7, k8: K8
  ): Lens<T, T[K1][K2][K3][K4][K5][K6][K7][K8]>;
  export function over<
    T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3], K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5], K7 extends keyof T[K1][K2][K3][K4][K5][K6],
    K8 extends keyof T[K1][K2][K3][K4][K5][K6][K7],
    K9 extends keyof T[K1][K2][K3][K4][K5][K6][K7][K8]
  >(
    k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, k7: K7, k8: K8, k9: K9
  ): Lens<T, T[K1][K2][K3][K4][K5][K6][K7][K8][K9]>;
  export function over<
    T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3], K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5], K7 extends keyof T[K1][K2][K3][K4][K5][K6],
    K8 extends keyof T[K1][K2][K3][K4][K5][K6][K7],
    K9 extends keyof T[K1][K2][K3][K4][K5][K6][K7][K8],
    K10 extends keyof T[K1][K2][K3][K4][K5][K6][K7][K8][K9]
  >(
    k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, k7: K7, k8: K8, k9: K9, k10: K10
  ): Lens<T, T[K1][K2][K3][K4][K5][K6][K7][K8][K9][K10]>;
  export function over(...keys: string[]) {
    return _composeMany(...keys.map(_over));
  }
}
