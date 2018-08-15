export interface Lens<A, B> {
  readonly get: (a: A) => B;
  readonly set: (b: B) => (a: A) => A;
};

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
    return lenses.length === 0 ?
      _curriedCompose(first) :
      lenses.reduce((acc, elem) => _compose(acc, elem), first);
  }
}
