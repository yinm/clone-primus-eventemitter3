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

})
