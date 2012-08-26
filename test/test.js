var expect = require('chai').expect
var fs = require('fs')
var gitane = require('../index')

describe('gitane', function() {

  describe('#writeTemplate', function() {

    it('should create a random file if none specified', function(done) {

      gitane.writeTemplate('testkey', null, function(err, file) {
        expect(err).to.be.null
        expect(file).to.be.a('string')
        expect(file).to.match(/_gitane/)
        var data = fs.readFileSync(file)
        expect(data).to.match(/exec ssh -i testkey/)

        fs.unlinkSync(file)

        done()
      })

    })

    it('should use passed-in file if specified', function(done) {
      var filename = "_testfile"

      gitane.writeTemplate('testkey', filename, function(err, file) {
        expect(file).to.eql(filename)
        expect(err).to.be.null
        var data = fs.readFileSync(file)
        expect(data).to.match(/exec ssh -i testkey/)

        fs.unlinkSync(file)

        done()
      })

    })

    it('should create an executable file', function(done) {
      var filename = "_testfile"

      gitane.writeTemplate('testkey', filename, function(err, file) {
        expect(file).to.eql(filename)
        expect(err).to.be.null

        var stats = fs.statSync(file)

        // Note we must convert to octal ourselves.
        expect(stats.mode.toString(8)).to.eql('100755')

        fs.unlinkSync(file)

        done()
      })

    })

  })




})





