var crypto = require('crypto')
var exec = require('child_process').exec
var fs = require('fs')
var path = require('path')
var os = require('os')
var Step = require('step')

// Template string for wrapper script.
var GIT_SSH_TEMPLATE = '#!/bin/sh\n' +
'exec ssh -i $key -o StrictHostKeyChecking=no "$@"\n'

function mkTempFile(prefix, suffix) {
    var randomStr = crypto.randomBytes(4).toString('hex')
    var name = prefix + randomStr + suffix
    var file = path.join(os.tmpDir(), name)

    return file
}

//
// Write the Git script template to enable use of the SSH private key
//
// *privKey* SSH private key.
// *file* (optional) filename of script.
// *cb* callback function of signature function(err, tempateFile, keyFile).
//
function writeFiles(privKey, file, cb) {
  // No file name - generate a random one under the system temp dir
  if (!file) {
    file = mkTempFile("_gitane", ".sh")
  }

  var keyfile = mkTempFile("_gitaneid", ".key")

  var data = GIT_SSH_TEMPLATE.replace('$key', keyfile)
  Step(
    function() {
      fs.writeFile(file, data, this.parallel())
      fs.writeFile(keyfile, privKey, this.parallel())
    },
    function(err) {
      if (err) {
        return cb(err, null)
      }
      // make script executable
      fs.chmod(file, 0755, this.parallel())
      // make key secret
      fs.chmod(keyfile, 0600, this.parallel())
    },
    function(err) {
      if (err) {
        return cb(err, null)
      }

      return cb(null, file, keyfile)
    }
  )
}

//
// Run a command in a subprocess with GIT_SSH set to the correct value for
// SSH key.
//
// *baseDir* current working dir from which to execute git
// *privKey* SSH private key to use
// *cmd* command to run
// *cb* callback function of signature function(err, stdout, stderr)
//
function run(baseDir, privKey, cmd, cb) {

  Step(
    function() {
      writeFiles(privKey, null, this)
    },
    function(err, file, keyfile) {
      this.file = file
      this.keyfile = keyfile
      exec(cmd, {cwd: baseDir, env: {GIT_SSH: file}}, this)
    },
    function(err, stdout, stderr) {
      // cleanup temp files
      try {
        fs.unlink(this.file)
        fs.unlink(this.keyfile)
      } catch(e) {}

      cb(err, stdout, stderr)

    }
  )
}

//
// convenience wrapper for clone. maybe add more later.
//
function clone(args, baseDir, privKey, cb) {
  run(baseDir, privKey, "git clone " + args, cb)
}

module.exports = {
  clone:clone,
  run:run,
  writeFiles:writeFiles,
}

