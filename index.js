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
