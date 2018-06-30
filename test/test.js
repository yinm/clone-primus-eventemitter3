describe('EventEmitter', function tests() {
  'use strict';

  var EventEmitter = require('../')
    , assume = require('assume');

  it('exposes a `prefixed` property', function () {
    assume(EventEmitter.prefixed).is.either([false, '~']);
  });

  it('exposes a module namespace object', function() {
    assume(EventEmitter.EventEmitter).equals(EventEmitter);
  });

  it('inherits when used with `require("util").inherits`', function () {
    function Beast() {
      EventEmitter.call(this);
    }

    require('util').inherits(Beast, EventEmitter);

    var moop = new Beast()
      , meap = new Beast();

    assume(moop).is.instanceOf(Beast);
    assume(moop).is.instanceOf(EventEmitter);

    moop.listeners();
    meap.listeners();

    moop.on('data', function () {
      throw new Error('I should not emit');
    });

    meap.emit('data', 'rawr');
    meap.removeListener('foo');
    meap.removeAllListeners();
  });

  if ('undefined' !== typeof Symbol) it('works with ES6 symbols', function (next) {
    var e = new EventEmitter()
      , event = Symbol('cows')
      , unknown = Symbol('moo');

    e.on(event, function foo(arg) {
      assume(e.listenerCount(unknown)).equals(0);
      assume(e.listeners(unknown)).deep.equals([]);
      assume(arg).equals('bar');

      function bar(onced) {
        assume(e.listenerCount(unknown)).equals(0);
        assume(e.listeners(unknown)).deep.equals([]);
        assume(onced).equals('foo');
        next();
      }

      e.once(unknown, bar);

      assume(e.listenerCount(event)).equals(1);
      assume(e.listeners(event)).deep.equals([foo]);
      assume(e.listenerCount(unknown)).equals(1);
      assume(e.listeners(unknown)).deep.equals([bar]);

      e.removeListener(event);

      assume(e.listenerCount(event)).equals(0);
      assume(e.listeners(event)).deep.equals([]);
      assume(e.emit(unknown, 'foo')).equals(true);
    });

    assume(e.emit(unknown, 'bar')).equals(false);
    assume(e.emit(event, 'bar')).equals(true);
  });

  describe('EventEmitter#emit', function () {
    it('should return false when there are not events to emit', function () {
      var e = new EventEmitter();

      assume(e.emit('foo')).equals(false);
      assume(e.emit('bar')).equals(false);
    });

    it('emits with context', function (done) {
      var context = { bar: 'baz' }
        , e = new EventEmitter();

      e.on('foo', function (bar) {
        assume(bar).equals('bar');
        assume(this).equals(context);

        done();
      }, context).emit('foo', 'bar');
    });

    it('emits with context, multiple arguments (force apply)', function (done) {
      var context = { bar: 'baz' }
        , e = new EventEmitter();

      e.on('foo', function (bar) {
        assume(bar).equals('bar');
        assume(this).equals(context);

        done();
      }, context).emit('foo', 'bar', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0);
    });

    it('can emit the function with multiple arguments', function () {
      var e = new EventEmitter();

      for (var i = 0; i < 100; i++) {
        (function (j) {
          for (var i = 0, args = []; i < j; i++) {
            args.push(j);
          }

          e.once('args', function () {
            assume(arguments.length).equals(args.length);
          });

          e.emit.apply(e, ['args'].concat(args));
        })(i);
      }
    });

    it('can emit the function with multiple arguments, multiple listeners', function () {
      var e = new EventEmitter();

      for (var i = 0; i < 100; i++) {
        (function (j) {
          for (var i = 0, args = []; i < j; i++) {
            args.push(j);
          }

          e.once('args', function () {
            assume(arguments.length).equals(args.length);
          });

          e.once('args', function () {
            assume(arguments.length).equals(args.length);
          });

          e.once('args', function () {
            assume(arguments.length).equals(args.length);
          });

          e.once('args', function () {
            assume(arguments.length).equals(args.length);
          });

          e.emit.apply(e, ['args'].concat(args));
        })(i);
      }
    });

    it('emits with context, multiple listeners (force loop)', function () {
      var e = new EventEmitter();

      e.on('foo', function (bar) {
        assume(this).eqls({ foo: 'bar' });
        assume(bar).equals('bar');
      }, { foo: 'bar' });

      e.on('foo', function (bar) {
        assume(this).eqls({ bar: 'baz' });
        assume(bar).equals('bar');
      }, { bar: 'baz' });

      e.emit('foo', 'bar');
    });

    it('emits with different contexts', function () {
      var e = new EventEmitter()
        , pattern = '';

      function writer() {
        pattern += this;
      }

      e.on('write', writer, 'foo');
      e.on('write', writer, 'baz');
      e.once('write', writer, 'bar');
      e.once('write', writer, 'banana');

      e.emit('write');
      assume(pattern).equals('foobazbarbanana');
    });

    it('should return true when there are events to emit', function () {
      var e = new EventEmitter()
        , called = 0;

      e.on('foo', function () {
        called++;
      });

      assume(e.emit('foo')).equals(true);
      assume(e.emit('foob')).equals(false);
      assume(called).equals(1);
    });

    it('receives the emitted events', function (done) {
      var e = new EventEmitter();

      e.on('data', function (a, b, c, d, undef) {
        assume(a).equals('foo');
        assume(b).equals(e);
        assume(c).is.instanceOf(Date);
        assume(undef).equals(undefined);
        assume(arguments.length).equals(3);

        done();
      });

      e.emit('data', 'foo', e, new Date());
    });

    it('emits to all event listeners', function () {
      var e = new EventEmitter()
        , pattern = [];

      e.on('foo', function () {
        pattern.push('foo1');
      });

      e.on('foo', function () {
        pattern.push('foo2');
      });

      e.emit('foo');

      assume(pattern.join(';')).equals('foo1;foo2');
    });

    (function each(keys) {
      var key = keys.shift();

      if (!key) return;

      it('can store event which is a known property: '+ key, function (next) {
        var e = new EventEmitter();

        e.on(key, function (k) {
          assume(k).equals(key);
          next();
        }).emit(key, key);
      });

      each(keys);
    })([
      'hasOwnProperty',
      'constructor',
      '__proto__',
      'toString',
      'toValue',
      'unwatch',
      'watch'
    ]);
  });

  describe('EventEmitter#listeners', () => {
    it('returns an empty if no listeners are specified', () => {
      let e = new EventEmitter()

      assume(e.listeners('foo')).is.a('array')
      assume(e.listeners('foo').length).equals(0)
    })

    it('returns an array of function', () => {
      let e = new EventEmitter()

      function foo() {}

      e.on('foo', foo)
      assume(e.listeners('foo')).is.a('array')
      assume(e.listeners('foo').length).equals(1)
      assume(e.listeners('foo')).deep.equals([foo])
    })

    it('is not vulnerable to modifications', () => {
      let e = new EventEmitter()

      function foo() {}

      e.on('foo', foo)

      assume(e.listeners('foo')).deep.equals([foo])

      e.listeners('foo').length = 0
      assume(e.listeners('foo')).deep.equals([foo])
    })
  })

  describe('EventEmitter#listenerCount', () => {
    it('returns the number of listeners for a given event', () => {
      let e = new EventEmitter()

      assume(e.listenerCount()).equals(0)
      assume(e.listenerCount('foo')).equals(0)

      e.on('foo', () => {})
      assume(e.listenerCount('foo')).equals(1)
      e.on('foo', () => {})
      assume(e.listenerCount('foo')).equals(2)
    })
  })

  describe('EventEmitter#on', () => {
    it('throws an error if the listener is not a function', () => {
      let e = new EventEmitter()

      try {
        e.on('foo', 'bar')
      } catch (ex) {
        assume(ex).is.instanceOf(TypeError)
        assume(ex.message).equals('The listener must be a function')
        return
      }

      throw new Error('oops')
    })
  })

  describe('EventEmitter#once', () => {
    it('only emits it once', () => {
      let e = new EventEmitter()
      let calls = 0

      e.once('foo', () => {
        calls++
      })

      e.emit('foo')
      e.emit('foo')

      assume(e.listeners('foo').length).equals(0)
      assume(calls).equals(1)
    })

    it('only emits once if emits are nested inside the listener', () => {
      let e = new EventEmitter()
      let calls = 0

      e.once('foo', () => {
        calls++
        e.emit('foo')
      })

      e.emit('foo')
      assume(e.listeners('foo').length).equals(0)
      assume(calls).equals(1)
    })

    it('only emits once for multiple events', () => {
      let e = new EventEmitter()
      let multi = 0
      let foo = 0
      let bar = 0

      e.once('foo', () => {
        foo++
      })

      e.once('foo', () => {
        bar++
      })

      e.on('foo', () => {
        multi++
      })

      e.emit('foo')
      e.emit('foo')
      e.emit('foo')
      e.emit('foo')
      e.emit('foo')

      assume(e.listeners('foo').length).equals(1)
      assume(multi).equals(5)
      assume(foo).equals(1)
      assume(bar).equals(1)
    })

    it('only emits once with context', (done) => {
      const context = { foo: 'bar' }
      let e = new EventEmitter()

      e.once('foo', function(bar) {
        assume(this).equals(context)
        assume(bar).equals('bar')

        done()
      }, context).emit('foo', 'bar')
    })
  })

});
