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
    refresh: refresh
  };

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

  var particleShader = glslify({
    vertex: './node-vertex.glsl',
    fragment: './node-fragment.glsl',
    sourceOnly: true
  });

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
    vertexShader: particleShader.vertex,
    fragmentShader: particleShader.fragment,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true
  });
}
