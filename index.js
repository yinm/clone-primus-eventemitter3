'use strict'

const has = Object.prototype.hasOwnProperty
let prefix = '~'

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */
function Events() {}

/**
 * We try to not inherit from `Object.prototype`. In some engines creating an
 * instance in this way is faster than calling `Object.create(null)` directly.
 * If `Object.create(null)` is not supported we prefix the event names with a
 * character to make sure that the built-in object properties are not
 * overridden or used as an attack vector.
 */
if (Object.create) {
  Events.prototype = Object.create(null)

  /**
   * This hack is needed because the `_proto_` property is still inherited in
   * some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
   */
  if (!new Events().__proto__) prefix = false
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */
function EE(fn, context, once) {
  this.fn = fn
  this.context = context
  this.once = once || false
}

/**
 * Add a listener for a given event.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {EventEmitter}
 * @private
 */
function addListener(emitter, event, fn, context, once) {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function')
  }

  const listener = new EE(fn, context || emitter, once)
  const evt = prefix ? prefix + event : event

  if (!emitter._events[evt]) {
    emitter._events[evt] = listener
    emitter._eventsCount++
  } else if (!emitter._events[evt].fn) {
    emitter._events[evt].push(listener)
  } else {
    emitter._events[evt] = [emitter._events[evt], listener]
  }

  return emitter
}

/**
 * Clear event by name.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */
function clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) {
    emitter._events = new Events()
  } else {
    delete emitter._events[evt]
  }
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */
function EventEmitter() {
  this._events = new Events()
  this._eventsCount = 0
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @public
 */
EventEmitter.prototype.eventNames = function () {
  let names = []
  let events
  let name

  if (this._eventsCount === 0) return names

  for (name in (events = this._events)) {
    if (has.call(events, name)) {
      names.push(prefix ? name.slice[1] : name)
    }
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events))
  }

  return names
}

/**
 * Return the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Array} The registered listeners.
 * @public
 */
EventEmitter.prototype.listeners = function(event) {
  const evt = prefix ? prefix + event : event
  const handlers = this._events[evt]

  if (!handlers) {
    return []
  }

  if (handlers.fn) {
    return [handlers.fn]
  }

  for (let i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
    ee[i] = handlers[i].fn
  }

  return ee
}

/**
 * Return the number of listeners listening to a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Number} The number of listeners.
 * @public
 */
EventEmitter.prototype.listenerCount = function(event) {
  const evt = prefix ? prefix + event : event
  const listeners = this._events[evt]

  if (!listeners) {
    return 0
  }

  if (listeners.fn) {
    return 1
  }

  return listeners.length
}
