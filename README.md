# real-talk

a light protocol for encrypting & decrypting, or verifying & signing, JSON objects.

the focus is on payloads that can be sent over the wire without any transformations. 

## install

    npm install real-talk

## use

### encrypt / decrypt

```javascript
var talk = require('real-talk')

var o = {
  muy: 'buena',
  onda: null,
}

var myKeypair = talk.keypair()
var yourKeypair = talk.keypair()
var encrypted = talk.encrypted(o, myKeypair, yourKeypair.publicKey)
var decrypted = talk.decrypt(encrypted, yourKeypair)

console.log(decrypted.body)
// > { muy: 'buena', onda: 'null' }
```

### sign / verify

```javascript
var talk = require('real-talk')

var o = {
  muy: 'buena',
  onda: null,
}
var sign_kp = talk.signKeypair()
var signed = talk.signed(o, sign_kp)
console.log(typeof signed)
// > 'string'
talk.verify(signed.body)
// > { muy: 'buena', onda: 'null' }
```

note that encrypted messages are [also authenticated](https://www.npmjs.com/package/tweetnacl)

## encrypt / decrypt api

### talk.keypair()

returns a nacl keypair `{publicKey, secretKey}` for encryting and decrypting 

### talk.encrypted(obj, my_keypair, your_pubkey)

returns a string

### talk.decrypt(str, my_keypair

returns an object `{ body, from_pubkey, to_pubkey }` or `null`

## sign / verify api

### talk.signKeypair()

returns a nacl keypair `{publicKey, secretKey}` for signing and verifying

### talk.sign(obj, my_keypair)

returns a string

### talk.verify(str)

returns an object `{body, from_keypair}` or `null`

## utility api

### talk.serialize(u8a)

turn a Uint8Array into a string

### talk.unserialize(str)

turn a string produced by `talk.serialize` into a Uint8Array

## license

BSD
