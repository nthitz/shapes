import _ from 'lodash'

import style from './styles.css'
import shapesParser from './shapes.js'
import examples from './examples'

let dim = 600
let rafId = null

let input = document.getElementById('input')
let output = document.getElementById('output')
let ctx = output.getContext('2d')

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
  let shapes = []
  ctx.clearRect(0, 0, dim, dim)
  ctx.fillStyle = color
  rafId = requestAnimationFrame(draw)
  function draw() {
    rafId = requestAnimationFrame(draw)
    let x = Math.random() * dim
    let y = Math.random() * dim
    let angle = 0

    ctx.fillRect(x, y, 10, 10)
  }
}

