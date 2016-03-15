/* global THREE */
/**
 * Responsible for rendering nodes on three.js scene
 */
module.exports = nodeView;

var particleMaterial = createParticleMaterial();

function nodeView(scene) {
  var points;
  var colors;
  var sizes;
  var geometry;
  var particleSystem;

  return {
    /**
     * renders nodes based on current graph model
     */
    render: render,
    setNodeUI: setNodeUI,
    getBoundingSphere: getBoundingSphere,
    refresh: refresh,
    jiggle: jiggle
  };

  function jiggle() {
    var randPoints = require('three.randompoints');
    var textGeo = new THREE.TextGeometry('npm loves you', {
      height: 100,
      size: 700
    });

    textGeo.computeBoundingSphere();
    textGeo.computeVertexNormals();
    var destinations = randPoints.inGeometry(textGeo, points.length/3);

    for (var i = 0; i < destinations.length; ++i) {
      if (destinations[i].x  > 2000 && destinations[i].x < 4500) {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.5;
        colors[i * 3 + 2] = 0.9;
      }
    }
    geometry.getAttribute('customColor').needsUpdate = true;
    return {
      destinations: destinations,
      sphere: textGeo.boundingSphere,
      position: geometry.getAttribute('position'),
      points: points
    };
  }


  function refresh() {
    geometry.getAttribute('customColor').needsUpdate = true;
    geometry.getAttribute('size').needsUpdate = true;
  }

  function setNodeUI(nodeId, color, size) {
    var idx = nodeId * 3;
    colors[idx] = (color & 0xff0000) >> 16;
    colors[idx + 1] = (color & 0x00ff00) >> 8;
    colors[idx + 2] = color & 0xff;

    sizes[nodeId] = size;
  }

  function getBoundingSphere() {
    if (!geometry) return;
    geometry.computeBoundingSphere();
    return geometry.boundingSphere;
  }

  function render(graphModel) {
    // todo: do I need graph model here?
    var graph = graphModel.getGraph();
    var total = graph.getNodesCount();

    points = new Float32Array(total * 3);
    colors = new Float32Array(total * 3);
    sizes = new Float32Array(total);

    graph.forEachNode(addToPointsArray);

    geometry = new THREE.BufferGeometry();

    geometry.addAttribute('position', new THREE.BufferAttribute(points, 3));
    geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));

    if (particleSystem) {
      scene.remove(particleSystem);
    }

    particleSystem = new THREE.PointCloud(geometry, particleMaterial);
    particleSystem.name = 'nodes';

    scene.add(particleSystem);

    function addToPointsArray(node) {
      var idx = node.id * 3;
      var position = node.data.position;

      points[idx] = position.x;
      points[idx + 1] = position.y;
      points[idx + 2] = position.z;

      setNodeUI(node.id, 0xffffff, 15);
    }
  }
}

function createParticleMaterial() {
  var glslify = require('glslify');

  var attributes = {
    size: {
      type: 'f',
      value: null
    },
    customColor: {
      type: 'c',
      value: null
    }
  };

  var uniforms = {
    color: {
      type: "c",
      value: new THREE.Color(0xffffff)
    },
    texture: {
      type: "t",
      value: THREE.ImageUtils.loadTexture("textures/circle.png")
    }
  };

  return new THREE.ShaderMaterial({
    uniforms: uniforms,
    attributes: attributes,
    vertexShader: glslify(__dirname + '/node-vertex.glsl'),
    fragmentShader: glslify(__dirname + '/node-fragment.glsl'),
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true
  });
}
