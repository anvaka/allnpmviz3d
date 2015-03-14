// THREE.js assumes it is loaded in global context
// dirty hack to fulfill THREE.js assumption
//
var THREE = window.THREE = require('three');
var typeface = require('three.regular.helvetiker');

THREE.typeface_js.loadFace(typeface);
