import * as d3 from 'd3'
import _ from 'lodash'

var volcanoPlot = function (parentContainerSelector) {
  const twoPi = Math.PI * 2.0
  // const insignificantColor = '#999'
  const insignificantColor = '#ddd'
  // const positiveColor = '#EE0053'
  // const negativeColor = '#008CFE'

  // $dorothea-icon-green = #B8D9BE

  const negativeColor = '#B7E9F3'
  const positiveColor = '#B8D9BE'

  // const positiveColor = '#a73b2a'
  // const negativeColor = '#1f9eb7' // '#B7E9F3'
  // $dorothea-icon-yellow = #D3D89C

  // const positiveColor = '#FFBBBB'
  // const negativeColor = '#BBBBFF'

  let width = 300
  let height = 200
  // let margins = {top: 45, left: 45, right: 45, bottom: 60}
  let margins = {top: 30, left: 50, right: 30, bottom: 60}
  let data = []
  let significanceCutoff = 0.05
  let x = d3.scaleLinear()
  let y = d3.scaleLog()
  let r = d3.scaleSqrt()
  let xAccessor = (d) => d.x
  let yAccessor = (d) => d.y
  let rAccessor = (d) => 3
  let textAccessor = d => 'Enter item dependent label info here'
  let handleCircleClick
  let handleBackgroundClick
  let selectedCircle
  let hoveredCircle
  let showCircleLabels = false
  let xLabel = ''
  let yLabel = ''
  let title = ''
  let chart = {}
  let svg
  let svgOverlay
  let canvas
  let container

  function identifyItem () {
    // check if the mouse is over an item and return it
    // TODO: this is linear search - can we improve performance?
    let found
    data.forEach((d, i) => {
      const p = {
        x: x(xAccessor(d)) - (d3.event.offsetX - xStart()),
        y: y(yAccessor(d)) - (d3.event.offsetY - yEnd()),
        r: r(rAccessor(d))
      }
      if (p.x * p.x + p.y * p.y <= p.r * p.r) {
        found = d
      }
    })
    return found
  }

  function mousemoveHandler () {
    if (!showCircleLabels) {
      // not showing all circle labels,
      // but should show one on hovering over
      let found = identifyItem()
      if (found) {
        hoveredCircle = found
      }
      else {
        hoveredCircle = null
      }
    }
    chart.render(false)
  }

  function mouseoutHandler () {
    hoveredCircle = null
    chart.render(false)
  }

  function clickHandler () {
    let found = identifyItem()

    if (found) {
      // call the passed in handler
      handleCircleClick(found)

      // update for highlighting
      selectedCircle = found
    }
    else {
      handleBackgroundClick()
      // tooltip.hide()
      selectedCircle = null
    }

    // since the selectedCircle changed, we need to re-render
    chart.render(false)
  }

  chart.render = function (full = true) {
    if (!container) {
      container = d3.select(parentContainerSelector)
                .append('div')
                  .classed('container', true)
    }

    // if there's no svg, create one
    if (!svg) {
      svg = container
                .append('svg')
                  .classed('volcano-plot', true)
    }

    // if there's no canvas, create one
    if (!canvas) {
      canvas = container
                   .append('canvas')
                     .classed('render-canvas', true)
    }

    // if there's no svgOverlay, create one
    if (!svgOverlay) {
      svgOverlay = container
                .append('svg')
                  .classed('volcano-plot-overlay', true)
    }

    // run every render
    svg.attr('width', width)
       .attr('height', height)
    svgOverlay.attr('width', width)
              .attr('height', height)

    updateDomains()
    updateRanges()

    renderAxes()
    if (full) {
      // affects canvas
      canvas.attr('width', width)
            .attr('height', height)

      renderCirclesCanvas()

      canvas.on('click', clickHandler)
      canvas.on('mousemove', mousemoveHandler)
      canvas.on('mouseout', mouseoutHandler)
    }
    renderSelectedCircle()
    renderHoveredCircle()
    renderSignificanceCutoff()
  }

  function renderAxes () {
    // main axes container
    let axesG = svg.select('g.axes')
    if (axesG.empty()) {
      axesG = svg.append('g')
                   .classed('axes', true)
    }
    axesG.attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')')

    // x-axis
    let xAxisG = axesG.select('g.x-axis')
    if (xAxisG.empty()) {
      xAxisG = axesG.append('g')
                      .classed('x-axis', true)
                      .classed('axis', true)
    }
    xAxisG.attr('transform', 'translate(' + 0 + ',' + dataAreaHeight() + ')')
          .call(d3.axisBottom(x))

    // y-axis
    let yAxisG = axesG.select('g.y-axis')
    if (yAxisG.empty()) {
      yAxisG = axesG.append('g')
                      .classed('y-axis', true)
                      .classed('axis', true)
    }
    yAxisG.call(d3.axisLeft(y).tickSizeInner(-dataAreaWidth()))

    // x-axis label
    let xAxisLabelG = axesG.select('g.x-axis-label')
    if (xAxisLabelG.empty()) {
      xAxisLabelG = axesG.append('g')
                           .classed('x-axis-label', true)
                           .classed('axis-label', true)
      xAxisLabelG.append('text')
    }
    xAxisLabelG.attr('transform', 'translate(' + x(0) + ',' + (dataAreaHeight() + 30) + ')')
    xAxisLabelG.select('text')
                 .text(xLabel)

    // y-axis label
    let yAxisLabelG = axesG.select('g.y-axis-label')
    if (yAxisLabelG.empty()) {
      yAxisLabelG = axesG.append('g')
                           .classed('y-axis-label', true)
                           .classed('axis-label', true)
      yAxisLabelG.append('text')
    }
    yAxisLabelG.attr('transform', 'translate(' + (-30) + ',' + 0 + ')')
    yAxisLabelG.select('text')
                 .attr('transform', 'rotate(-90)')
                 .text(yLabel)

    // title label
    let titleG = axesG.select('g.title')
    if (titleG.empty()) {
      titleG = axesG.append('g')
                      .classed('title', true)
      titleG.append('text')
    }
    titleG.attr('transform', 'translate(' + (0) + ',' + (-10) + ')')
    titleG.select('text')
            .html(title)

    // zero lines
    renderXZeroLine(axesG)

    // render sensitivity-resistance guide
    renderSensitivityResistanceTriangles(axesG)
  }

  function renderXZeroLine (axesG) {
    let lineG = axesG.select('g.x-zero-line')
    if (lineG.empty()) {
      lineG = axesG.append('g')
                     .classed('x-zero-line', true)
                     .classed('zero-line', true)

      lineG.append('line')
    }

    let xVal = x(0)
    if (!xVal) xVal = 0
    lineG = svg.select('g.x-zero-line')
    lineG.select('line')
           .attr('x1', xVal)
           .attr('y1', 0)
           .attr('x2', xVal)
           .attr('y2', dataAreaHeight())
  }

  function renderSensitivityResistanceTriangles (axesG) {
    let g = axesG.select('g.sensitivity-resistance-annotation')
    if (g.empty()) {
      g = axesG.append('g')
               .classed('sensitivity-resistance-annotation', true)

      g.append('polygon')
         .classed('sensitivity', true)
      g.append('polygon')
         .classed('resistance', true)

      g.append('text')
         .classed('sensitivity', true)
      g.append('text')
         .classed('resistance', true)
    }

    let triangleOffset = 45
    let triangleHeight = 15
    let yBase = dataAreaHeight() + triangleOffset
    let yTip = dataAreaHeight() + triangleOffset - triangleHeight
    let resistancePoints = [
      [x(0), yBase],
      [dataAreaWidth(), yBase],
      [dataAreaWidth(), yTip]
    ]
    let sensitivityPoints = [
      [x(0), yBase],
      [0, yTip],
      [0, yBase]
    ]
    g.select('polygon.sensitivity')
       .attr('points', sensitivityPoints.map((coords) => coords.join(',')).join(' '))
    g.select('polygon.resistance')
       .attr('points', resistancePoints.map((coords) => coords.join(',')).join(' '))

    let yTextBase = yBase - 2
    g.select('text.sensitivity')
       .attr('x', 2)
       .attr('y', yTextBase)
       .text('Sensitivity')
    g.select('text.resistance')
       .attr('x', dataAreaWidth() - 2)
       .attr('y', yTextBase)
       .text('Resistance')
  }

  function getCircleRenderInfo (d) {
    const positive = isPositiveX(d)
    const significant = isSignificant(d)
    return {
      x: x(xAccessor(d)),
      y: y(yAccessor(d)),
      r: 3.5,
      c: significant ? (positive ? positiveColor : negativeColor) : insignificantColor,
      positive,
      significant
    }
  }

  function renderCirclesCanvas () {
    let context = canvas.node().getContext('2d')
    context.clearRect(0, 0, width, height)
    context.translate(xStart(), yEnd())
    context.textAlign = 'center'
    data.forEach((d, i) => {
      const p = getCircleRenderInfo(d)

      context.strokeStyle = '#555'
      context.fillStyle = p.c

      // circle
      context.beginPath()
      context.arc(p.x, p.y, p.r, 0, twoPi, true)
      context.stroke()
      context.fill()

      // text
      if (showCircleLabels && p.significant) {
        // context.fillStyle = p.c
        context.fillStyle = '#555'
        context.fillText(textAccessor(d), p.x, p.y - 7)
      }
    })
  }

  function renderSelectedCircle () {
    let selectedCircleG = svgOverlay.select('g.selected-circle')
    if (selectedCircleG.empty()) {
      selectedCircleG = svgOverlay.append('g')
                                    .attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')')
                                    .classed('selected-circle', true)
      selectedCircleG.append('circle')
      selectedCircleG.append('text')
    }

    if (selectedCircle) {
      const p = getCircleRenderInfo(selectedCircle)
      selectedCircleG.select('circle')
                       .attr('cx', p.x)
                       .attr('cy', p.y)
                       .attr('r', 4)
                       .attr('opacity', 1)
      selectedCircleG.select('text')
                       .attr('x', p.x)
                       .attr('y', p.y - 5)
                       .attr('opacity', 1)
                       .text((d) => {
                         return textAccessor(selectedCircle)
                       })
    }
    else {
      selectedCircleG.select('circle')
                       .attr('opacity', 0)
      selectedCircleG.select('text')
                       .attr('opacity', 0)
    }
  }

  function renderHoveredCircle () {
    let hoveredCircleG = svgOverlay.select('g.hovered-circle')
    if (hoveredCircleG.empty()) {
      hoveredCircleG = svgOverlay.append('g')
                                    .attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')')
                                    .classed('hovered-circle', true)
      hoveredCircleG.append('circle')
      hoveredCircleG.append('rect')
      hoveredCircleG.append('text')
    }

    if (hoveredCircle && !showCircleLabels) {
      const p = getCircleRenderInfo(hoveredCircle)
      hoveredCircleG.select('circle')
                      .attr('cx', p.x)
                      .attr('cy', p.y)
                      .attr('r', 4)
                      .attr('opacity', 1)
      hoveredCircleG.select('text')
                      .attr('x', p.x)
                      .attr('y', p.y - 8)
                      .attr('opacity', 1)
                      .text((d) => {
                        return textAccessor(hoveredCircle)
                      })
      const bbox = hoveredCircleG.select('text').node().getBBox()
      hoveredCircleG.select('rect')
          .attr('x', bbox.x - 2)
          .attr('y', bbox.y - 2)
          .attr('width', bbox.width + 4)
          .attr('height', bbox.height + 4)
          .attr('opacity', 1)
    }
    else {
      hoveredCircleG.select('circle')
                      .attr('opacity', 0)
      hoveredCircleG.select('text')
                      .attr('opacity', 0)
      hoveredCircleG.select('rect')
                      .attr('opacity', 0)
    }
  }

  function isSignificant (d) {
    return (yAccessor(d) < significanceCutoff)
  }

  function isPositiveX (d) {
    return (xAccessor(d) > 0)
  }

  function renderSignificanceCutoff () {
    let significanceG = svg.select('g.significance-cutoff')
    if (significanceG.empty()) {
      significanceG = svg.append('g')
                           .attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')')
                           .classed('significance-cutoff', true)

      significanceG.append('line')
      significanceG.append('text')
    }

    // y domain may be undefined if no data - need a default value
    let yVal = y(significanceCutoff)
    if (!yVal) yVal = 0
    significanceG.select('line')
                   .attr('x1', 0)
                   .attr('y1', yVal)
                   .attr('x2', dataAreaWidth())
                   .attr('y2', yVal)
    significanceG.select('text')
                   .attr('x', dataAreaWidth())
                   .attr('y', yVal - 5)
                   .text('5% FDR')
  }

  function updateDomains () {
    let xMin = d3.min(data, xAccessor)
    let xMax = d3.max(data, xAccessor)
    let yMin = d3.min(data, yAccessor)
    let yMax = d3.max(data, yAccessor)
    let rMin = d3.min(data, rAccessor)
    let rMax = d3.max(data, rAccessor)

    // since x is used for positioning the y-axis horizontally,
    // the x scale needs a default domain
    if (!xMin) xMin = 0
    if (!xMax) xMax = 0

    x.domain([xMin, xMax]).nice()
    y.domain([yMin, yMax]).nice()
    r.domain([rMin, rMax])
  }

  function updateRanges () {
    r.range([3, 5])
    x.range([0, dataAreaWidth()])
    y.range([0, dataAreaHeight()])
  }

  function xStart () {
    return margins.left
  }

  function yEnd () {
    return margins.top
  }

  function dataAreaWidth () {
    return width - margins.left - margins.right
  }

  function dataAreaHeight () {
    return height - margins.top - margins.bottom
  }

  chart.x = function (v) {
    if (!arguments.length) {
      return x
    }
    x = v
    return chart
  }

  chart.y = function (v) {
    if (!arguments.length) {
      return y
    }
    y = v
    return chart
  }

  chart.xAccessor = function (v) {
    if (!arguments.length) {
      return xAccessor
    }
    xAccessor = v
    return chart
  }

  chart.yAccessor = function (v) {
    if (!arguments.length) {
      return yAccessor
    }
    yAccessor = v
    return chart
  }

  chart.rAccessor = function (v) {
    if (!arguments.length) {
      return rAccessor
    }
    rAccessor = v
    return chart
  }

  chart.textAccessor = function (v) {
    if (!arguments.length) {
      return textAccessor
    }
    textAccessor = v
    return chart
  }

  chart.xLabel = function (v) {
    if (!arguments.length) {
      return xLabel
    }
    xLabel = v
    return chart
  }

  chart.yLabel = function (v) {
    if (!arguments.length) {
      return yLabel
    }
    yLabel = v
    return chart
  }

  chart.title = function (v) {
    if (!arguments.length) {
      return title
    }
    title = v
    return chart
  }

  chart.margins = function (v) {
    if (!arguments.length) {
      return margins
    }
    margins = v
    return chart
  }

  chart.width = function (v) {
    if (!arguments.length) {
      return width
    }
    width = v
    return chart
  }

  chart.height = function (v) {
    if (!arguments.length) {
      return height
    }
    height = v
    return chart
  }

  chart.handleCircleClick = function (v) {
    if (!arguments.length) {
      return handleCircleClick
    }
    handleCircleClick = v
    return chart
  }

  chart.handleBackgroundClick = function (v) {
    if (!arguments.length) {
      return handleBackgroundClick
    }
    handleBackgroundClick = v
    return chart
  }

  chart.showCircleLabels = function (v) {
    if (!arguments.length) {
      return showCircleLabels
    }
    showCircleLabels = v
    return chart
  }

  chart.data = function (v) {
    if (!arguments.length) {
      return data
    }
    if (!_.isEqual(data, v)) {
      // "forget" which circle was selected
      selectedCircle = null
    }
    data = v
    return chart
  }

  return chart
}

export default volcanoPlot
