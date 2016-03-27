var test = require('tape')
var talk = require('.')
var halite = require('halite')

test('can serialize and unserialize uint8 arrays', t => {

  var kp = halite.keypair()
  // a uint8array
  var pubkey = halite.pk(kp)

  t.deepEquals(talk.unserialize(talk.serialize(pubkey)),
               pubkey,
               'pubkey should be equal to one thats been serialized, then unserialized'
              )
  t.end()
})

test('can make, encrypt, stringify, parse, and decrypt posts', t => {

  var my_kp = halite.keypair()

  var o = {
    title: 'hi',
    post: 'whats up',
  }

  var post = talk.unencrypted(o, my_kp)

  t.deepEqual(post.body, o, 'unencrypted post body is unencrypted')
  var my_pubkey = halite.pk(my_kp)
  t.deepEqual(post.from_pubkey, my_pubkey, 'my pubkey is good')

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

  t.deepEqual(my_pubkey, decrypted.from_pubkey)
  t.deepEqual(your_pubkey, decrypted.to_pubkey)
  t.deepEqual(o, decrypted.body, 'we decrypted everything correctly, even after serializing => jsonifying => json parsing => talk parsing')
  t.end()
})

