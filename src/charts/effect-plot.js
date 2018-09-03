import * as d3 from 'd3'
import * as d3L from 'd3-svg-legend'
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

var effectPlot = function (parentContainerSelector) {
  let width = 300
  let height = 200
  let margins = {top: 65, left: 50, right: 30, bottom: 60}
  let data = []
  let x = d3.scaleLinear()
  let xBandGM = d3.scaleBand().padding(0.3).domain(['wt', 'mut'])
  let xBandTF = d3.scaleBand().padding(0.3).domain([0, 1, 2])
  let xBandCombined = {
    wt: d3.scaleBand().padding(0).domain([0, 1, 2]),
    mut: d3.scaleBand().padding(0).domain([0, 1, 2])
  }
  let xsTF = [
    d3.scaleLinear(),
    d3.scaleLinear(),
    d3.scaleLinear()
  ]
  let xsGM = {
    wt: d3.scaleLinear(),
    mut: d3.scaleLinear()
  }
  let xsCombined = {
    wt: [d3.scaleLinear(), d3.scaleLinear(), d3.scaleLinear()],
    mut: [d3.scaleLinear(), d3.scaleLinear(), d3.scaleLinear()]
  }

  let xIndexer = d3.scaleThreshold().domain([-1, 1]).range([0, 1, 2])
  // let xBand = d3.scaleBand().padding(0.3).domain([0, 1, 2])

  let y = d3.scaleLinear()
  let coeff = '<coeff>'
  let pval = '<pval>'
  let xAccessor = d => d.x
  let yAccessor = d => d.y
  let textAccessor = d => 'Enter item dependent label info here'
  let showCircleLabels = true
  let showRegression = true
  let showLegend = true
  let showBoxPlots = false
  let showBoxPlotsHasJustChanged = false
  let effectTypeHasJustChanged = false
  let legendWidth = 150
  let legendFieldAccessor = d => d.sample.gdscDesc1 // 'Specify an accessor for a qualitative scale by which to construct a legend'
  let legendTitle = 'Legend'
  let handleCircleClick
  let handleBackgroundClick
  let selectedCircle
  let hoveredCircle
  let effectType
  let seriesNameMap = {}
  // let color // d3.scaleOrdinal(d3.schemeCategory20)
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
                  .classed('effect-plot', true)
    }

    // run every render
    svg.attr('width', width)
       .attr('height', height)
    // svg.on('click', function() {
    //   handleBackgroundClick()
    //   selectedCircle = null
    // })

    // by default, don't use transition
    let transition = {
      use: false,
      // showGMAxis: (showBoxPlots && (effectType === 'gm' || effectType === 'combined')),
      showGMAxis: (showBoxPlots && (effectType === 'gm')),
      showTFAxis: (showBoxPlots && effectType === 'tf'),
      showCombinedAxis: (showBoxPlots && (effectType === 'combined')),
      showSeparators: (effectType !== 'gm' && !showBoxPlots),
      showGMColours: (effectType !== 'tf'),
      showGMBoxes: (showBoxPlots && (effectType === 'gm')),
      showTFBoxes: (showBoxPlots && (effectType === 'tf')),
      showCombinedBoxes: (showBoxPlots && (effectType === 'combined'))
    }
    if (showBoxPlotsHasJustChanged || (effectTypeHasJustChanged && showBoxPlots)) {
      transition.use = true
      // transition.t0 = d3.transition().duration(300)
      // transition.t1 = d3.transition().delay(300).duration(300)
      // transition.t2 = d3.transition().delay(600).duration(300)
      transition.t0 = d3.transition().duration(400)
      transition.t1 = d3.transition().delay(400).duration(400)
      transition.t2 = d3.transition().delay(800).duration(400)
    }

    updateDomains()
    updateRanges()

    renderAxes(transition)
    renderCircles(transition)
    renderBoxes(transition)
    renderStats(transition)

    renderSelectedCircle()
    renderHoveredCircle()

    if (showBoxPlotsHasJustChanged) {
      showBoxPlotsHasJustChanged = false
    }
    if (effectTypeHasJustChanged) {
      effectTypeHasJustChanged = false
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

    // TODO: x-zero-line
    // TODO: y-zero-line

    // title
    renderTitle(g)

    // legend
    renderLegend(g)
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
         .classed('band-gm', true)
      g.append('g')
         .classed('band-tf', true)
      g.append('g')
         .classed('band-combined', true)
         .classed('wt', true)
      g.append('g')
         .classed('band-combined', true)
         .classed('mut', true)
      g.append('g')
         .classed('band-combined', true)
         .classed('gm', true)
    }

    // transform
    g.attr('transform', 'translate(' + 0 + ',' + dataAreaHeight() + ')')

    // transition
    let domain = ['wt', 'mut'].map(r => seriesNameMap[r] ? seriesNameMap[r] : r)
    const xBandGMLabels = xBandGM.copy().domain(domain)
    const xBandTFLabels = xBandTF.copy().domain(['inactive', 'basal', 'active'])
    const xBandCombinedLabelsWT = xBandCombined['wt'].copy().domain(['inactive', 'basal', 'active'])
    const xBandCombinedLabelsMUT = xBandCombined['mut'].copy().domain(['inactive', 'basal', 'active'])
    if (transition.use) {
      // scatter axis
      g.select('.scatter')
         .call(d3.axisBottom(x))
         .transition(transition.t0)
         .attr('opacity', 0)
         .transition(transition.t1)
         .transition(transition.t2)
         .attr('opacity', !showBoxPlots ? 1 : 0)

      // wt/mut axis
      g.select('.band-gm')
         .call(d3.axisBottom(xBandGMLabels))
         .transition(transition.t0)
         .attr('opacity', 0)
         .transition(transition.t1)
         .transition(transition.t2)
         .attr('opacity', transition.showGMAxis ? 1 : 0)

      // tf activity (categorised) axis
      g.select('.band-tf')
         .call(d3.axisBottom(xBandTFLabels))
         .transition(transition.t0)
         .attr('opacity', 0)
         .transition(transition.t1)
         .transition(transition.t2)
         .attr('opacity', transition.showTFAxis ? 1 : 0)

      // combined
      g.select('.band-combined.wt')
         .call(d3.axisBottom(xBandCombinedLabelsWT))
         .transition(transition.t0)
         .attr('opacity', 0)
         .transition(transition.t1)
         .transition(transition.t2)
         .attr('opacity', transition.showCombinedAxis ? 1 : 0)
      g.select('.band-combined.mut')
         .call(d3.axisBottom(xBandCombinedLabelsMUT))
         .transition(transition.t0)
         .attr('opacity', 0)
         .transition(transition.t1)
         .transition(transition.t2)
         .attr('opacity', transition.showCombinedAxis ? 1 : 0)
      g.select('.band-combined.gm')
         .call(d3.axisBottom(xBandGMLabels).tickPadding(15))
         .transition(transition.t0)
         .attr('opacity', 0)
         .transition(transition.t1)
         .transition(transition.t2)
         .attr('opacity', transition.showCombinedAxis ? 1 : 0)
    }
    else {
      // scatter axis
      g.select('.scatter')
         .call(d3.axisBottom(x))
         .attr('opacity', !showBoxPlots ? 1 : 0)

      // wt/mut axis
      g.select('.band-gm')
         .call(d3.axisBottom(xBandGMLabels))
         .attr('opacity', transition.showGMAxis ? 1 : 0)

      // tf activity (categorised) axis
      g.select('.band-tf')
         .call(d3.axisBottom(xBandTFLabels))
         .attr('opacity', transition.showTFAxis ? 1 : 0)

      // combined
      g.select('.band-combined.wt')
         .call(d3.axisBottom(xBandCombinedLabelsWT))
         .attr('opacity', transition.showCombinedAxis ? 1 : 0)
      g.select('.band-combined.mut')
         .call(d3.axisBottom(xBandCombinedLabelsMUT))
         .attr('opacity', transition.showCombinedAxis ? 1 : 0)
      g.select('.band-combined.gm')
         .call(d3.axisBottom(xBandGMLabels).tickPadding(15))
         .attr('opacity', transition.showCombinedAxis ? 1 : 0)
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

  function renderTitle (f) {
    // create
    let g = f.select('g.title')
    if (g.empty()) {
      g = f.append('g')
             .classed('title', true)
      g.append('text')
    }

    // transform
    g.attr('transform', 'translate(' + (0) + ',' + (-40) + ')')

    // call
    g.select('text')
       .html(title)
  }

  function renderLegend (f) {
    // create
    let g = f.select('g.legend')
    if (g.empty()) {
      g = f.append('g')
             .classed('legend', true)
    }

    // transform
    g.attr('transform', 'translate(' + 0 + ',' + (-35) + ')')

    // call
    const domain = ['wt', 'mut'].map(r => seriesNameMap[r] ? seriesNameMap[r] : r)
    const color = d3.scaleOrdinal().domain(domain).range(['#B7E9F3', '#F37799'])
    const legend = d3L.legendColor()
                      .scale(color)

    if (effectType === 'combined' && !showBoxPlots) {
      g.call(legend)
    }
    else {
      g.remove()
    }
  }

  // function renderXZeroLine (axesG, t0, t1, t2) {
  //   let lineG = axesG.select('g.x-zero-line')
  //   if (lineG.empty()) {
  //     lineG = axesG.append('g')
  //                    .classed('x-zero-line', true)
  //                    .classed('zero-line', true)

  //     lineG.append('line')
  //   }

  //   let xVal = x(0)
  //   xVal = xVal ? xVal : 0
  //   lineG = svg.select('g.x-zero-line')
  //   lineG.select('line')
  //          .attr('x1', xVal)
  //          .attr('y1', 0)
  //          .attr('x2', xVal)
  //          .attr('y2', dataAreaHeight())
  //          .transition(t0)
  //           .attr('opacity', 0)
  //           .transition(t1)
  //           .transition(t2)
  //           .attr('opacity', showBoxPlots ? 0 : 1)
  // }

  // function renderYZeroLine (axesG, t0, t1, t2) {
  //   let lineG = axesG.select('g.y-zero-line')
  //   if (lineG.empty()) {
  //     lineG = axesG.append('g')
  //                    .classed('y-zero-line', true)
  //                    .classed('zero-line', true)

  //     lineG.append('line')
  //   }

  //   let yVal = y(0)
  //   yVal = yVal ? yVal : 0
  //   lineG = svg.select('g.y-zero-line')
  //   lineG.select('line')
  //          .attr('x1', 0)
  //          .attr('y1', yVal)
  //          .attr('x2', dataAreaWidth())
  //          .attr('y2', yVal)
  //          .transition(t0)
  //           .attr('opacity', 0)
  //           .transition(t1)
  //           .transition(t2)
  //           .attr('opacity', showBoxPlots ? 0 : 1)
  // }

  function renderCircles (transition) {
    // create
    let g = svg.select('g.circles')
    if (g.empty()) {
      g = svg.append('g')
               .classed('circles', true)
      g.append('text')
    }

    // translate
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
                              //  .on('click', function(d) {
                              //    handleCircleClick(d)
                              //    selectedCircle = d
                              //    d3.event.stopPropagation()
                              //  })
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
        merged.transition(transition.t0)
              .attr('opacity', 1)
              .transition(transition.t1)
              .attr('cx', (d) => {
                if (showBoxPlots) {
                  if (effectType === 'gm' || effectType === 'combined') {
                    return xsGM[d.mut ? 'mut' : 'wt'](xAccessor(d))
                  }
                  else {
                    return xsTF[xIndexer(xAccessor(d))](xAccessor(d))
                  }
                }
                else {
                  return x(xAccessor(d))
                }
              })
              .attr('cy', (d) => y(yAccessor(d)))
              .attr('r', 3)
              .transition(transition.t2)
              .attr('opacity', !showBoxPlots ? 1 : 0)
              .attr('pointer-events', !showBoxPlots ? 'auto' : 'none')
        // note: classed cannot be part of transition
        merged.classed('wt', d => transition.showGMColours ? !d.mut : false)
              .classed('mut', d => transition.showGMColours ? d.mut : false)
      }
      else {
        merged.classed('wt', d => transition.showGMColours ? !d.mut : false)
              .classed('mut', d => transition.showGMColours ? d.mut : false)
              .attr('cx', (d) => x(xAccessor(d)))
              .attr('cy', (d) => y(yAccessor(d)))
              .attr('r', 3)
              .attr('opacity', !showBoxPlots ? 1 : 0)
              .attr('pointer-events', !showBoxPlots ? 'auto' : 'none')
      }
    }
  }

  function renderStats (transition) {
    // create
    let g = svg.select('g.stats')
    if (g.empty()) {
      g = svg.append('g')
               .classed('stats', true)
      g.append('text')
    }

    // transform
    g.attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')')

    // call
    g.select('text')
       .attr('transform', 'translate(' + (dataAreaWidth()) + ',' + (-5) + ')')
       .text('p-value = ' + d3.format('.3g')(pval) + ', coefficient = ' + d3.format('.3g')(coeff))
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
    // create
    let g = svg.select('g.hovered-circle')
    if (g.empty()) {
      g = svg.append('g')
               .classed('hovered-circle', true)
      g.append('circle')
         .attr('pointer-events', 'none')
      g.append('rect')
         .attr('pointer-events', 'none')
      g.append('text')
         .attr('pointer-events', 'none')
    }

    // transform
    g.attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')')

    // call
    let circle = g.select('circle')
    let text = g.select('text')
    let rect = g.select('rect')
    if (hoveredCircle) {
      // need to show
      const p = getCircleRenderInfo(hoveredCircle)
      circle.attr('cx', p.x)
            .attr('cy', p.y)
            .attr('r', 4)
            .attr('opacity', 1)
      text.attr('x', p.x)
          .attr('y', p.y - 10)
          .attr('opacity', 1)
          .text((d) => {
            return textAccessor(hoveredCircle)
          })
      const bbox = text.node().getBBox()
      rect.attr('x', bbox.x - 2)
          .attr('y', bbox.y - 2)
          .attr('width', bbox.width + 4)
          .attr('height', bbox.height + 4)
          .attr('opacity', 1)
    }
    else {
      // need to hide
      circle.attr('opacity', 0)
      text.attr('opacity', 0)
      rect.attr('opacity', 0)
    }
  }

  function getCircleRenderInfo (d) {
    return {
      x: x(xAccessor(d)),
      y: y(yAccessor(d))
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

    xsGM['wt'].domain([xMin, xMax])
    xsGM['mut'].domain([xMin, xMax])

    xsTF[0].domain([(xMin < -1) ? xMin : -1, -1])
    xsTF[1].domain([-1, 1])
    xsTF[2].domain([1, (xMax > 1) ? xMax : 1])

    xsCombined['wt'][0].domain(xsTF[0].domain())
    xsCombined['wt'][1].domain(xsTF[1].domain())
    xsCombined['wt'][2].domain(xsTF[2].domain())
    xsCombined['mut'][0].domain(xsTF[0].domain())
    xsCombined['mut'][1].domain(xsTF[1].domain())
    xsCombined['mut'][2].domain(xsTF[2].domain())
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

    // call
    renderGMBoxes(g, transition)
    renderTFBoxes(g, transition)
    renderCombinedBoxes(g, transition)
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

  function renderGMBoxes (f, transition) {
    // create
    let g = f.selectAll('g.gm-boxes')
    if (g.empty()) {
      g = f.append('g')
             .classed('gm-boxes', true)
    }

    // construct box dataset
    const wtSeries = data.filter(d => !d.mut)
    const mutSeries = data.filter(d => d.mut)

    // compute median, quartiles etc
    const wtSeriesStats = computeBoxData(wtSeries, 'wt')
    const mutSeriesStats = computeBoxData(mutSeries, 'mut')
    const boxData = [
      wtSeriesStats,
      mutSeriesStats
    ]

    // compute position accessors
    const x0 = (d) => xsGM[d.index].range()[0]
    const x1 = (d) => xsGM[d.index].range()[1]
    const accessors = commonAccessors(x0, x1)

    // call
    renderBoxesSet(g, transition, boxData, accessors, transition.showGMBoxes)
  }

  function renderTFBoxes (f, transition) {
    // create
    let g = f.selectAll('g.tf-boxes')
    if (g.empty()) {
      g = f.append('g')
             .classed('tf-boxes', true)
    }

    // construct box dataset
    // const wtSeries = data.filter(d => !d.mut)
    // const mutSeries = data.filter(d => d.mut)
    const inactiveSeries = data.filter(d => xAccessor(d) <= -1)
    const basalSeries = data.filter(d => ((xAccessor(d) > -1) && (xAccessor(d) <= 1)))
    const activeSeries = data.filter(d => xAccessor(d) > 1)

    // compute median, quartiles etc
    // const wtSeriesStats = computeBoxData(wtSeries, 'wt')
    // const mutSeriesStats = computeBoxData(mutSeries, 'mut')
    const inactiveSeriesStats = computeBoxData(inactiveSeries, 0)
    const basalSeriesStats = computeBoxData(basalSeries, 1)
    const activeSeriesStats = computeBoxData(activeSeries, 2)
    const boxData = [
      inactiveSeriesStats,
      basalSeriesStats,
      activeSeriesStats
    ]

    // compute position accessors
    const x0 = (d) => xsTF[d.index].range()[0]
    const x1 = (d) => xsTF[d.index].range()[1]
    const accessors = commonAccessors(x0, x1)

    // call
    renderBoxesSet(g, transition, boxData, accessors, transition.showTFBoxes)
  }

  function renderCombinedBoxes (f, transition) {
    // create
    let g = f.selectAll('g.combined-boxes')
    if (g.empty()) {
      g = f.append('g')
             .classed('combined-boxes', true)
    }

    // construct box dataset
    const wtSeries = data.filter(d => !d.mut)
    const mutSeries = data.filter(d => d.mut)

    // compute median, quartiles etc
    const wt0SeriesStats = computeBoxData(wtSeries.filter(d => xAccessor(d) <= -1), 'wt-0')
    const wt1SeriesStats = computeBoxData(wtSeries.filter(d => ((xAccessor(d) > -1) && (xAccessor(d) <= 1))), 'wt-1')
    const wt2SeriesStats = computeBoxData(wtSeries.filter(d => xAccessor(d) > 1), 'wt-2')
    const mut0SeriesStats = computeBoxData(mutSeries.filter(d => xAccessor(d) <= -1), 'mut-0')
    const mut1SeriesStats = computeBoxData(mutSeries.filter(d => ((xAccessor(d) > -1) && (xAccessor(d) <= 1))), 'mut-1')
    const mut2SeriesStats = computeBoxData(mutSeries.filter(d => xAccessor(d) > 1), 'mut-2')

    const boxData = [
      wt0SeriesStats,
      wt1SeriesStats,
      wt2SeriesStats,
      mut0SeriesStats,
      mut1SeriesStats,
      mut2SeriesStats
    ]

    // compute position accessors
    const indexGM = (d) => d.index.split('-')[0]
    const indexTF = (d) => d.index.split('-')[1]
    const x0 = (d) => xsCombined[indexGM(d)][indexTF(d)].range()[0]
    const x1 = (d) => xsCombined[indexGM(d)][indexTF(d)].range()[1]
    const accessors = commonAccessors(x0, x1)

    // call
    renderBoxesSet(g, transition, boxData, accessors, transition.showCombinedBoxes)
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
      // // join
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
              .attr('r', 3)
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
    // y
    y.range([dataAreaHeight(), 0])

    // scatter
    x.range([0, dataAreaWidth()])

    // gm
    xBandGM.range([0, dataAreaWidth()])
    if (showBoxPlots) {
      xsGM['wt'].range([xBandGM('wt'), xBandGM('wt') + xBandGM.bandwidth()])
      xsGM['mut'].range([xBandGM('mut'), xBandGM('mut') + xBandGM.bandwidth()])
    }
    else {
      xsGM['wt'].range([0, dataAreaWidth()])
      xsGM['mut'].range([0, dataAreaWidth()])
    }

    // tf
    xBandTF.range([0, dataAreaWidth()])
    if (showBoxPlots) {
      xsTF[0].range([xBandTF(0), xBandTF(0) + xBandTF.bandwidth()])
      xsTF[1].range([xBandTF(1), xBandTF(1) + xBandTF.bandwidth()])
      xsTF[2].range([xBandTF(2), xBandTF(2) + xBandTF.bandwidth()])
    }
    else {
      xsTF[0].range([0, x(-1)])
      xsTF[1].range([x(-1), x(1)])
      xsTF[2].range([x(1), dataAreaWidth()])
    }

    // combined
    xBandCombined['wt'].range([xBandGM('wt'), xBandGM('wt') + xBandGM.bandwidth()])
    xBandCombined['mut'].range([xBandGM('mut'), xBandGM('mut') + xBandGM.bandwidth()])
    if (showBoxPlots) {
      xsCombined['wt'][0].range([xBandCombined['wt'](0), xBandCombined['wt'](0) + xBandCombined['wt'].bandwidth()])
      xsCombined['wt'][1].range([xBandCombined['wt'](1), xBandCombined['wt'](1) + xBandCombined['wt'].bandwidth()])
      xsCombined['wt'][2].range([xBandCombined['wt'](2), xBandCombined['wt'](2) + xBandCombined['wt'].bandwidth()])
      xsCombined['mut'][0].range([xBandCombined['mut'](0), xBandCombined['mut'](0) + xBandCombined['mut'].bandwidth()])
      xsCombined['mut'][1].range([xBandCombined['mut'](1), xBandCombined['mut'](1) + xBandCombined['mut'].bandwidth()])
      xsCombined['mut'][2].range([xBandCombined['mut'](2), xBandCombined['mut'](2) + xBandCombined['mut'].bandwidth()])
    }
    else {
      xsCombined['wt'][0].range([0, x(-1)])
      xsCombined['wt'][1].range([x(-1), x(1)])
      xsCombined['wt'][2].range([x(1), dataAreaWidth()])
      xsCombined['mut'][0].range([0, x(-1)])
      xsCombined['mut'][1].range([x(-1), x(1)])
      xsCombined['mut'][2].range([x(1), dataAreaWidth()])
    }
  }

  function xStart () {
    return margins.left
  }

  function yEnd () {
    return margins.top
  }

  // function xStartLegend () {
  //   return width - margins.right - (showLegend ? legendWidth - 25 : 0)
  // }

  function dataAreaWidth () {
    return width - margins.left - margins.right - (showLegend ? legendWidth : 0)
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

  chart.legendTitle = function (v) {
    if (!arguments.length) {
      return legendTitle
    }
    legendTitle = v
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

  chart.seriesNameMap = function (v) {
    if (!arguments.length) {
      return seriesNameMap
    }
    seriesNameMap = v
    return chart
  }

  chart.showCircleLabels = function (v) {
    if (!arguments.length) {
      return showCircleLabels
    }
    showCircleLabels = v
    return chart
  }

  chart.showRegression = function (v) {
    if (!arguments.length) {
      return showRegression
    }
    showRegression = v
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

  chart.showLegend = function (v) {
    if (!arguments.length) {
      return showLegend
    }
    showLegend = v
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

  chart.effectType = function (v) {
    if (!arguments.length) {
      return effectType
    }
    if (effectType !== v) effectTypeHasJustChanged = true
    effectType = v
    return chart
  }

  return chart
}

export default effectPlot
