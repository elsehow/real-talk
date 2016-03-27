# real-talk

a light protocol for encrypted, decrypting, signing and verifying JSON objects, with messages that can be easily serialized & sent over the wire (converted to/from Uint8Arrays underneath)

depends on [halite](https://github.com/elsehow/halite)

## installation

    npm install real-talk

## example

```javascript
var halite = require('halite')
var talk = require('real-talk')

// now i'll encrypt a message to you
var your_kp = halite.keypair()
var your_pubkey = halite.pk(your_kp)
var encrypted = talk.encrypted(o, my_kp, your_pubkey)
// now let's simulate a "round trip" by serializing it
var json = JSON.stringify(talk.stringify(encrypted))
// (we can send this json over the wire now)

// now you decrypt it
var parsed = talk.parse(JSON.parse(json))
var decrypted = talk.decrypt(parsed, your_kp, my_pubkey)

console.log(
  decrypted.from_pubkey === my_pubkey,
  decrypted.to_pubkey === your_pubkey,
  decrypted.body === o,
)
// > true true true
```

note that encrypted messages are [also authenticated](https://www.npmjs.com/package/tweetnacl)

## api

### talk.encrypted(obj, my_keypair, your_pubkey)

makes an object `{ ciphertext, from_pubkey, to_pubkey, nonce }`

## talk.decrypt(message, my_keypair

returns an object `{ body, from_pubkey, to_pubkey }` or null

### talk.unencrypted(obj, my_keypair)

makes an object `{ body, from_pubkey }`

```javascript
var my_kp = halite.keypair()

var o = {
  title: 'hi',
  post: 'whats up',
}

var post = talk.unencrypted(o, my_kp)

var my_pubkey = halite.pk(my_kp)
console.log(
  post.body === o,
  post.from_pubkey === my_pubkey,
)
// > true true

```

### talk.stringify(message)

turns encrypted or unencrypted messages into a format that can be `JSON.stringify`d

### talk.parse(stringified_message)

`talk.parse(talk.stringify(message)) === message`

## license

BSD
