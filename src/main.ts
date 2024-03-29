import { DEFAULT_DRAWING_ELEMENT } from './constants'
import {
  DEFAULT_BRUSH_SIZE,
  MAX_BRUSH_SIZE,
  MIN_BRUSH_SIZE,
  canvas,
  draw,
  queueMaterial,
  queueFillAll
} from './draw'
import { Grid, WIDTH } from './grid/grid'
import { MaterialType, factory } from './material/materialType'
import './style.css'

const canvasContainer = document.getElementById('canvas-container')!
const settingsContainer = document.getElementById('settings-container')!

let mouseDown = false
let selectedMaterialType: MaterialType = DEFAULT_DRAWING_ELEMENT
let brushSize = DEFAULT_BRUSH_SIZE

const changeSelectedTypeContainer = document.createElement('div')

changeSelectedTypeContainer.classList.add('pixel-selectors')

const radioButtons: Array<{ type: MaterialType; element: HTMLInputElement }> =
  []

for (const type of Object.values(MaterialType)) {
  const instance = factory(type)

  const container = document.createElement('div')
  container.classList.add('selector-container')
  const radioButton = document.createElement('input')
  radioButton.type = 'radio'
  const preview = document.createElement('div')
  preview.classList.add('preview')
  const [r, g, b] = instance.color()
  preview.style.backgroundColor = `rgb(${r},${g},${b})`

  const text = document.createElement('span')
  text.textContent = type

  container.appendChild(radioButton)
  container.appendChild(preview)
  container.appendChild(text)

  changeSelectedTypeContainer.appendChild(container)

  radioButtons.push({ type, element: radioButton })
}

for (const radioButton of radioButtons) {
  radioButton.element.addEventListener('click', (e) => {
    const selected = !!(e.target as any)?.checked
    if (selected) {
      radioButtons
        .filter((b) => b.type !== radioButton.type)
        .forEach((b) => (b.element.checked = false))
      selectedMaterialType = radioButton.type
    }
  })
}

const intialRadioButton = radioButtons.find(
  (b) => b.type === DEFAULT_DRAWING_ELEMENT
)!
intialRadioButton.element.checked = true

canvas.addEventListener('mousedown', (e) => {
  mouseDown = true

  const pixelSize = canvas.offsetWidth / WIDTH
  const x = Math.floor(e.offsetX / pixelSize)
  const y = Math.floor(e.offsetY / pixelSize)
  const index = Grid.toIndex({ x, y })

  queueMaterial(index, selectedMaterialType, brushSize)
})
canvas.addEventListener('mouseup', () => {
  mouseDown = false
})
canvas.addEventListener('mouseleave', () => {
  mouseDown = false
})

canvas.addEventListener('mousemove', (e) => {
  if (!mouseDown) return

  const pixelSize = canvas.offsetWidth / WIDTH
  const x = Math.floor(e.offsetX / pixelSize)
  const y = Math.floor(e.offsetY / pixelSize)
  const index = Grid.toIndex({ x, y })

  queueMaterial(index, selectedMaterialType, brushSize)
})

const otherControls = document.createElement('div')

const fillButtonHeading = document.createElement('h3')
fillButtonHeading.textContent = 'Fill everything'

const fillButton = document.createElement('button')
fillButton.textContent = 'fill'
fillButton.addEventListener('click', () => queueFillAll(selectedMaterialType))

const brushSizeHeading = document.createElement('h3')
brushSizeHeading.textContent = 'brush size'
const brushSizeInput = document.createElement('input')
brushSizeInput.type = 'number'
brushSizeInput.value = String(brushSize)
brushSizeInput.max = String(MAX_BRUSH_SIZE)
brushSizeInput.min = String(MIN_BRUSH_SIZE)

brushSizeInput.addEventListener('change', (e) => {
  brushSize = parseInt((e.target as unknown as any).value || 1)
})

otherControls.appendChild(fillButtonHeading)
otherControls.appendChild(fillButton)
otherControls.appendChild(brushSizeHeading)
otherControls.appendChild(brushSizeInput)

canvasContainer.appendChild(canvas)
settingsContainer.appendChild(changeSelectedTypeContainer)
settingsContainer.appendChild(otherControls)
draw(new Grid(Grid.createDefaultGrid()))
