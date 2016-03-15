const createBlobStore = require('content-addressable-blob-store')
const createHttpBlobServer = require('./')

const port = process.env.PORT || 4000

createHttpBlobServer({
  store: createBlobStore()
}).listen(port, function () {
  console.log(`http blob service listening on ${port}.`)
})
