'use strict';

const halite = require('halite')
const jsonb = require('json-buffer')
const toBuffer = require('typedarray-to-buffer')

// this package makes json-serializeable objects
// of the form
//
//   { ciphertext, from_pubkey, to_pubkey, nonce }
//
// or
//
//   { body, from_pubkey }
//
// these objects are intended to go in the `value` field
// of a hyperlog node. encrypted and unencrypted objects are
// generated methods `encrypted` and `unencrypted` , below
//
// additionally, we provide a decryption function
//
//   decrypt (encrypted)
//
// which returns an object
//
//   { body, from_pubkey, to_pubkey }
//

function serialize (u8a) {
  return jsonb.stringify(toBuffer(u8a))
}

function unserialize (str) {
  return new Uint8Array(jsonb.parse(str))
}

function transform (m, op) {
  function tr (key) {
    if (m[key])
      m[key] = op(m[key])
  }
  var keys = ['from_pubkey', 'to_pubkey', 'ciphertext', 'nonce']
  keys.forEach(tr)
  return m
}

module.exports = {

  serialize: serialize,

  unserialize: unserialize,
  
  stringify: (m) => {
    return transform(m, serialize)
  },

  parse: (m) => {
    return transform(m, unserialize)
  },

  // => { body, from_pubkey }
  unencrypted:  (obj, my_keypair) => {
    return {
      body: obj,
      from_pubkey: halite.pk(my_keypair),
    }
  },

  // => { ciphertext, from_pubkey, to_pubkey, nonce }
  encrypted: (obj, from_keypair, to_pubkey) => {

    let cleartext = JSON.stringify(obj)
    let nonce = halite.makenonce()
    let from_sk = halite.sk(from_keypair)
    let from_pk = halite.pk(from_keypair)
    let ciphertext = halite.encrypt(cleartext,
                                    nonce,
                                    to_pubkey,
                                    from_sk)
    return {
    ciphertext: ciphertext,
      nonce: nonce,
      from_pubkey: from_pk,
      to_pubkey: to_pubkey,
    }
  },

  // => { body, from_pubkey, to_pubkey }
  decrypt: (encrypted, keypair) => {
    let to = encrypted.to_pubkey
    let from = encrypted.from_pubkey
    let nonce = encrypted.nonce
    let ctxt = encrypted.ciphertext
    let my_sk = halite.sk(keypair)
    let body = halite.decrypt(ctxt,
                              nonce,
                              from,
                              my_sk)
    return {
      body: JSON.parse(body),
      from_pubkey: from,
      to_pubkey: to
    }
  },

}

