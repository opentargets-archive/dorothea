import * as d3 from 'd3'

var png = function () {
  var doctype =
    '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'

  var scaleFactor = 1
  // var filename = 'image.png';

  // Restrict the css to apply to the following array (hrefs)
  // TODO: substitute this by an array of regexp
  var css // If undefined, use all stylesheets
  // var inlineImages_opt = true; // If true, inline images

  var imageCallback = function () {}

  var pngExport = function (fromSvg) {
    fromSvg = fromSvg.node()
    // var svg = div.querySelector('svg');

    var inlineImages = function (cbak) {
      var images = d3.select(fromSvg).selectAll('image')

      if (images.empty()) {
        cbak()
      }
      else {
        images.each(function () {
          var image = d3.select(this)
          var img = new Image()
          img.onload = function () {
            var canvas = document.createElement('canvas')
            var ctx = canvas.getContext('2d')
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            var uri = canvas.toDataURL('image/png')
            image.attr('href', uri)
            // remaining--
            // if (remaining === 0) {
            //   cbak()
            // }
          }
          img.src = image.attr('href')
        })
      }
    }

    var moveChildren = function (src, dest) {
      var children = src.children || src.childNodes
      while (children.length > 0) {
        var child = children[0]
        if (child.nodeType !== 1) continue
        dest.appendChild(child)
      }
      return dest
    }

    var styling = function (dom) {
      var used = ''
      var sheets = document.styleSheets
      // var sheets = [];
      for (var i = 0; i < sheets.length; i++) {
        var href = sheets[i].href || ''
        if (css) {
          var skip = true
          for (var c = 0; c < css.length; c++) {
            if (href.indexOf(css[c]) > -1) {
              skip = false
              break
            }
          }
          if (skip) {
            continue
          }
        }
        var rules = sheets[i].cssRules || []
        for (var j = 0; j < rules.length; j++) {
          var rule = rules[j]
          if (typeof rule.style !== 'undefined') {
            var elems = dom.querySelectorAll(rule.selectorText)
            if (elems.length > 0) {
              used += rule.selectorText + ' { ' + rule.style.cssText + ' }\n'
            }
          }
        }
      }

      // Check if there are <defs> already
      var defs = dom.querySelector('defs') || document.createElement('defs')
      var s = document.createElement('style')
      s.setAttribute('type', 'text/css')
      s.innerHTML = '<![CDATA[\n' + used + '\n]]>'

      // var defs = document.createElement('defs');
      defs.appendChild(s)
      return defs
    }

    inlineImages(function () {
      // var svg = div.querySelector('svg');
      var outer = document.createElement('div')
      var clone = fromSvg.cloneNode(true)
      var width = parseInt(clone.getAttribute('width'))
      var height = parseInt(clone.getAttribute('height'))

      clone.setAttribute('version', '1.1')
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
      clone.setAttribute('width', width * scaleFactor)
      clone.setAttribute('height', height * scaleFactor)
      var scaling = document.createElement('g')
      scaling.setAttribute('transform', 'scale(' + scaleFactor + ')')
      clone.appendChild(moveChildren(clone, scaling))
      outer.appendChild(clone)

      clone.insertBefore(styling(clone), clone.firstChild)

      var svg = doctype + outer.innerHTML
      svg = svg.replace('none', 'block') // In case the svg is not being displayed, it is ignored in FF
      var image = new Image()

      image.src =
        'data:image/svg+xml;base64,' +
        window.btoa(unescape(encodeURIComponent(svg)))
      image.onload = function () {
        var canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        var context = canvas.getContext('2d')
        context.drawImage(image, 0, 0)

        var src = canvas.toDataURL('image/png')
        imageCallback(src)
        // var a = document.createElement('a');
        // a.download = filename;
        // a.href = canvas.toDataURL('image/png');
        // document.body.appendChild(a);
        // a.click();
      }
    })
  }
  pngExport.scaleFactor = function (f) {
    if (!arguments.length) {
      return scaleFactor
    }
    scaleFactor = f
    return this
  }

  pngExport.callback = function (cbak) {
    if (!arguments.length) {
      return imageCallback
    }
    imageCallback = cbak
    return this
  }

  pngExport.stylesheets = function (restrictCss) {
    if (!arguments.length) {
      return css
    }
    css = restrictCss
    return this
  }

  return pngExport
}

var download = function () {
  var filename = 'image.png'
  var maxSize = {
    limit: Infinity,
    onError: function () {
      console.log('image too large')
    }
  }

  var pngExport = png().callback(function (src) {
    var a = document.createElement('a')
    a.download = filename
    a.href = src
    document.body.appendChild(a)

    if (a.href.length > maxSize.limit) {
      a.parentNode.removeChild(a)
      maxSize.onError()
    }
    else {
      a.click()
    }
  })

  pngExport.filename = function (fn) {
    if (!arguments.length) {
      return filename
    }
    filename = fn
    return pngExport
  }

  pngExport.limit = function (l) {
    if (!arguments.length) {
      return maxSize
    }
    maxSize = l
    return this
  }

  return pngExport
}

export default download
