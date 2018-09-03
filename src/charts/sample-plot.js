import * as d3 from 'd3'
import _ from 'lodash'

const nanToNull = (val) => {
  return (isNaN(val) ? null : val)
}
const safen = (accessor) => {
  return (d) => {
    if (d.empty) return null
    return nanToNull(accessor(d))
  }
}

var samplePlot = function (parentContainerSelector) {
  let width = 300
  let height = 200
  // let margins = {top: 45, left: 45, right: 45, bottom: 45}
  let margins = {top: 30, left: 50, right: 30, bottom: 50}
  let data = []
  let x = d3.scaleLinear()
  let xs = [
    d3.scaleLinear(),
    d3.scaleLinear(),
    d3.scaleLinear()
  ]
  let xIndexer = d3.scaleThreshold().domain([-1, 1]).range([0, 1, 2])
  let xBand = d3.scaleBand().padding(0.3).domain([0, 1, 2])
  let y = d3.scaleLinear()
  let coeff = '<coeff>'
  let pval = '<pval>'
  let xAccessor = d => d.x
  let yAccessor = d => d.y
  let textAccessor = d => 'Enter item dependent label info here'
  let showCircleLabels = true
  let showBoxPlots = false
  let showBoxPlotsHasJustChanged = false
  let legendFieldAccessor = d => d.sample.gdscDesc1 // 'Specify an accessor for a qualitative scale by which to construct a legend'
  let handleCircleClick
  let handleBackgroundClick
  let selectedCircle
  let hoveredCircle
  let color
  let xLabel = ''
  let yLabel = ''
  let title = ''
  let chart = {}
  let svg

  chart.render = function () {
    // if there's no svg, create one
    if (!svg) {
      svg = d3.select(parentContainerSelector)
                .append('svg')
                  .classed('sample-plot', true)
    }

    // run every render
    svg.attr('width', width)
       .attr('height', height)
    svg.on('click', function () {
      handleBackgroundClick()
      selectedCircle = null
    })

    // by default, don't use transition
    let transition = {
      use: false,
      showSeparators: !showBoxPlots
    }
    if (showBoxPlotsHasJustChanged) {
      transition.use = true
      transition.t0 = d3.transition().duration(400)
      transition.t1 = d3.transition().delay(400).duration(400)
      transition.t2 = d3.transition().delay(800).duration(400)
    }

    updateDomains()
    updateRanges()

    renderAxes(transition)
    renderCircles(transition)
    renderBoxes(transition)

    renderSelectedCircle()
    renderHoveredCircle()

    if (showBoxPlotsHasJustChanged) {
      showBoxPlotsHasJustChanged = false
    }
  }

  function renderAxes (transition) {
    // create
    let g = svg.select('g.axes')
    if (g.empty()) {
      g = svg.append('g')
               .classed('axes', true)
    }

    // transform
    g.attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')')

    // x
    renderXAxis(g, transition)

    // y
    renderYAxis(g)

    // x-label
    renderXLabel(g, transition)

    // y-label
    renderYLabel(g)

    // separators
    renderSeparators(g, transition)

    // zero-lines
    renderZeroLines(g, transition)

    // title
    renderTitle(g)
  }

  function renderXAxis (f, transition) {
    // create
    let g = f.select('g.x-axis')
    if (g.empty()) {
      g = f.append('g')
             .classed('x-axis', true)
             .classed('axis', true)
      g.append('g')
         .classed('scatter', true)
      g.append('g')
         .classed('band', true)
    }

    // transform
    g.attr('transform', 'translate(' + 0 + ',' + dataAreaHeight() + ')')

    // call
    // g.call(d3.axisBottom(x))
    const xBandLabels = xBand.copy().domain(['inactive', 'basal', 'active'])
    if (transition.use) {
      // scatter axis
      g.select('.scatter')
         .call(d3.axisBottom(x))
         .transition(transition.t0)
         .attr('opacity', 0)
         .transition(transition.t1)
         .transition(transition.t2)
         .attr('opacity', !showBoxPlots ? 1 : 0)

      // band axis
      g.select('.band')
         .call(d3.axisBottom(xBandLabels))
         .transition(transition.t0)
         .attr('opacity', 0)
         .transition(transition.t1)
         .transition(transition.t2)
         .attr('opacity', showBoxPlots ? 1 : 0)
    }
    else {
      // scatter axis
      g.select('.scatter')
         .call(d3.axisBottom(x))
         .attr('opacity', !showBoxPlots ? 1 : 0)

      // band axis
      g.select('.band')
         .call(d3.axisBottom(xBandLabels))
         .attr('opacity', showBoxPlots ? 1 : 0)
    }
  }

  function renderYAxis (f) {
    // create
    let g = f.select('g.y-axis')
    if (g.empty()) {
      g = f.append('g')
             .classed('y-axis', true)
             .classed('axis', true)
    }

    // call
    g.call(d3.axisLeft(y))
  }

  function renderXLabel (f, transition) {
    // create
    let g = f.select('g.x-axis-label')
    if (g.empty()) {
      g = f.append('g')
             .classed('x-axis-label', true)
             .classed('axis-label', true)
      g.append('text')
    }

    // transform
    g.attr('transform', 'translate(' + (dataAreaWidth() / 2) + ',' + (dataAreaHeight() + 40) + ')')

    // call
    if (transition.use) {
      g.select('text')
         .transition(transition.t0)
         .attr('opacity', 0)
         .transition(transition.t1)
         .on('end', function (d) {
           d3.select(this).html(xLabel)
         })
         .transition(transition.t2)
         .attr('opacity', 1)
    }
    else {
      g.select('text')
         .html(xLabel)
    }
  }

  function renderYLabel (f) {
    // create
    let g = f.select('g.y-axis-label')
    if (g.empty()) {
      g = f.append('g')
             .classed('y-axis-label', true)
             .classed('axis-label', true)
      g.append('text')
    }

    // transform
    g.attr('transform', 'translate(' + (-30) + ',' + (dataAreaHeight() / 2) + ')')

    // call
    g.select('text')
       .attr('transform', 'rotate(-90)')
       .html(yLabel)
  }

  function renderTitle (f) {
    // create
    let g = f.select('g.title')
    if (g.empty()) {
      g = f.append('g')
             .classed('title', true)
      g.append('text')
    }

    // transform
    g.attr('transform', 'translate(' + (0) + ',' + (-10) + ')')

    // call
    g.select('text')
       .html(title)
  }

  function renderSeparators (f, transition) {
    // create
    let g = f.select('g.separator-lines')
    if (g.empty()) {
      g = f.append('g')
             .classed('separator-lines', true)
      g.append('line')
         .classed('lower-separator', true)
      g.append('line')
         .classed('upper-separator', true)
    }

    // call
    const xLower = x(-1)
    const xUpper = x(1)
    if (transition.use) {
      g.select('.lower-separator')
           .transition(transition.t0)
           .attr('opacity', 0)
           .transition(transition.t1)
           .transition(transition.t2)
           .attr('opacity', transition.showSeparators ? 1 : 0)
           .attr('x1', xLower)
           .attr('y1', 0)
           .attr('x2', xLower)
           .attr('y2', dataAreaHeight())
      g.select('.upper-separator')
           .transition(transition.t0)
           .attr('opacity', 0)
           .transition(transition.t1)
           .transition(transition.t2)
           .attr('opacity', transition.showSeparators ? 1 : 0)
           .attr('x1', xUpper)
           .attr('y1', 0)
           .attr('x2', xUpper)
           .attr('y2', dataAreaHeight())
           .attr('opacity', transition.showSeparators ? 1 : 0)
    }
    else {
      g.select('.lower-separator')
           .attr('x1', xLower)
           .attr('y1', 0)
           .attr('x2', xLower)
           .attr('y2', dataAreaHeight())
           .attr('opacity', transition.showSeparators ? 1 : 0)
      g.select('.upper-separator')
           .attr('x1', xUpper)
           .attr('y1', 0)
           .attr('x2', xUpper)
           .attr('y2', dataAreaHeight())
           .attr('opacity', transition.showSeparators ? 1 : 0)
    }
  }

  function renderZeroLines (f, transition) {
    // create
    let g = f.select('g.zero-line')
    if (g.empty()) {
      g = f.append('g')
             .classed('zero-line', true)
      g.append('line')
         .classed('x-zero-line', true)
      g.append('line')
         .classed('y-zero-line', true)
    }

    // call
    const xZero = nanToNull(x(0))
    const yZero = nanToNull(y(0))
    if (transition.use) {
      g.select('.x-zero-line')
           .transition(transition.t0)
           .attr('opacity', 0)
           .transition(transition.t1)
           .transition(transition.t2)
           .attr('opacity', !showBoxPlots ? 1 : 0)
           .attr('x1', xZero)
           .attr('y1', 0)
           .attr('x2', xZero)
           .attr('y2', dataAreaHeight())
      g.select('.y-zero-line')
           .transition(transition.t0)
           .attr('opacity', 0)
           .transition(transition.t1)
           .transition(transition.t2)
           .attr('opacity', !showBoxPlots ? 1 : 0)
           .attr('x1', 0)
           .attr('y1', yZero)
           .attr('x2', dataAreaWidth())
           .attr('y2', yZero)
           .attr('opacity', !showBoxPlots ? 1 : 0)
    }
    else {
      g.select('.x-zero-line')
           .attr('x1', xZero)
           .attr('y1', 0)
           .attr('x2', xZero)
           .attr('y2', dataAreaHeight())
           .attr('opacity', !showBoxPlots ? 1 : 0)
      g.select('.y-zero-line')
           .attr('x1', 0)
           .attr('y1', yZero)
           .attr('x2', dataAreaWidth())
           .attr('y2', yZero)
           .attr('opacity', !showBoxPlots ? 1 : 0)
    }
  }

  function renderCircles (transition) {
    // create
    let g = svg.selectAll('g.circles')
    if (g.empty()) {
      g = svg.append('g')
               .classed('circles', true)
    }

    // transform
    g.attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')')

    // call
    {
      // join
      let circles = g.selectAll('circle')
                       .data(data)

      // exit
      circles.exit().remove()

      // enter
      let entered = circles.enter()
                             .append('circle')
                             .attr('cx', (d) => xs[xIndexer(xAccessor(d))](xAccessor(d)))
                             .attr('cy', dataAreaHeight())
                             .on('click', function (d) {
                               handleCircleClick(d)
                               selectedCircle = d
                               d3.event.stopPropagation()
                             })
                             .on('mouseover', function (d, i) {
                               hoveredCircle = d
                               renderHoveredCircle()
                             })
                             .on('mouseout', function (d, i) {
                               if (hoveredCircle === d) hoveredCircle = null
                               renderHoveredCircle()
                             })

      // update
      let merged = entered.merge(circles)
      if (transition.use) {
        merged.attr('fill', d => color ? color(legendFieldAccessor(d)) : null)
              .transition(transition.t0)
              .attr('opacity', 1)
              .transition(transition.t1)
              .attr('cx', (d) => xs[xIndexer(xAccessor(d))](xAccessor(d)))
              .attr('cy', (d) => y(yAccessor(d)))
              .attr('r', 4)
              .transition(transition.t2)
              .attr('opacity', showBoxPlots ? 0 : 1)
              .attr('pointer-events', !showBoxPlots ? 'auto' : 'none')
      }
      else {
        merged.attr('fill', d => color ? color(legendFieldAccessor(d)) : null)
              .attr('cx', (d) => xs[xIndexer(xAccessor(d))](xAccessor(d)))
              .attr('cy', (d) => y(yAccessor(d)))
              .attr('r', 4)
              .attr('opacity', showBoxPlots ? 0 : 1)
              .attr('pointer-events', !showBoxPlots ? 'auto' : 'none')
      }
    }

    // // labels
    // // join
    // let labels = circlesG.selectAll('text')
    //                        .data(data)

    // // exit
    // labels.exit()
    //         .remove()

    // // update
    // labels.enter()
    //         .append('text')
    //          // set cx, cy for beginning of animation
    //          .attr('x', (d) => x(xAccessor(d)))
    //          .attr('y', dataAreaHeight())
    //        .merge(labels)
    //          .transition()
    //          .attr('x', (d) => x(xAccessor(d)))
    //          .attr('y', (d) => y(yAccessor(d)) - 5)
    //          .text((d) => textAccessor(d))
    //          .attr('display', 'none')
  }

  function renderSelectedCircle () {
    let selectedCircleG = svg.select('g.selected-circle')
    if (selectedCircleG.empty()) {
      selectedCircleG = svg.append('g')
                                    .attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')')
                                    .classed('selected-circle', true)
      selectedCircleG.append('circle')
                       .attr('pointer-events', 'none')
      selectedCircleG.append('text')
                       .attr('pointer-events', 'none')
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
    let hoveredCircleG = svg.select('g.hovered-circle')
    if (hoveredCircleG.empty()) {
      hoveredCircleG = svg.append('g')
                                    .attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')')
                                    .classed('hovered-circle', true)
      hoveredCircleG.append('circle')
                      .attr('pointer-events', 'none')
      hoveredCircleG.append('rect')
                      .attr('pointer-events', 'none')
      hoveredCircleG.append('text')
                      .attr('pointer-events', 'none')
    }

    if (hoveredCircle) {
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

  function getCircleRenderInfo (d) {
    return {
      x: x(xAccessor(d)),
      y: y(yAccessor(d))
      // r: r(rAccessor(d))
    }
  }

  function updateDomains () {
    let xMin = d3.min(data, xAccessor)
    let xMax = d3.max(data, xAccessor)
    let yMin = d3.min(data, yAccessor)
    let yMax = d3.max(data, yAccessor)

    // since x is used for positioning the y-axis horizontally,
    // the x scale needs a default domain
    if (!xMin) xMin = 0
    if (!xMax) xMax = 0

    x.domain([xMin, xMax])
    y.domain([yMin, yMax]).nice()

    xs[0].domain([(xMin < -1) ? xMin : -1, -1])
    xs[1].domain([-1, 1])
    xs[2].domain([1, (xMax > 1) ? xMax : 1])

    xBand.domain([0, 1, 2])
  }

  function commonAccessors (x0, x1) {
    // generate accessors for creating boxplots
    const xMid = safen(d => ((x0(d) + x1(d)) / 2.0))
    const safeX0 = safen(x0)
    const safeX1 = safen(x1)
    const yMedian = safen(d => y(d.median))
    const yUQ = safen(d => y(d.uq))
    const yUW = safen(d => y(d.uWhisker))
    const yLQ = safen(d => y(d.lq))
    const yLW = safen(d => y(d.lWhisker))
    const iqr = safen(d => (Math.abs(yLQ(d) - yUQ(d))))
    const w = safen(d => (Math.abs(x1(d) - x0(d))))

    return {
      x0: safeX0,
      x1: safeX1,
      xMid,
      iqr,
      w,
      yMedian,
      yUQ,
      yUW,
      yLQ,
      yLW
    }
  }

  function renderBoxes (transition) {
    // create
    let g = svg.selectAll('g.boxes')
    if (g.empty()) {
      g = svg.append('g')
               .classed('boxes', true)
    }

    // transform
    g.attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')')

    let lSeries = data.filter(d => xAccessor(d) <= -1)
    let mSeries = data.filter(d => (xAccessor(d) > -1 && xAccessor(d) <= 1))
    let uSeries = data.filter(d => xAccessor(d) > 1)

    const lBox = computeBoxData(lSeries, 'lower')
    const mBox = computeBoxData(mSeries, 'middle')
    const uBox = computeBoxData(uSeries, 'upper')
    const boxData = [lBox, mBox, uBox]

    const index = (d) => ((d.index === 'lower') ? 0 : ((d.index === 'middle') ? 1 : 2))
    const x0 = (d) => xs[index(d)].range()[0]
    const x1 = (d) => xs[index(d)].range()[1]
    const accessors = commonAccessors(x0, x1)

    // call
    renderBoxesSet(g, transition, boxData, accessors, showBoxPlots)
  }

  function renderBoxesSet (g, transition, boxData, accessors, show) {
    renderIQRBox(g, transition, boxData, accessors, show)
    renderMedian(g, transition, boxData, accessors, show)
    renderUpperWhisker(g, transition, boxData, accessors, show)
    renderLowerWhisker(g, transition, boxData, accessors, show)
    renderOutliers(g, transition, boxData, accessors, show)
  }

  function renderIQRBox (g, transition, boxData, accessors, show) {
    // join
    let line = g.selectAll('rect.iqr-box')
                  .data(boxData)
    // exit
    line.exit().remove()
    // enter
    line.enter()
          .append('rect')
            .attr('class', d => ('series-' + d.index))
            .classed('iqr-box', true)
            .attr('x', accessors.x0)
            .attr('y', accessors.yUQ)
            .attr('width', accessors.w)
            .attr('height', accessors.iqr)
    // update
    let merged = line.merge(line)
    if (transition.use) {
      merged.transition(transition.t0)
            .attr('opacity', 0)
            .transition(transition.t1)
            .attr('x', accessors.x0)
            .attr('y', accessors.yUQ)
            .attr('width', accessors.w)
            .attr('height', accessors.iqr)
            .transition(transition.t2)
            .attr('opacity', show ? 1 : 0)
    }
    else {
      merged.transition(transition.t0)
            .attr('x', accessors.x0)
            .attr('y', accessors.yUQ)
            .attr('width', accessors.w)
            .attr('height', accessors.iqr)
            .attr('opacity', show ? 1 : 0)
    }
  }

  function renderMedian (g, transition, boxData, accessors, show) {
    // join
    let line = g.selectAll('line.median')
                  .data(boxData)
    // exit
    line.exit().remove()
    // enter
    line.enter()
          .append('line')
            .attr('class', d => ('series-' + d.index))
            .classed('median', true)
            .attr('x1', accessors.x0)
            .attr('y1', accessors.yMedian)
            .attr('x2', accessors.x1)
            .attr('y2', accessors.yMedian)
    // update
    let merged = line.merge(line)
    if (transition.use) {
      merged.transition(transition.t0)
            .attr('opacity', 0)
            .transition(transition.t1)
            .attr('x1', accessors.x0)
            .attr('y1', accessors.yMedian)
            .attr('x2', accessors.x1)
            .attr('y2', accessors.yMedian)
            .transition(transition.t2)
            .attr('opacity', show ? 1 : 0)
    }
    else {
      merged.transition(transition.t0)
            .attr('x1', accessors.x0)
            .attr('y1', accessors.yMedian)
            .attr('x2', accessors.x1)
            .attr('y2', accessors.yMedian)
            .attr('opacity', show ? 1 : 0)
    }
  }

  function renderUpperWhisker (g, transition, boxData, accessors, show) {
    // join
    let line = g.selectAll('line.upper.whisker')
                  .data(boxData)
    // exit
    line.exit().remove()
    // enter
    line.enter()
          .append('line')
            .attr('class', d => ('series-' + d.index))
            .classed('upper', true)
            .classed('whisker', true)
            .attr('x1', accessors.xMid)
            .attr('y1', accessors.yUW)
            .attr('x2', accessors.xMid)
            .attr('y2', accessors.yUQ)
    // update
    let merged = line.merge(line)
    if (transition.use) {
      merged.transition(transition.t0)
            .attr('opacity', 0)
            .transition(transition.t1)
            .attr('x1', accessors.xMid)
            .attr('y1', accessors.yUW)
            .attr('x2', accessors.xMid)
            .attr('y2', accessors.yUQ)
            .transition(transition.t2)
            .attr('opacity', show ? 1 : 0)
    }
    else {
      merged.transition(transition.t0)
            .attr('x1', accessors.xMid)
            .attr('y1', accessors.yUW)
            .attr('x2', accessors.xMid)
            .attr('y2', accessors.yUQ)
            .attr('opacity', show ? 1 : 0)
    }
  }

  function renderLowerWhisker (g, transition, boxData, accessors, show) {
    // join
    let line = g.selectAll('line.lower.whisker')
                  .data(boxData)
    // exit
    line.exit().remove()
    // enter
    line.enter()
          .append('line')
            .attr('class', d => ('series-' + d.index))
            .classed('lower', true)
            .classed('whisker', true)
            .attr('x1', accessors.xMid)
            .attr('y1', accessors.yLW)
            .attr('x2', accessors.xMid)
            .attr('y2', accessors.yLQ)
    // update
    let merged = line.merge(line)
    if (transition.use) {
      merged.transition(transition.t0)
            .attr('opacity', 0)
            .transition(transition.t1)
            .attr('x1', accessors.xMid)
            .attr('y1', accessors.yLW)
            .attr('x2', accessors.xMid)
            .attr('y2', accessors.yLQ)
            .transition(transition.t2)
            .attr('opacity', show ? 1 : 0)
    }
    else {
      merged.transition(transition.t0)
            .attr('x1', accessors.xMid)
            .attr('y1', accessors.yLW)
            .attr('x2', accessors.xMid)
            .attr('y2', accessors.yLQ)
            .attr('opacity', show ? 1 : 0)
    }
  }

  function renderOutliers (g, transition, boxData, accessors, show) {
    // all
    let allCircles = svg.selectAll('circle.outlier')
    if (transition.use) {
      allCircles.transition(transition.t0)
                .attr('opacity', 0)
    }
    else {
      allCircles.attr('opacity', 0)
    }

    // this box
    boxData.forEach(box => {
      // join
      let circle = g.selectAll('circle.outlier.series-' + box.index)
                    .data(box.outliers)
      // exit
      circle.exit().remove()
      // enter
      circle.enter()
            .append('circle')
              .attr('class', d => ('series-' + box.index))
              .classed('outlier', true)
              .attr('cx', accessors.xMid(box))
              .attr('cy', d => y(yAccessor(d)))
              .attr('r', 4)
              .attr('opacity', show ? 1 : 0)
      // update
      let merged = circle.merge(circle)
      if (transition.use) {
        merged.transition(transition.t0)
              .attr('opacity', 0)
              .transition(transition.t1)
              .attr('cx', accessors.xMid(box))
              .attr('cy', d => y(yAccessor(d)))
              .transition(transition.t2)
              .attr('opacity', show ? 1 : 0)
      }
      else {
        merged.transition(transition.t0)
              .attr('cx', accessors.xMid(box))
              .attr('cy', d => y(yAccessor(d)))
              .attr('opacity', show ? 1 : 0)
      }
    })
  }

  function computeBoxData (series, index) {
    // d3.quantile requires a sorted array
    series.sort((a, b) => {
      return yAccessor(a) - yAccessor(b)
    })

    const isEmptySeries = series.length === 0

    const lq = d3.quantile(series, 0.25, yAccessor)
    const uq = d3.quantile(series, 0.75, yAccessor)
    const iqr = uq - lq

    const lWhiskerLimit = lq - 1.5 * iqr
    const uWhiskerLimit = uq + 1.5 * iqr
    const inliers = series.filter(d => ((yAccessor(d) > lWhiskerLimit) && (yAccessor(d) < uWhiskerLimit)))
    const outliers = series.filter(d => ((yAccessor(d) < lWhiskerLimit) || (yAccessor(d) > uWhiskerLimit)))

    // Tukey-style boxplot (used in ggplot2) draws
    // whiskers from min datum > (LQ - 1.5IQR) to max datum < (UQ + 1.5IQR)
    // not from min datum to max datum
    let lWhisker = d3.min(inliers, yAccessor)
    let uWhisker = d3.max(inliers, yAccessor)
    if (isNaN(lWhisker) || lWhisker > lq) lWhisker = lq
    if (isNaN(uWhisker) || uWhisker < uq) uWhisker = uq

    return {
      index,
      lq,
      uq,
      outliers,
      median: d3.quantile(series, 0.5, yAccessor),
      min: d3.min(series, yAccessor),
      max: d3.max(series, yAccessor),
      lWhisker,
      uWhisker,
      empty: isEmptySeries
    }
  }

  function updateRanges () {
    x.range([0, dataAreaWidth()])
    xBand.range([0, dataAreaWidth()])
    y.range([dataAreaHeight(), 0])

    if (showBoxPlots) {
      // separate
      xs[0].range([xBand(0), xBand(0) + xBand.bandwidth()])
      xs[1].range([xBand(1), xBand(1) + xBand.bandwidth()])
      xs[2].range([xBand(2), xBand(2) + xBand.bandwidth()])
    }
    else {
      // join
      xs[0].range([0, x(-1)])
      xs[1].range([x(-1), x(1)])
      xs[2].range([x(1), dataAreaWidth()])
    }
  }

  function xStart () {
    return margins.left
  }

  function yEnd () {
    return margins.top
  }

  // function xStartLegend () {
  //   return width - margins.right
  // }

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

  chart.textAccessor = function (v) {
    if (!arguments.length) {
      return textAccessor
    }
    textAccessor = v
    return chart
  }

  chart.legendFieldAccessor = function (v) {
    if (!arguments.length) {
      return legendFieldAccessor
    }
    legendFieldAccessor = v
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

  chart.showCircleLabels = function (v) {
    if (!arguments.length) {
      return showCircleLabels
    }
    showCircleLabels = v
    return chart
  }

  chart.showBoxPlots = function (v) {
    if (!arguments.length) {
      return showBoxPlots
    }
    if (showBoxPlots !== v) showBoxPlotsHasJustChanged = true
    showBoxPlots = v
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

  chart.coeff = function (v) {
    if (!arguments.length) {
      return coeff
    }
    coeff = v
    return chart
  }

  chart.pval = function (v) {
    if (!arguments.length) {
      return pval
    }
    pval = v
    return chart
  }

  chart.colorScale = function (v) {
    if (!arguments.length) {
      return color
    }
    color = v
    return chart
  }

  return chart
}

export default samplePlot
