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

})
