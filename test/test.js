let fs = require('fs')
let PEG = require('pegjs')
let {assert} = require('chai')


let grammarFile = './shapes.grammar'
let grammar = null
let parser = null
let p = null;
describe('grammar file', function() {
  it ('should exist', function(done) {
    fs.readFile(grammarFile, function (err, data) {
      if (err) throw error
      grammar = data.toString()
      done()
    })
  })
  it ('should compile', () => {
    parser = PEG.buildParser(grammar)
    p = parser.parse
  })

})

describe('grammar rules', function() {
  describe('should recognize objects', function() {
    it ('lines', function() {
      let o = p('20px line')
      assert.propertyVal(o, 'size', '20px')
      assert.propertyVal(o, 'shape', 'line')
    })
    it ('squares', function() {
      let o = p('30px square')
      assert.propertyVal(o, 'size', '30px')
      assert.propertyVal(o, 'shape', 'square')
    })
    it ('circles', function() {
      let o = p('4px circle')
      assert.propertyVal(o, 'size', '4px')
      assert.propertyVal(o, 'shape', 'circle')
    })
  })
  describe('should recognize modifiers', function() {
    it ('angle', function() {
      let o = p('20px line angle')
      assert.propertyVal(o, 'size', '20px')
      assert.propertyVal(o, 'shape', 'line')
      assert.deepPropertyVal(o, 'angle.random', false)
    })
    it ('random angle', function() {
      let o = p('20px line random angle')
      assert.propertyVal(o, 'size', '20px')
      assert.propertyVal(o, 'shape', 'line')
      assert.deepPropertyVal(o, 'angle.random', true)
    })
  })

})