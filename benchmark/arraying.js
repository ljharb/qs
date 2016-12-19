require('console.table')

var comma = require('comma-number')
  , Benchmark = require('benchmark')

Benchmark.options.initCount  = 100
Benchmark.options.minSamples = 100

// useful when altering tests, causes thing to run quickly
// Benchmark.options.initCount = 1
// Benchmark.options.minSamples = 1
// Benchmark.options.minTime = -1
// Benchmark.options.maxTime = -1


function singles(fn) {
  return function() {
    return fn('1', '2')
  }
}

function arrayThenSingle(fn) {
  return function() {
    return fn(['1', '11', '111'], '2')
  }
}

function singleThenArray(fn) {
  return function() {
    return fn('1', ['2', '22', '222'])
  }
}

function arrays(fn) {
  return function() {
    return fn(['1', '11', '111'], ['2', '22', '222'])
  }
}

var methods = [
  function original(a, b) {
    return [].concat(a).concat(b)
  },

  function consolidated(a, b) {
    return [].concat(a, b)
  },

  function awkward(a, b) {
    return Array.prototype.concat(a, b)
  },

  // this isn't able to handle the second arg being an array.
  function halfway(a, b) {
    if (Array.isArray(a)) {
      a.push(b)
      return a
    } else {
      return [a, b]
    }
  },

  function mutating(a, b) {
    // we always use both of these, so, let's calculate them now
    var firstIsArray  = Array.isArray(a);
    var secondIsArray = Array.isArray(b);

    // mutate `a` to append `b` and then return it
    if (firstIsArray) {
        secondIsArray ? a.push.apply(a, b) : a.push(b)
        return a
    }

    // mutate `b` to prepend `a` and then return it
    if (secondIsArray) {
        b.unshift(a)
        return b
    }

    // neither are arrays, so, create a new array with both
    return [a, b]
  }
]

methods[0].style = '[].concat(a).concat(b)'
methods[1].style = '[].concat(a, b)'
methods[2].style = 'Array.prototype.concat(a, b)'
methods[3].style = 'Array.isArray halfway'
methods[4].style = 'Array.isArray both'

var suite = new Benchmark.Suite
  , results = []

methods.forEach(function(method, index) {
  results.push([method.style])

  suite.add(method.style + ' with 2 non-arrays', singles(method))
  suite.add(method.style + ' with an array then a non-array', arrayThenSingle(method))

  if (index !== 3) {
    suite.add(method.style + ' with a non-array then an array', singleThenArray(method))
    suite.add(method.style + ' with 2 arrays', arrays(method))
  }
})

var row = 0
  , column = 0

suite.on('cycle', function(event) {
  var its = event.target

  console.log('completed', its.name)

  results[row].push(comma(its.hz.toFixed(0)) + ' (+-' + its.stats.rme.toFixed(2) + '%)')

  if (results[row].length === 5 || (row === 3 && results[row].length === 3)) {
    row++
  }
})

suite.on('complete', function() {
  console.log()
  console.table(['Name', '" / "', '[] / "', '" / []', '[] / []'], results)
})

suite.run({
  async: false
})
