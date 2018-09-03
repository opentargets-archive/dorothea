import * as d3 from 'd3'

var boxPlot = function (parentContainerSelector) {
  let width = 300
  let height = 200
  let margins = {top: 45, left: 45, right: 45, bottom: 45}
  let data = {}
  let boxes = {}
  let seriesNameMap = {}
  let x = d3.scaleLinear()
  let xC = d3.scaleBand().padding(0.3)
  let y = d3.scaleLinear()
  let xAccessor = d => d.x
  let yAccessor = d => d.y
  let coeff = '<coeff>'
  let pval = '<pval>'
  let xLabel = ''
  let yLabel = ''
  let nested = false
  let chart = {}
  let svg

  chart.render = function () {
    // construct box plot data
    boxes = {}
    Object.keys(data).forEach(key => {
      if (nested) {
        boxes[key] = data[key].map(computeBoxData)
      }
      else {
        boxes[key] = computeBoxData(data[key])
      }
    })

    // if there's no svg, create one
    if (!svg) {
      svg = d3.select(parentContainerSelector)
                .append('svg')
                  .classed('box-plot', true)
    }

    // run every render
    svg.attr('width', width)
       .attr('height', height)

    updateDomains()
    updateRanges()

    renderAxes()
    renderBoxes()
    renderCoeff()
    renderPval()
  }

  function renderAxes () {
    // main axes container
    let axesG = svg.select('g.axes')
    if (axesG.empty()) {
      axesG = svg.append('g')
                   .classed('axes', true)
    }
    axesG.attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')')

    // create a duplicate scale and change the domain (purely for the x-axis)
    // to show any custom series name
    let xCNamed = xC.copy()
    let domain = xCNamed.domain().map(r => seriesNameMap[r] ? seriesNameMap[r] : r)
    xCNamed.domain(domain)

    // x-axis
    let xAxisG = axesG.select('g.x-axis')
    if (xAxisG.empty()) {
      xAxisG = axesG.append('g')
                      .classed('x-axis', true)
                      .classed('axis', true)
    }
    xAxisG.attr('transform', 'translate(' + 0 + ',' + dataAreaHeight() + ')')
          .call(d3.axisBottom(xCNamed))

    // y-axis
    let yAxisG = axesG.select('g.y-axis')
    if (yAxisG.empty()) {
      yAxisG = axesG.append('g')
                      .classed('y-axis', true)
                      .classed('axis', true)
    }
    yAxisG.call(d3.axisLeft(y))

    // x-axis label
    let xAxisLabelG = axesG.select('g.x-axis-label')
    if (xAxisLabelG.empty()) {
      xAxisLabelG = axesG.append('g')
                           .classed('x-axis-label', true)
                           .classed('axis-label', true)
      xAxisLabelG.append('text')
    }
    xAxisLabelG.attr('transform', 'translate(' + (dataAreaWidth() / 2) + ',' + (dataAreaHeight() + 30) + ')')
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
  }

  function renderBoxes () {
    let g = svg.selectAll('g.boxes')
    if (g.empty()) {
      g = svg.append('g')
               .classed('boxes', true)
    }
    g.attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')')

    if (nested) {
      renderNestedBoxes(g)
    } else {
      renderUnnestedBoxes(g)
    }
  }

  function renderNestedBoxes(g) {
    Object.keys(boxes).forEach(key => {
      const boxArray = boxes[key]
      const n = boxArray.length
      const w = xC.bandwidth() / n
      const a = xC(key)
      boxArray.map((box, i) => {
        const x0 = a + i * w
        const x1 = x0 + w
        const info = {
          key,
          x0,
          x1,
          xMid: (x0 + x1) / 2,
          yMedian: y(box.median),
          yMin: y(box.lWhisker),
          yMax: y(box.uWhisker),
          yLQ: y(box.lq),
          yUQ: y(box.uq),
          yOutliers: box.outliers.map(d => y(yAccessor(d))),
          empty: box.empty
        }
        renderBox(g, info, i + 1)
      })
    })
  }

  function renderUnnestedBoxes(g) {
    Object.keys(boxes).forEach(key => {
      const box = boxes[key]
      const x0 = xC(key)
      const x1 = x0 + xC.bandwidth()
      const info = {
        key,
        x0,
        x1,
        xMid: (x0 + x1) / 2,
        yMedian: y(box.median),
        yMin: y(box.lWhisker),
        yMax: y(box.uWhisker),
        yLQ: y(box.lq),
        yUQ: y(box.uq),
        yOutliers: box.outliers.map(d => y(yAccessor(d))),
        empty: box.empty
      }
      renderBox(g, info)
    })
  }

  function renderBox(g, d, i) {
    const subplotClass = 'subplot-' + i
    let selector = '.' + d.key
    selector += i ? '.' + subplotClass : ''

    // median
    var medianLine = g.select('line.median' + selector)
    if (medianLine.empty()) {
      medianLine = g.append('line')
                      .classed('median', true)
                      .classed(d.key, true)
                      .classed(subplotClass, i)
    }
    if (d.empty) {
      medianLine.attr('opacity', 0)
    } else {
      medianLine.attr('opacity', 1)
                .attr('x1', d.x0)
                .attr('y1', d.yMedian)
                .attr('x2', d.x1)
                .attr('y2', d.yMedian)
    }

    // lq-uq box
    var iqrRect = g.select('rect.iqr-box' + selector)
    if (iqrRect.empty()) {
      iqrRect = g.append('rect')
                    .classed('iqr-box', true)
                    .classed(d.key, true)
                    .classed(subplotClass, i)
    }
    if (d.empty) {
      iqrRect.attr('opacity', 0)
    } else {
      iqrRect.attr('opacity', 1)
             .attr('x', d.x0)
             .attr('y', d.yUQ)
             .attr('width', Math.abs(d.x1 - d.x0))
             .attr('height', Math.abs(d.yLQ - d.yUQ))
    }

    // lower whisker
    var lowerWhiskerLine = g.select('line.lower.whisker' + selector)
    if (lowerWhiskerLine.empty()) {
      lowerWhiskerLine = g.append('line')
                            .classed('whisker', true)
                            .classed('lower', true)
                            .classed(d.key, true)
                            .classed(subplotClass, i)
    }
    if (d.empty) {
      lowerWhiskerLine.attr('opacity', 0)
    } else {
      lowerWhiskerLine.attr('opacity', 1)
                      .attr('x1', d.xMid)
                      .attr('y1', d.yMin)
                      .attr('x2', d.xMid)
                      .attr('y2', d.yLQ)
    }

    // upper whisker
    var upperWhiskerLine = g.select('line.upper.whisker' + selector)
    if (upperWhiskerLine.empty()) {
      upperWhiskerLine = g.append('line')
                            .classed('whisker', true)
                            .classed('upper', true)
                            .classed(d.key, true)
                            .classed(subplotClass, i)
    }
    if (d.empty) {
      upperWhiskerLine.attr('opacity', 0)
    } else {
      upperWhiskerLine.attr('opacity', 1)
                      .attr('x1', d.xMid)
                      .attr('y1', d.yMax)
                      .attr('x2', d.xMid)
                      .attr('y2', d.yUQ)
    }

    // outliers
    let outliers = g.selectAll('circle.outlier' + selector)
                      .data(d.yOutliers)
    outliers.enter()
              .append('circle')
                .classed('outlier', true)
                .classed(d.key, true)
                .classed(subplotClass, i)
            .merge(outliers)
              .attr('cx', d.xMid)
              .attr('cy', d => d)
              .attr('r', 3)
    outliers.exit()
              .remove()
  }

  function renderCoeff () {
    let g = svg.select('g.coeff')
    if (g.empty()) {
      g = svg.append('g')
               .classed('coeff', true)
      g.append('text')
    }
    g.attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')')
    g.select('text')
       .attr('x', dataAreaWidth())
       .attr('y', -20)
       .text('coeff = ' + d3.format('.3g')(coeff))
       .attr('opacity', (coeff && !isNaN(coeff)) ? 1 : 0)
  }

  function renderPval () {
    let g = svg.select('g.pval')
    if (g.empty()) {
      g = svg.append('g')
               .classed('pval', true)
      g.append('text')
    }
    g.attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')')
    g.select('text')
       .attr('x', dataAreaWidth())
       .attr('y', -5)
       .text('p-val = ' + d3.format('.3g')(pval))
       .attr('opacity', (pval && !isNaN(pval)) ? 1 : 0)
  }

  function updateDomains () {
    let yMin
    let yMax
    if (nested) {
      yMin = d3.min(Object.keys(boxes).map(key => d3.min(boxes[key], d => d.min)))
      yMax = d3.max(Object.keys(boxes).map(key => d3.max(boxes[key], d => d.max)))
    } else {
      yMin = d3.min(Object.keys(boxes).map(key => boxes[key].min))
      yMax = d3.max(Object.keys(boxes).map(key => boxes[key].max))
    }
    xC.domain(Object.keys(data))
    y.domain([yMin, yMax])
  }

  function updateRanges () {
    xC.range([0, dataAreaWidth()])
    y.range([dataAreaHeight(), 0])
  }

  function computeBoxData(series) {
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
    if (isNaN(lWhisker)) lWhisker = lq
    if (isNaN(uWhisker)) uWhisker = uq

    return {
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

  function xStart () {
    return margins.left
  }

  function yEnd () {
    return margins.top
  }

  function xStartLegend () {
    return width - margins.right
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

  chart.nested = function (v) {
    if (!arguments.length) {
      return nested
    }
    nested = v
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

  chart.data = function (v) {
    if (!arguments.length) {
      return data
    }
    data = v
    return chart
  }

  chart.seriesNameMap = function (v) {
    if (!arguments.length) {
      return seriesNameMap
    }
    seriesNameMap = v
    return chart
  }

  return chart
}

export default boxPlot
