const Router = require('server-router')
const createHttpServer = require('http').createServer
const readChunk = require('first-chunk-stream')
const fileType = require('file-type')

module.exports = createHttpBlobServer
 
function createHttpBlobServer (options) {
  options = options || {}

  var store = options.store
  if (store == null) {
    throw new Error('http-blob: options.store is required.')
  }

  var renders = options.renders || {}

  const router = Router('/404')
  router.on('/', {
    get: function (req, res) {
      res.end('hello world')
    },
    post: function (req, res, params) {
      var blob = store.createWriteStream(function (err, metadata) {
        res.setHeader('content-type', 'application/json')
        res.statusCode = 201
        res.statusMessage = 'Created'
        res.end(JSON.stringify(metadata, null, 2))
      })
      req.pipe(blob)
    }
  })

  router.on('/:key', {
    get: function (req, res, params) {
      var blob = store.createReadStream(params)
      var reqContentType = req.headers.accept

      if (isSameContentType(reqContentType, 'text/html')) {
        blob = blob.pipe(readChunk({ chunkLength: 262 }, (err, chunk, enc, cb) => {
          cb(err)
          var resFileType = fileType(chunk)
          var resContentType = resFileType.mime
          var render = renders[resContentType]
          res.setHeader('content-type', 'text/html')
          res.statusCode = 200
          res.statusMessage = 'OK'
          render(req, blob).pipe(res)
        }))
      } else {
        blob.pipe(res)
      }
    },
    /*
    head: function (req, res, params) {
      store.exists(params, res.end)
    },
    delete: function (req, res, params) {
      res.statusCode = 204
      res.statusMessage = 'No Content'
      store.remove(params, res.end)
    }
    */
  })

  router.on('/404', function (req, res) {
    res.end('404')
  })

  return createHttpServer(router)
}
