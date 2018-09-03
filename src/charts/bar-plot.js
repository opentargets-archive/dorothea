import * as d3 from 'd3'
import * as d3SC from 'd3-scale-chromatic'
import * as d3L from 'd3-svg-legend'
import _ from 'lodash'

var barPlot = function (parentContainerSelector) {
  let width = 300
  let height = 200
  let margins = {top: 30, left: 50, right: 30, bottom: 110}
  let data = []
  let x = d3.scaleBand().padding(0.2)
  let y = d3.scaleLinear()
  let xAccessor = d => d.x
  let yAccessor = d => d.y
  let colorAccessor = d => d.ctId
  let color = d3.scaleOrdinal(d3SC.schemePastel1)
  let xLabel = ''
  let yLabel = ''
  let title = ''
  let legend
  let chart = {}
  let svg

  chart.render = function () {
    // if there's no svg, create one
    if (!svg) {
      svg = d3.select(parentContainerSelector)
        .append('svg')
              .classed('bar-plot', true)
    }

    // run every render
    svg.attr('width', width)
       .attr('height', height)

    updateDomains()
    updateRanges()

    renderAxes()
    renderLegend()
    renderBars()
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

    xAxisG.call(d3.axisBottom(x))
      .selectAll('text')
      .attr('y', 0)
      .attr('x', -9)
      .attr('dy', '.35em')
      .attr('transform', 'rotate(-90)')
      .style('text-anchor', 'end')
      .each(function () {
        // split on ' - ' for multiline ticks (one version expects format "drug - gm - ct")
        let text = d3.select(this)
        const parts = text.html().split(' - ')
        if (parts.length > 1) {
          text.html('<tspan font-weight="bold" x="-9" y="-6">' + parts[0] + '</tspan>' +
                    '<tspan font-style="italic" x="-9" y="7">' + parts[1] + '</tspan>')
        }
      })

    // y-axis
    let yAxisG = axesG.select('g.y-axis')
    if (yAxisG.empty()) {
      yAxisG = axesG.append('g')
                      .classed('y-axis', true)
                      .classed('axis', true)
    }
    yAxisG.call(d3.axisLeft(y))

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
  }

  function renderLegend () {
    let g = svg.select('.legend')
    if (g.empty()) {
      g = svg.append('g')
               .classed('legend', true)
    }
    g.attr('transform', 'translate(' + (xEnd() - 100) + ',' + yEnd() + ')')

    legend = d3L.legendColor()
                .scale(color)

    if (color.domain().length > 1) {
      g.call(legend)
    }
  }

  function renderBars () {
    let g = svg.select('.bars')
    if (g.empty()) {
      g = svg.append('g')
               .classed('bars', true)
    }
    g.attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')')
    // join
    let bars = g.selectAll('rect')
                  .data(data)

    // exit
    bars.exit().remove()

    // enter/update
    bars.enter()
          .append('rect')
        .merge(bars)
          .attr('x', d => x(xAccessor(d)))
          .attr('y', d => y(yAccessor(d)))
          .attr('width', d => x.bandwidth())
          .attr('height', d => Math.abs(dataAreaHeight() - y(yAccessor(d))))
          .attr('fill', d => {
            const c = color(colorAccessor(d))
            return c
          })
  }

  function updateDomains () {
    const yMax = d3.max(data, yAccessor)
    x.domain(data.map(d => xAccessor(d)))
    y.domain([0, yMax]).nice()
    const categories = _.uniq(data.map(colorAccessor))
    color.domain(categories)
  }

  function updateRanges () {
    x.range([0, dataAreaWidth()])
    y.range([dataAreaHeight(), 0])
  }

  function xStart () {
    return margins.left
  }

  function xEnd () {
    return width - margins.right
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

  chart.data = function (v) {
    if (!arguments.length) {
      return data
    }
    data = v
    return chart
  }

  return chart
}

export default barPlot
