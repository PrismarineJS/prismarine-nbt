/* eslint-env mocha */
const bench = require('../bench/compiled_nbt')
describe('protodef', function () {
  it('benchmark', () => {
    bench(1000)
  })
})
