module.exports = renderNodes;

var glslify = require('glslify');

var myShader = glslify({
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
    value: THREE.ImageUtils.loadTexture("textures/reddit.png")
  }
};

var shaderMaterial = new THREE.ShaderMaterial({
  uniforms: uniforms,
  attributes: attributes,
  vertexShader: myShader.vertex,
  fragmentShader: myShader.fragment,
  blending: THREE.AdditiveBlending,
  depthTest: false,
  transparent: true
});

function renderNodes(scene) {
  return function(graphModel) {
    var graph = graphModel.getGraph();
    var total = graph.getNodesCount();

    var points = new Float32Array(total * 3);
    var colors = new Float32Array(total * 3);
    var sizes = new Float32Array(total);

    graph.forEachNode(addToPointsArray);

    var geometry = new THREE.BufferGeometry();

    geometry.addAttribute('position', new THREE.BufferAttribute(points, 3));
    geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));

    geometry.computeBoundingSphere();

    var particleSystem = new THREE.PointCloud(geometry, shaderMaterial);
    particleSystem.name = 'nodes';

    scene.add(particleSystem);

    function addToPointsArray(node) {
      var idx = node.id * 3;
      var position = node.data.position;

      sizes[idx] = 15;

      points[idx] = position.x;
      points[idx + 1] = position.y;
      points[idx + 2] = position.z;

      // todo: should be easy to customize
      colors[idx] = 0xff;
      colors[idx + 1] = 0xff;
      colors[idx + 2] = 0xff;
    }
  };
}
