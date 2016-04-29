import _ from 'lodash'
import lineSegmentsIntersect from 'line-segments-intersect'

import style from './styles.css'
import shapesParser from './shapes.js'
import examples from './examples'

let dim = 600
let rafId = null

let input = document.getElementById('input')
let output = document.getElementById('output')
let ctx = output.getContext('2d')

let shapes = []
let color = 'white'

init()
function init() {
  input.onchange = reset

  output.width = dim
  output.height = dim


  appendOptions()
  reset()
}

function appendOptions() {
  examples.forEach((example) => {
    let option = document.createElement('option')
    option.value = example
    option.text = example
    input.appendChild(option)
  })
}

function reset() {
  cancelAnimationFrame(rafId)
  let code = input.value
  let program = shapesParser.parse(code)
  console.log(program)
  shapes.length = 0
  window.shapes = shapes
  ctx.clearRect(0, 0, dim, dim)
  ctx.fillStyle = color
  ctx.strokeStyle = color
  rafId = requestAnimationFrame(draw)

  let halfSize = program.size / 2
  let twoPi = Math.PI * 2
  function draw() {
    rafId = requestAnimationFrame(draw)
    let x = Math.random() * dim
    let y = Math.random() * dim
    let angle = 0

    assignAngle()

    let pass = checkConditions()
    if (!pass) {
      return
    }

    ctx.save()
    ctx.beginPath()
    ctx.translate(x - halfSize, y - halfSize)
    ctx.rotate(angle)


    if (program.shape === 'square') {
      ctx.fillRect(0, 0, program.size, program.size)
    } else if (program.shape === 'line') {
      ctx.moveTo(-halfSize, 0)
      ctx.lineTo(halfSize, 0)
      ctx.stroke()
    } else if (program.shape === 'circle') {
      ctx.arc(0, 0, program.size, 0, twoPi, true)
      ctx.fill()
    }
    ctx.restore()

    function assignAngle() {
      if (program.angle) {
        if (program.angle.random) {
          angle = Math.random() * twoPi
        }
      }
    }

    function checkConditions() {
      if (! program.condition) return true
      if (typeof program.condition.intersect === 'undefined') return true
      let shape = null;

      if (program.shape === 'line') {
        shape = [
          [x - Math.cos(angle) * halfSize, y - Math.sin(angle) * halfSize],
          [x + Math.cos(angle) * halfSize, y + Math.sin(angle) * halfSize]
        ]
      } else if (program.shape === 'square') {
        // shape = [
        //   [x - dx, y - dy],
        //   [x - dx, y + dy],
        //   [x + dx, y + dy],
        //   [x + dx, y - dy]
        // ]
        let xcos = halfSize * Math.cos(angle)
        let ycos = halfSize * Math.cos(angle)
        let xsin = halfSize * Math.sin(angle)
        let ysin = halfSize * Math.sin(angle)

        shape = [
          {x: x + halfSize, y: y + halfSize},
          {x: x + halfSize, y: y - halfSize},
          {x: x - halfSize, y: y - halfSize},
          {x: x - halfSize, y: y + halfSize}
          // {x: x - dx, y: y - dy},
          // {x: x - dx, y: y + dy},
          // {x: x + dx, y: y + dy},
          // {x: x + dx, y: y - dy}
        ].map((point) => {
          let tX = point.x - x;
          let tY = point.y - y;
          return {
            x: x + tX * Math.cos(angle) - tY * Math.sin(angle),
            y: y + tX * Math.sin(angle) - tY * Math.cos(angle)
          }
        })
      }

      if (shapes.length === 0) return addShapeAndReturn()
      let testFunction = () => {
        warn('intersect not implemented for ' + program.shape)
        return Math.random() > 0.5
      }

      if (program.shape === 'line') {
        testFunction = lineSegmentsIntersect
      }


      let hitsNone = true
      for (let i = 0; i < shapes.length; i++) {
        let testShape = shapes[i]
        if (testFunction(shape, testShape)) {
          hitsNone = false
          if (program.condition.intersect) {
            return addShapeAndReturn()
          }
        }
      }
      if (! program.condition.intersect && hitsNone) {
        return addShapeAndReturn()
      }
      return false

      function addShapeAndReturn() {
        shapes.push(shape)
        // console.log(shape)
        return true
      }
    }
  }
}

let warnings = []
function warn(msg) {
  if (warnings.indexOf(msg) !== -1) return
  warnings.push(msg)
  console.error(msg)
}

function polygonsIntersect(poly1, poly2) {
  return polygonsIntersection(poly1, poly2).length !== 0
}
