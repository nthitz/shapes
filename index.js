import _ from 'lodash'
import lineSegmentsIntersect from 'line-segments-intersect'
import polygonsIntersection from 'polygons-intersect'

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
  rafId = requestAnimationFrame(draw)

  let halfSize = program.size / 2
  let twoPi = Math.PI * 2

  program.constants = {}
  if (program && program.angle &&
    program.angle.influence &&
    program.angle.influence === 'flowField'
  ) {
    program.constants.flowField = {
      x: Math.random() * 0.01 + 0.001,
      y: Math.random() * 0.01 + 0.001
    }
  }
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

    drawShape()

    function assignAngle() {
      if (program.angle) {
        if (program.angle.influence) {
          if (program.angle.influence === 'centerOrientation') {
            angle = Math.atan2(y - dim / 2, x - dim / 2)
            addRandomJitter()
          } else if (program.angle.influence === 'flowField') {
            angle = Math.cos(x * program.constants.flowField.x)
              + Math.cos(y * program.constants.flowField.y)
            addRandomJitter()

          }
        } else if (program.angle.random) {
          angle = Math.random() * twoPi

        }
      }
      function addRandomJitter() {
        if (program.angle.random) {
          angle += (Math.random() - 0.5) * 0.5
        }
      }
    }

    function checkConditions() {
      let shape = null;

      if (program.shape.type === 'line') {
        shape = [
          [x - Math.cos(angle) * halfSize, y - Math.sin(angle) * halfSize],
          [x + Math.cos(angle) * halfSize, y + Math.sin(angle) * halfSize]
        ]
      } else if (program.shape.type === 'polygon') {
        shape = makePolygon(x, y, halfSize * Math.sqrt(2), angle, program.shape.n)
      } else if (program.shape.type === 'circle') {
        shape = { x: x, y: y, r: halfSize }
      }

      if (! program.condition) return addShapeAndReturn()
      if (typeof program.condition.intersect === 'undefined') return addShapeAndReturn()

      if (shapes.length === 0) return addShapeAndReturn()

      let testFunction = () => {
        warn('intersect not implemented for ' + program.shape.type)
        return Math.random() > 0.5
      }

      if (program.shape.type === 'line') {
        testFunction = lineSegmentsIntersect
      } else if (program.shape.type === 'polygon') {
        testFunction = polygonsIntersect
      } else if (program.shape.type === 'circle') {
        testFunction = circlesIntersecting
      }


      let hitsNone = true
      let searchBounds = [0, shapes.length]
      if (typeof program.condition.last !== 'undefined') {
        let searchStart = Math.max(0, shapes.length - program.condition.last)
      }
      for (let i = searchBounds[0]; i < searchBounds[1]; i++) {
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
        // plotVerticies(shape)
        // console.log(shape)
        return true
      }
    }

    function drawShape() {
      ctx.fillStyle = color
      ctx.strokeStyle = color

      ctx.save()
      ctx.beginPath()

      let newShape = shapes[shapes.length - 1]
      if (program.shape.type === 'polygon') {
        drawPolygon(newShape)
      } else if (program.shape.type === 'line') {
        ctx.moveTo(newShape[0][0], newShape[0][1])
        ctx.lineTo(newShape[1][0], newShape[1][1])
        ctx.stroke()
      } else if (program.shape.type === 'circle') {
        ctx.arc(x, y, halfSize, 0, twoPi, true)
        ctx.fill()
      }
      ctx.restore()
    }
  }
}

function plotVerticies(shape) {
  ctx.fillStyle = 'red'
  shape.forEach((point) => {
    ctx.beginPath()
    console.log(point.x, point.y)
    ctx.arc(point.x, point.y, 3, 3, 0, Math.PI * 2, true)
    ctx.fill()
  })
}
function drawPolygon(shape) {
  ctx.beginPath()
  shape.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y)
    } else {
      ctx.lineTo(point.x, point.y)
    }
  })
  ctx.fill()
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

function makePolygon(cx, cy, radius, theta, sides, format='object') {
  let points = []
  for (let i = 0; i < sides; i++) {
    let angle = Math.PI * 2 * (i / sides) + theta + Math.PI / 4
    let x = Math.cos(angle) * radius + cx
    let y = Math.sin(angle) * radius + cy
    points.push(format === 'object' ? {x: x, y: y} : [x, y])
  }
  return points
}

function circlesIntersecting(circle1, circle2) {
  return (
    Math.pow(circle2.x - circle1.x, 2) +
    Math.pow(circle2.y - circle1.y, 2)
  ) < Math.pow(circle2.r + circle1.r, 2)
}
