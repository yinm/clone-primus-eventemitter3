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

})
