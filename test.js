var test = require('tape')
var talk = require('.')
var my_kp = talk.keypair()
var your_kp = talk.keypair()
var my_pubkey = my_kp.publicKey
var your_pubkey = your_kp.publicKey

var o = {
  title: 'hi',
  post: 'whats up',
}

test('can serialize and unserialize uint8 arrays', t => {
  t.deepEquals(
    talk.unserialize(talk.serialize(my_pubkey)),
    my_pubkey,
    'pubkey should be equal to one thats been serialized, then unserialized')
  t.end()
})

test('can make, encrypt, stringify, parse, and decrypt posts', t => {
  // now i'll encrypt a message to you
  var encrypted = talk.encrypted(o, my_kp, your_pubkey)
  t.deepEqual(typeof encrypted, 'string', 'encrypted message is a string')
  var decrypted = talk.decrypt(encrypted, your_kp)
  t.deepEqual(my_pubkey, decrypted.from_pubkey)
  t.deepEqual(your_pubkey, decrypted.to_pubkey)
  t.deepEqual(o, decrypted.body, 'we decrypted everything correctly, even after serializing => jsonifying => json parsing => talk parsing')
  t.end()
})


test('can make signed posts and verify them', t => {
  var sign_kp = talk.signKeypair()
  var signed = talk.signed(o, sign_kp)
  t.deepEqual(typeof signed, 'string', 'encrypted message is a string')
  t.deepEqual(talk.verify(signed).body, o, 'can sign and verify')
  t.deepEqual(talk.verify(signed).from_pubkey, sign_kp.publicKey, 'can sign and verify')
  t.end()
})

// TODO arguablly everything should be string (maybe base64) that we can just send over the wire
