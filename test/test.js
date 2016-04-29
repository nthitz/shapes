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
  describe('should recognize angles', function() {
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

  describe('should recognize modifiers', function() {
    it ('angle', function() {
      let o = p('20px line angle influenced by orientation to center ')
      assert.propertyVal(o, 'size', '20px')
      assert.propertyVal(o, 'shape', 'line')
      assert.deepPropertyVal(o, 'angle.random', false)
      assert.deepPropertyVal(o, 'angle.influence', 'centerOrientation')
    })
    it ('random angle', function() {
      let o = p('20px line random angle influenced by flow field')
      assert.propertyVal(o, 'size', '20px')
      assert.propertyVal(o, 'shape', 'line')
      assert.deepPropertyVal(o, 'angle.influence', 'flowField')
    })
  })


  describe('should recognize conditions', function() {
    it ('intersecting', function() {
      let o = p('20px line only draw if intersecting')
      assert.propertyVal(o, 'size', '20px')
      assert.propertyVal(o, 'shape', 'line')
      assert.deepPropertyVal(o, 'condition.intersect', true)
    })
    it ('not intersecting', function() {
      let o = p('20px line only draw if not intersecting or first')
      assert.propertyVal(o, 'size', '20px')
      assert.propertyVal(o, 'shape', 'line')
      assert.deepPropertyVal(o, 'condition.intersect', false)
      assert.deepPropertyVal(o, 'condition.first', true)
    })
    it ('not intersecting alternate', function() {
      let o = p('20px line only draw if not intersecting')
      assert.propertyVal(o, 'size', '20px')
      assert.propertyVal(o, 'shape', 'line')
      assert.deepPropertyVal(o, 'condition.intersect', false)
      assert.deepPropertyVal(o, 'condition.first', true)
    })
    it ('intersecting last 10', function() {
      let o = p('20px line only draw if intersecting last 10 or first')
      assert.propertyVal(o, 'size', '20px')
      assert.propertyVal(o, 'shape', 'line')
      assert.deepPropertyVal(o, 'condition.intersect', true)
      assert.deepPropertyVal(o, 'condition.first', true)
      assert.deepPropertyVal(o, 'condition.last', 10)
    })
    it ('not intersecting last 50', function() {
      let o = p('20px line only draw if not intersecting last 50 or first')
      assert.propertyVal(o, 'size', '20px')
      assert.propertyVal(o, 'shape', 'line')
      assert.deepPropertyVal(o, 'condition.intersect', false)
      assert.deepPropertyVal(o, 'condition.first', true)
      assert.deepPropertyVal(o, 'condition.last', 50)
    })
    it ('not intersecting last 50 alternate', function() {
      let o = p('20px line only draw if not intersecting last 50')
      assert.propertyVal(o, 'size', '20px')
      assert.propertyVal(o, 'shape', 'line')
      assert.deepPropertyVal(o, 'condition.intersect', false)
      assert.deepPropertyVal(o, 'condition.first', true)
      assert.deepPropertyVal(o, 'condition.last', 50)
    })
  })

  describe('complex', function() {
    it ('complex1', function() {
      let o = p('20px line random angle only draw if not intersecting last 50')
      assert.propertyVal(o, 'size', '20px')
      assert.propertyVal(o, 'shape', 'line')
      assert.deepPropertyVal(o, 'angle.random', true)
      assert.deepPropertyVal(o, 'condition.intersect', false)
      assert.deepPropertyVal(o, 'condition.first', true)
      assert.deepPropertyVal(o, 'condition.last', 50)
    })
    it ('complex2', function() {
      let o = p('20px line random angle influenced by flow field only draw if not intersecting last 50')
      assert.propertyVal(o, 'size', '20px')
      assert.propertyVal(o, 'shape', 'line')
      assert.deepPropertyVal(o, 'angle.random', true)
      assert.deepPropertyVal(o, 'angle.influence', 'flowField')
      assert.deepPropertyVal(o, 'condition.intersect', false)
      assert.deepPropertyVal(o, 'condition.first', true)
      assert.deepPropertyVal(o, 'condition.last', 50)
    })
  })

})