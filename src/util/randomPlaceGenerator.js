var data = '42.21224516288584, -9.68994140625,36.38591277287654, -6.1962890625';
var ranges = data.split('\n');
console.log(ranges);
function randBetween(z1, z2, z3, z4) {
  var lat = z3 + Math.random() * (z1 - z3);
  var lng = z2 + Math.random() * (z4 - z2);
  return [lat, lng];
}

export default function getLocation() {
  var rangeStr = ranges[Math.round(Math.random() * (ranges.length - 1))];
  var range = rangeStr.split(',');
  return randBetween(
    parseFloat(range[0]),
    parseFloat(range[1]),
    parseFloat(range[2]),
    parseFloat(range[3])
  );
}
