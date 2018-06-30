describe('EventEmitter', () => {
  'use strict'

  const EventEmitter = require('../')
  const assume = require('assume')

  it('exposes a `prefixed` property', () => {
    assume(EventEmitter.prefixed).is.either([false, '~'])
  })

  it('expose a module namespace object', () => {
    assume(EventEmitter.EventEmitter).equals(EventEmitter)
  })

  it('inherits when used with `require("util").inherits', () => {
    function Beast() {
      EventEmitter.call(this)
    }

    require('util').inherits(Beast, EventEmitter)

    let moop = new Beast()
    let meap = new Beast()

    assume(moop).is.instanceOf(Beast)
    assume(moop).is.instanceOf(EventEmitter)

    moop.listeners()
    meap.listeners()

    moop.on('data', () => {
      throw new Error('I should not emit')
    })

    meap.emit('data', 'rawr')
    meap.removeListener('foo')
    meap.removeAllListeners()
  })

  if ('undefined' !== typeof Symbol) it('works with ES6 symbols', (next) => {
    let e = new EventEmitter()
    const event = Symbol('cows')
    const unknown = Symbol('moo')

    e.on(event, function foo(arg) {
      assume(e.listenerCount(unknown)).equals(0)
      assume(e.listeners(unknown)).deep.equals([])
      assume(arg).equals('bar')

      function bar(onced) {
        assume(e.listenerCount(unknown)).equals(0)
        assume(e.listeners(unknown)).deep.equals([])
        assume(onced).equals('foo')
        next()
      }

      e.once(unknown, bar)

      assume(e.listenerCount(event)).equals(1)
      assume(e.listeners(event)).deep.equals([foo])
      assume(e.listenerCount(unknown)).equals(1)
      assume(e.listeners(unknown)).deep.equals([bar])

      e.removeListener(event)

      assume(e.listenerCount(event)).equals(0)
      assume(e.listeners(event)).deep.equals([])
      assume(e.emit(unknown, 'foo')).equals(true)
    })

    assume(e.emit(unknown, 'bar')).equals(false)
    assume(e.emit(event, 'bar')).equals(true)
  })

  describe('EventEmitter#emit', () => {
    it('should return false when there are not events to emit', () => {
      let e = new EventEmitter()

      assume(e.emit('foo')).equals(false)
      assume(e.emit('bar')).equals(false)
    })

    it('emits with context', (done) => {
      const context = { bar: 'baz' }
      let e = new EventEmitter()

      e.on('foo', function(bar) {
        assume(bar).equals('bar')
        assume(this).equals(context)

        done()
      }, context).emit('foo', 'bar')
    })

    it('emits with context, multiple arguments (force apply)', (done) => {
      const context = { bar: 'baz' }
      let e = new EventEmitter()

      e.on('foo', function(bar) {
        assume(bar).equals('bar')
        assume(this).equals(context)

        done()
      }, context).emit('foo', 'bar', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0)
    })

    it('can emit the function with multiple arguments', () => {
      let e = new EventEmitter()

      for (let i = 0; i < 100; i++) {
        (function(j) {
          let args = []
          for (let k = 0; k < j; k++) {
            args.push(j)
          }

          e.once('args', function() {
            assume(arguments.length).equals(args.length)
          })

          e.emit.apply(e, ['args'].concat(args))
        })(i)
      }
    })

    it('can emit the function with multiple arguments, multiple listeners', function () {
      let e = new EventEmitter()

      for (var i = 0; i < 100; i++) {
        (function (j) {
          for (var i = 0, args = []; i < j; i++) {
            args.push(j)
          }

          e.once('args', function() {
            assume(arguments.length).equals(args.length)
          })

          e.once('args', function() {
            assume(arguments.length).equals(args.length)
          })

          e.once('args', function() {
            assume(arguments.length).equals(args.length)
          })

          e.once('args', function() {
            assume(arguments.length).equals(args.length)
          })

          e.emit.apply(e, ['args'].concat(args))
        })(i)
      }
    })

    it('emits with context, multiple listeners (force loop)', () => {
      let e = new EventEmitter()

      e.on('foo', function(bar) {
        assume(this).eqls({ foo: 'bar' })
        assume(bar).equals('bar')
      }, { foo: 'bar' })

      e.on('foo', function(bar) {
        assume(this).eqls({ bar: 'baz' })
        assume(bar).equals('bar')
      }, { bar: 'baz' })

      e.emit('foo', 'bar')
    })

    it('emits with different contexts', () => {
      let e = new EventEmitter()
      let pattern = ''

      function writer() {
        pattern += this
      }

      e.on('write', writer, 'foo')
      e.on('write', writer, 'baz')
      e.once('write', writer, 'bar')
      e.once('write', writer, 'banana')

      e.emit('write')
      assume(pattern).equals('foobazbarbanana')
    })

    it('should return true when there are events to emit', () => {
      let e = new EventEmitter()
      let called = 0

      e.on('foo', () => {
        called++
      })

      assume(e.emit('foo')).equals(true)
      assume(e.emit('foob')).equals(false)
      assume(called).equals(1)
    })

  })

})
