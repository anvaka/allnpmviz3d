module.exports = renderNodes;

function renderNodes(scene) {
  return function(graphModel) {
    var graph = graphModel.getGraph();
    var total = graph.getNodesCount();

    var points = new Float32Array(total * 3);
    var colors = new Float32Array(total * 3);

    graph.forEachNode(addToPointsArray);

    var geometry = new THREE.BufferGeometry();

    geometry.addAttribute('position', new THREE.BufferAttribute(points, 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeBoundingSphere();

    var material = new THREE.PointCloudMaterial({
      size: 15,
      vertexColors: THREE.VertexColors
    });

    var particleSystem = new THREE.PointCloud(geometry, material);
    particleSystem.name = 'nodes';

    scene.add(particleSystem);

    function addToPointsArray(node) {
      var idx = node.id * 3;
      var position = node.data.position;

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
