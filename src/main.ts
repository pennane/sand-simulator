import { DEFAULT_DRAWING_PIXEL, PIXELS, WIDTH } from './constants'
import { canvas, draw, getPixelColor, queuePixel } from './draw'
import { toIndex } from './grid'
import { createDefaultGrid } from './state'
import './style.css'
import { Pixel } from './types'

const canvasContainer = document.getElementById('canvas-container')!
const settingsContainer = document.getElementById('settings-container')!

let mouseDown = false
let selectedPixel: Pixel = DEFAULT_DRAWING_PIXEL

const changeSelectedPixelContainer = document.createElement('div')

changeSelectedPixelContainer.classList.add('pixel-selectors')

const radioButtons: Array<{ pixel: Pixel; element: HTMLInputElement }> = []

for (const pixel of PIXELS) {
  const container = document.createElement('div')
  container.classList.add('selector-container')
  const radioButton = document.createElement('input')
  radioButton.type = 'radio'
  const preview = document.createElement('div')
  preview.classList.add('preview')
  const color = getPixelColor(pixel)
  preview.style.backgroundColor = `rgb(${color.r},${color.g},${color.b})`

  container.appendChild(preview)
  container.appendChild(radioButton)
  changeSelectedPixelContainer.appendChild(container)

  radioButtons.push({ pixel, element: radioButton })
}

for (const radioButton of radioButtons) {
  radioButton.element.addEventListener('click', (e) => {
    const selected = !!(e.target as any)?.checked
    if (selected) {
      radioButtons
        .filter((b) => b.pixel !== radioButton.pixel)
        .forEach((b) => (b.element.checked = false))
      selectedPixel = radioButton.pixel
    }
  })
}

const intialRadioButton = radioButtons.find(
  (b) => b.pixel === DEFAULT_DRAWING_PIXEL
)!
intialRadioButton.element.checked = true

canvas.addEventListener('mousedown', () => {
  mouseDown = true
})
canvas.addEventListener('mouseup', () => {
  mouseDown = false
})
canvas.addEventListener('mouseleave', () => {
  mouseDown = false
})

canvas.addEventListener('mousemove', (e) => {
  if (!mouseDown) return
  console.log(e.offsetX, e.offsetY)

  const pixelSize = canvas.offsetWidth / WIDTH
  const x = Math.floor(e.offsetX / pixelSize)
  const y = Math.floor(e.offsetY / pixelSize)
  const index = toIndex({ x, y })

  queuePixel(index, selectedPixel)
})

canvasContainer.appendChild(canvas)
settingsContainer.appendChild(changeSelectedPixelContainer)
draw(createDefaultGrid())
