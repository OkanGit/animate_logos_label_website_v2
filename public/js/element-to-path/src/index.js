//import { chunkArray, calcValue } from './utils'

const rect = attrs => {
  const w = +attrs.width
  const h = +attrs.height
  const x = attrs.x ? +attrs.x : 0
  const y = attrs.y ? +attrs.y : 0
  let rx = attrs.rx || 'auto'
  let ry = attrs.ry || 'auto'
  if (rx === 'auto' && ry === 'auto') {
    rx = ry = 0
  } else if (rx !== 'auto' && ry === 'auto') {
    rx = ry = calcValue(rx, w)
  } else if (ry !== 'auto' && rx === 'auto') {
    ry = rx = calcValue(ry, h)
  } else {
    rx = calcValue(rx, w)
    ry = calcValue(ry, h)
  }
  if (rx > w / 2) {
    rx = w / 2
  }
  if (ry > h / 2) {
    ry = h / 2
  }
  const hasCurves = rx > 0 && ry > 0
  return [
    `M${x + rx} ${y}`,
    `H${x + w - rx}`,
    ...(hasCurves ? [`A${rx} ${ry} 0 0 1 ${x + w} ${y + ry}`] : []),
    `V${y + h - ry}`,
    ...(hasCurves ? [`A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h}`] : []),
    `H${x + rx}`,
    ...(hasCurves ? [`A${rx} ${ry} 0 0 1 ${x} ${y + h - ry}`] : []),
    `V${y + ry}`,
    ...(hasCurves ? [`A${rx} ${ry} 0 0 1 ${x + rx} ${y}`] : []),
    'z',
  ]
}

const ellipse = attrs => {
  const cx = +attrs.cx
  const cy = +attrs.cy
  const rx = attrs.rx ? +attrs.rx : +attrs.r
  const ry = attrs.ry ? +attrs.ry : +attrs.r
  return [
    `M${cx + rx} ${cy}`,
    `A${rx} ${ry} 0 0 1 ${cx} ${cy + ry}`,
    `A${rx} ${ry} 0 0 1 ${cx - rx} ${cy}`,
    `A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`,
    'z',
  ]
}

const line = ({ x1, y1, x2, y2 }) => {
  return [`M${+x1} ${+y1}`, `L${+x2} ${+y2}`]
}

const poly = attrs => {
  const { points } = attrs
  const pointsArray = points
  .trim()
  .split(' ')
    .reduce((arr, point) => {
    return [...arr,  ...(point.includes(',') ? point.split(',') : point.trim() !== '' ? [point] : [])]
  }, [])
  
  const pairs = chunkArray(pointsArray, 2)
  return pairs.map(([x, y], i) => {
    return `${i === 0 ? 'M' : 'L'}${x} ${y}`
  })
}

const toPathString = d => {
  return Array.isArray(d) ? d.join(' ') : ''
}
// Changed to convert DOM element to DOM element
const elementToPath = (element) => {
  inner = element.innerHTML
  const name = element.tagName
  const attributes = element.attributes
  let d
  if (name === 'rect') {
    d = rect(attributes)
  }

  if (name === 'circle' || name === 'ellipse') {
    d = ellipse(attributes)
  }

  if (name === 'line') {
    d = line(attributes)
  }

  if (name === 'polyline') {
    d = poly(attributes)
  }

  if (name === 'polygon') {
    d = [...poly(attributes), 'Z']
  }

  if (name === 'path') {
    return element
  }
  parent = element.parentNode
  parent.removeChild(element)
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(toPathString(d), 'text/xml');
  const parsedNodes = xmlDoc.documentElement.childNodes;
  node = parsedNodes[0]
  console.log('Node')
  console.log(node)
  parent.appendChild(node);
  return node
}

//export default elementToPath
