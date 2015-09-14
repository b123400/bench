'use strict';

const fs = require('fs');
const workerFarm = require('worker-farm');
const program = require('commander');
const request = require('request');
const Q = require('q');
const statistic = require('./statistic');

program
  .option('-l, --list <value>', 'Url list')
  .option('-n, --number <n>', 'number of request per url')
  .parse(process.argv);

function benchmark (urlList) {
  var promises = [];
  for (var i = 0; i < (program.number || 1); i++) {
    promises = promises.concat(urlList.map((url)=>
      benchmarkUrl(url, true)
    ))
  };
  return Q.allSettled(promises)
    .then((results)=>
      results
      .map((r)=> r.value)
      .reduce((prev, current)=> prev.concat(current),[])
    )
}

function benchmarkUrl (url, fetchAssets) {
  // console.log('benchmarking', url);
  var start = Date.now();
  if (!fetchAssets) {
    return requestPromise(url).then(()=> ({
      url,
      duration: Date.now() - start
    }))
  }

  let duration;
  return requestPromise(url)
    .then((url)=> {
      duration = Date.now() - start;
      return url
    })
    .then((body)=> findUrls(body, url))
    .then((urls)=>
      Q.allSettled(urls.map((url)=>
        benchmarkUrl(url)
      )
    ))
    .then((results)=> results.map((r)=> r.value))
    .then((results)=>
      results.concat({
        url,
        duration
      })
    )
}

function requestPromise (url) {
  return Q.Promise((resolve, reject)=>{
    request(url, (err, response, body)=>{
      if (response.statusCode!==200) {
        return reject();
      }
      resolve(body)
    });
  });
}

function findUrls (body, url) {
  return Q.Promise((resolve)=> workers(body, url, resolve))
}

function display (results) {
  console.log(results);
  let numbers = results.map((r)=> r.duration);
  console.log('average: ',statistic.average(numbers));
  console.log('median:', statistic.median(numbers));
  console.log('standatd deviation: ',statistic.standardDeviation(numbers));
}


let workers = workerFarm({
    maxConcurrentWorkers: 4
  },
  require.resolve('./url-finder')
)

var urlList = fs
  .readFileSync(program.list,'utf8')
  .split('\n');

benchmark(urlList)
.then(display)
.then(()=> {
  workerFarm.end(workers)
});