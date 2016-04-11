'use strict';

const halite = require('halite')
const jsonb = require('json-buffer')
const toBuffer = require('typedarray-to-buffer')

function serialize (u8a) {
  return jsonb.stringify(toBuffer(u8a))
}

function unserialize (str) {
  return new Uint8Array(jsonb.parse(str))
}

function sign (obj, sk) {
  var str    = JSON.stringify(obj)
  var signed = halite.sign(str, sk)
  return signed
}

function verify (arr, pk) {
  var ver = halite.verify(arr, pk)
  var obj = null
  try {
    obj = JSON.parse(
      ver.replace(/\\'/g, "'")
    )
  } catch (e) {
    obj = {}
  }
  return obj
}

function transform (m, op) {
  function tr (key) {
    if (m[key])
      m[key] = op(m[key])
  }
  var keys = ['from_pubkey', 'to_pubkey', 'ciphertext', 'nonce', 'signed']
  keys.forEach(tr)
  return m
}

function stringify (m) {
  return JSON.stringify(transform(m, serialize))
}

function parse (m) {
  return transform(JSON.parse(m), unserialize)
}

module.exports = {

  keypair: halite.keypair,

  signKeypair: halite.signKeypair,

  serialize: serialize,

  unserialize: unserialize,

  stringify:stringify,

  parse: parse,

  // => { ciphertext, from_pubkey, to_pubkey, nonce }
  encrypted: (obj, from_keypair, to_pubkey) => {

    let cleartext = JSON.stringify(obj)
    let nonce = halite.makenonce()
    let from_sk = halite.sk(from_keypair)
    let from_pk = halite.pk(from_keypair)
    let ciphertext = halite.encrypt(cleartext, nonce, to_pubkey, from_sk)
    let o = {
    ciphertext: ciphertext,
      nonce: nonce,
      from_pubkey: from_pk,
      to_pubkey: to_pubkey,
    }

    return stringify(o)
  },


  // => { body, from_pubkey, to_pubkey }
  decrypt: (encrypted, keypair) => {
    encrypted = parse(encrypted)
    let to = encrypted.to_pubkey
    let from = encrypted.from_pubkey
    let nonce = encrypted.nonce
    let ctxt = encrypted.ciphertext
    let my_sk = halite.sk(keypair)
    try {
      let body = halite.decrypt(ctxt, nonce, from, my_sk)
      var v = {
        body: JSON.parse(body),
        from_pubkey: from,
        to_pubkey: to
      }
      return v ? v : null
    } catch (e) {
      return null
    }
  },

  signed: (o, kp) => {
    return stringify({
      signed: sign(o, halite.sk(kp)),
      from_pubkey: halite.pk(kp),
    })
  },

  verify: (str, pk) => {
    var p = parse(str)
    try {
      var v = {
        body: verify(p.signed, p.from_pubkey),
        from_pubkey: p.from_pubkey,
      }
      return v ? v : null
    } catch (e) {
      return null
    }
  },

}

