var expect = require('chai').expect
var fs = require('fs')
var gitane = require('../index')
var os = require('os')

describe('gitane', function() {

  describe('#run', function() {

    it('should run the command with correct GIT_SSH environment', function(done) {
      var testkey = 'testkey'

      gitane.run(process.cwd(), testkey, 'env', function(err, stdout, stderr) {
        expect(err).to.be.null
        expect(stdout).to.match(/GIT_SSH=.*_gitane.*\.sh/)
        done()
      })
    })

    it('should run the command in the correct baseDir', function(done) {
      var testkey = 'testkey'

      gitane.run(os.tmpDir(), testkey, 'pwd', function(err, stdout, stderr) {
        expect(err).to.be.null
        expect(fs.realpathSync(stdout.trim())).to.eql(fs.realpathSync(os.tmpDir()))
        done()
      })
    })

  }),

  describe('#writeFiles', function() {

    it('should create a random file if none specified', function(done) {

      gitane.writeFiles('testkey', null, function(err, file, keyfile) {
        expect(err).to.be.null
        expect(file).to.be.a('string')
        expect(file).to.match(/_gitane/)
        var data = fs.readFileSync(file, 'utf8')
        expect(data).to.match(/exec ssh -i/)

        var key = fs.readFileSync(keyfile, 'utf8')
        expect(key).to.eql('testkey')
        fs.unlinkSync(file)
        fs.unlinkSync(keyfile)

        done()
      })

    })

    it('should use passed-in file if specified', function(done) {
      var filename = "_testfile"

      gitane.writeFiles('testkey', filename, function(err, file, keyfile) {
        expect(file).to.eql(filename)
        expect(err).to.be.null
        var data = fs.readFileSync(file, 'utf8')
        expect(data).to.match(/exec ssh -i/)
        var key = fs.readFileSync(keyfile, 'utf8')
        expect(key).to.eql('testkey')

        fs.unlinkSync(file)
        fs.unlinkSync(keyfile)

        done()
      })

    })

    it('should create an executable script and an 0600-mode key by default', function(done) {
      var filename = "_testfile"

      gitane.writeFiles('testkey', filename, function(err, file, keyfile) {
        expect(file).to.eql(filename)
        expect(err).to.be.null

        var stats = fs.statSync(file)

        // Note we must convert to octal ourselves.
        expect(stats.mode.toString(8)).to.eql('100755')

        fs.unlinkSync(file)

        var stats = fs.statSync(keyfile)

        // Note we must convert to octal ourselves.
        expect(stats.mode.toString(8)).to.eql('100600')

        fs.unlinkSync(keyfile)

        done()
      })

    })

    it('should create an executable script and honour keyMode param', function(done) {
      var filename = "_testfile"

      gitane.writeFiles('testkey', filename, 0744, function(err, file, keyfile) {
        expect(file).to.eql(filename)
        expect(err).to.be.null

        var stats = fs.statSync(file)

        // Note we must convert to octal ourselves.
        expect(stats.mode.toString(8)).to.eql('100755')

        fs.unlinkSync(file)

        var stats = fs.statSync(keyfile)

        // Note we must convert to octal ourselves.
        expect(stats.mode.toString(8)).to.eql('100744')

        fs.unlinkSync(keyfile)

        done()
      })

    })

  })

})





