import {expect} from 'chai';
import {Lens} from './lens';

describe('Lens', () => {
  type Child1 = Readonly<{
    stuff: string;
  }>;

  type Child2 = Readonly<{
    data: number;
    child1: Child1;
  }>;

  type Wrapper = Readonly<{
    toplevel: string;
    child1: Child1;
    child2: Child2;
  }>;

  let wrapper: Wrapper;

  beforeEach(() => {
    wrapper = {
      child1: { stuff: 'stuff' },
      child2: { data: 123, child1: { stuff: 'other stuff' } },
      toplevel: 'top'
    };
  });

  describe('Lens.update()', () => {
    it('should update a value using a shallow lens', () => {
      const lens: Lens<Wrapper, string> = {
        get: wrapper => wrapper.toplevel,
        set: toplevel => wrapper => ({...wrapper, toplevel})
      };

      const result = Lens.update(lens)(s => s.toUpperCase())(wrapper);

      expect(result).to.eql({
        child1: { stuff: 'stuff' },
        child2: { data: 123, child1: { stuff: 'other stuff' } },
        toplevel: 'TOP'
      });
    });

    it('should update a nested value using a deep lens', () => {
      const lens: Lens<Wrapper, number> = {
        get: wrapper => wrapper.child2.data,
        set: data => wrapper => ({
          ...wrapper,
          child2: {
            ...wrapper.child2,
            data
          }
        })
      };

      const result = Lens.update(lens)(n => n + 1000)(wrapper);

      expect(result).to.eql({
        child1: { stuff: 'stuff' },
        child2: { data: 1123, child1: { stuff: 'other stuff' } },
        toplevel: 'top'
      });
    });
  });

  describe('Lens.compose()', () => {
    let wrapperToChild1: Lens<Wrapper, Child1>;
    let child1ToStuff: Lens<Child1, string>;

    beforeEach(() => {
      wrapperToChild1 = {
        get: wrapper => wrapper.child1,
        set: child1 => wrapper => ({...wrapper, child1})
      };

      child1ToStuff = {
        get: child1 => child1.stuff,
        set: stuff => child1 => ({...child1, stuff})
      };

    });

    it('should be able to get using the composed lens (curried version)', () => {
      const wrapperToStuff = Lens.compose(child1ToStuff)(wrapperToChild1);
      const result = wrapperToStuff.get(wrapper);
      expect(result).to.eql('stuff');
    });

    it('should be able to set using the composed lens (curried version)', () => {
      const wrapperToStuff = Lens.compose(child1ToStuff)(wrapperToChild1);
      const result = wrapperToStuff.set('new stuff')(wrapper);
      expect(result).to.eql({
        child1: { stuff: 'new stuff' },
        child2: { data: 123, child1: { stuff: 'other stuff' } },
        toplevel: 'top'
      });
    });

    it('should be able to get using the composed lens (non-curried version)', () => {
      const wrapperToStuff = Lens.compose(wrapperToChild1, child1ToStuff);
      const result = wrapperToStuff.get(wrapper);
      expect(result).to.eql('stuff');
    });

    it('should be able to set using the composed lens (non-curried version)', () => {
      const wrapperToStuff = Lens.compose(wrapperToChild1, child1ToStuff);
      const result = wrapperToStuff.set('new stuff')(wrapper);
      expect(result).to.eql({
        child1: { stuff: 'new stuff' },
        child2: { data: 123, child1: { stuff: 'other stuff' } },
        toplevel: 'top'
      });
    });

    it('should be able to compose 3 lenses', () => {
      const wrapperToChild2: Lens<Wrapper, Child2> = {
        get: wrapper => wrapper.child2,
        set: child2 => wrapper => ({...wrapper, child2})
      };

      const child2ToChild1: Lens<Child2, Child1> = {
        get: child2 => child2.child1,
        set: child1 => child2 => ({...child2, child1})
      };

      const child1ToStuff: Lens<Child1, string> = {
        get: child1 => child1.stuff,
        set: stuff => child1 => ({...child1, stuff})
      };

      const wrapperToInternalStuff: Lens<Wrapper, string> = Lens.compose(
        wrapperToChild2,
        child2ToChild1,
        child1ToStuff
      );

      const getResult = wrapperToInternalStuff.get(wrapper);
      expect(getResult).to.equal('other stuff');

      const setResult = wrapperToInternalStuff.set('bla bla')(wrapper);
      expect(setResult).to.eql({
        child1: { stuff: 'stuff' },
        child2: { data: 123, child1: { stuff: 'bla bla' } },
        toplevel: 'top'
      });
    });

    const snd = <A, B> (): Lens<[A, B], B> => ({
      get: (data: [A, B]): B => data[1],
      set: (value: B) => (data: [A, B]) => [data[0], value]
    });

    it('should be able to compose 4 lenses', () => {
      type Data = [number, [number, [number, [number, string]]]];
      const data: Data = [1, [2, [3, [4, 'bla']]]];
      const composedLens = Lens.compose(snd(), snd(), snd(), snd());

      const getResult = composedLens.get(data);
      expect(getResult).to.equal('bla');

      const setResult = composedLens.set('bla bla')(data);
      expect(setResult).to.eql([1, [2, [3, [4, 'bla bla']]]]);
    });

    it('should be able to compose 5 lenses', () => {
      type Data = [number, [number, [number, [number, [number, string]]]]];
      const data: Data = [1, [2, [3, [4, [5, 'bla']]]]];
      const composedLens = Lens.compose(snd(), snd(), snd(), snd(), snd());

      const getResult = composedLens.get(data);
      expect(getResult).to.equal('bla');

      const setResult = composedLens.set('bla bla')(data);
      expect(setResult).to.eql([1, [2, [3, [4, [5, 'bla bla']]]]]);
    });

    it('should be able to compose 6 lenses', () => {
      type Data = [number, [number, [number, [number, [number, [number, string]]]]]];
      const data: Data = [1, [2, [3, [4, [5, [6, 'bla']]]]]];
      const composedLens = Lens.compose(snd(), snd(), snd(), snd(), snd(), snd());

      const getResult = composedLens.get(data);
      expect(getResult).to.equal('bla');

      const setResult = composedLens.set('bla bla')(data);
      expect(setResult).to.eql([1, [2, [3, [4, [5, [6, 'bla bla']]]]]]);
    });

    it('should be able to compose 7 lenses', () => {
      type Data = [number, [number, [number, [number, [number, [number, [number, string]]]]]]];
      const data: Data = [1, [2, [3, [4, [5, [6, [7, 'bla']]]]]]];
      const composedLens = Lens.compose(snd(), snd(), snd(), snd(), snd(), snd(), snd());

      const getResult = composedLens.get(data);
      expect(getResult).to.equal('bla');

      const setResult = composedLens.set('bla bla')(data);
      expect(setResult).to.eql([1, [2, [3, [4, [5, [6, [7, 'bla bla']]]]]]]);
    });

    it('should be able to compose 8 lenses', () => {
      type Data = [
        number, [number, [number, [number, [number, [number, [number, [number, string]]]]]]]
      ];
      const data: Data = [1, [2, [3, [4, [5, [6, [7, [8, 'bla']]]]]]]];
      const composedLens = Lens.compose(snd(), snd(), snd(), snd(), snd(), snd(), snd(), snd());

      const getResult = composedLens.get(data);
      expect(getResult).to.equal('bla');

      const setResult = composedLens.set('bla bla')(data);
      expect(setResult).to.eql([1, [2, [3, [4, [5, [6, [7, [8, 'bla bla']]]]]]]]);
    });

    it('should be able to compose 9 lenses', () => {
      type Data = [
        number, [
          number, [number, [number, [number, [number, [number, [number, [number, string]]]]]]]
        ]
      ];
      const data: Data = [1, [2, [3, [4, [5, [6, [7, [8, [9, 'bla']]]]]]]]];
      const composedLens = Lens.compose(snd(), snd(), snd(), snd(), snd(), snd(), snd(), snd(), snd());

      const getResult = composedLens.get(data);
      expect(getResult).to.equal('bla');

      const setResult = composedLens.set('bla bla')(data);
      expect(setResult).to.eql([1, [2, [3, [4, [5, [6, [7, [8, [9, 'bla bla']]]]]]]]]);
    });

    it('should be able to compose 10 lenses', () => {
      type Data = [ number, [ number, [
        number, [number, [number, [number, [number, [number, [number, [number, string]]]]]]]
      ] ] ];
      const data: Data = [1, [2, [3, [4, [5, [6, [7, [8, [9, [10, 'bla']]]]]]]]]];
      const composedLens = Lens.compose(snd(), snd(), snd(), snd(), snd(), snd(), snd(), snd(), snd(), snd());

      const getResult = composedLens.get(data);
      expect(getResult).to.equal('bla');

      const setResult = composedLens.set('bla bla')(data);
      expect(setResult).to.eql([1, [2, [3, [4, [5, [6, [7, [8, [9, [10, 'bla bla']]]]]]]]]]);
    });
  });
});
