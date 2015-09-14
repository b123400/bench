'use strict';

function standardDeviation(values){
  let avg = average(values);
  
  let squareDiffs = values.map((value)=>{
    let diff = value - avg;
    let sqrDiff = diff * diff;
    return sqrDiff;
  });
  
  let avgSquareDiff = average(squareDiffs);

  return Math.sqrt(avgSquareDiff);
}

function average(data){
  var sum = data.reduce((sum, value)=> sum + value, 0);
  return sum / data.length;
}

function median(values) {
    values.slice().sort((a,b)=> a-b);

    var half = Math.floor(values.length/2);

    if(values.length % 2) {
      return values[half];
    } else {
      return (values[half-1] + values[half]) / 2.0;
    }
}

module.exports = {average, standardDeviation, median};