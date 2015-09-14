'use strict';

const parse5 = require('parse5');
const Url = require('url');

function getAttr (attrs, key) {
  for (var i = 0; i < attrs.length; i++) {
    if (attrs[i].name === key) {
      return attrs[i].value;
    }
  }
  return null;
}

module.exports = (body, url, callback)=> {
  let results = [];
  let parser = new parse5.SimpleApiParser({
    startTag(tagName, attrs, selfClosing /*, [location] */) {
      //Handle start tags here
      if (tagName === "img" || tagName === "script") {
        let url = getAttr(attrs, "src")
        if (url) {
          results.push(url);
        }
      } else if (tagName === "link" && attrs.rel === "stylesheet") {
        let url = getAttr(attrs, "href");
        if (url) {
          results.push(attr.href);
        }
      }
    }
  });
  parser.parse(body);
  callback(results.map((path)=> Url.resolve(url, path)));
}
