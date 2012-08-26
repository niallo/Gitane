var crypto = require('crypto')
var exec = require('child_process').exec
var fs = require('fs')
var path = require('path')
var os = require('os')
var Step = require('step')

var GIT_SSH_TEMPLATE = '#!/bin/sh\n' +
'exec ssh -i $key -o StrictHostKeyChecking=no "$$@"\n'

//
// Write the Git script template to enable use of the SSH private key
//
// *privKey* SSH private key.
// *file* (optional) filename of script.
// *cb* callback function of signature function(err, filename).
//
function writeTemplate(privKey, file, cb) {
  // No file name - generate a random one under the system temp dir
  if (!file) {
    var randomStr = crypto.randomBytes(4).toString('hex')
    var name = "_gitane" + randomStr + ".sh"
    file = path.join(os.tmpDir(), name)
  }

  var data = GIT_SSH_TEMPLATE.replace('$key', privKey)
  Step(
    function() {
      fs.writeFile(file, data, this)
    },
    function(err) {
      if (err) {
        return cb(err, null)
      }
      // make executable
      fs.chmod(file, '0755', this)

    },
    function(err) {
      if (err) {
        return cb(err, null)
      }

      return cb(null, file)
    }
  )
}

//
// Run a `git` process
//
// *baseDir* current working dir from which to execute git
// *privKey* SSH private key to use
// *cmd* command to run
//
function run(baseDir, privKey, cmd) {


}

module.exports = {
  run:run,
  writeTemplate:writeTemplate,
}
