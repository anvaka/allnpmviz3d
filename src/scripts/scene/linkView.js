/**
 * Manages how links appear on the scene
 */
module.exports = renderLinks;

function renderLinks(scene) {
  var linksVisible = true;
  var linkMesh;

  var api = {
    /**
     * Renders links based on current graph model
     */
    render: render,
    /**
     * Turns links rendering on or off
     */
    toggleLinks: toggleLinks,
    /**
     * Gets or sets links visibility. If you pass truthy argument
     * sets visibility to that value. Otherwise returns current visibility
     */
    linksVisible: setOrGetLinksVisible
  };

  return api;

  function setOrGetLinksVisible(newValue) {
    if (newValue === undefined) {
      return linksVisible;
    }

    if (newValue) {
      scene.add(linkMesh);
    } else {
      scene.remove(linkMesh);
    }

    linksVisible = newValue;
    return linksVisible;
  }

  function render(graphModel) {
    // todo: do I need graph model here?
    var graph = graphModel.getGraph();

    var linksCount = graph.getLinksCount();

    var positions = new Float32Array(linksCount * 6);
    var colors = new Float32Array(linksCount * 6);
    var r = 16000;
    var i = 0;

    graph.forEachLink(function(linkModel) {
      var from = graph.getNode(linkModel.fromId).data.position;
      var to = graph.getNode(linkModel.toId).data.position;

      positions[i * 6] = from.x;
      positions[i * 6 + 1] = from.y;
      positions[i * 6 + 2] = from.z;
      positions[i * 6 + 3] = to.x;
      positions[i * 6 + 4] = to.y;
      positions[i * 6 + 5] = to.z;

      colors[i * 6] = from.x / r + 0.5;
      colors[i * 6 + 1] = from.y / r + 0.5;
      colors[i * 6 + 2] = from.z / r + 0.5;
      colors[i * 6 + 3] = to.x / r + 0.5;
      colors[i * 6 + 4] = to.y / r + 0.5;
      colors[i * 6 + 5] = to.z / r + 0.5;
      i += 1;
    });

    var geometry = new THREE.BufferGeometry();
    var material = new THREE.LineBasicMaterial({
      vertexColors: THREE.VertexColors
    });

    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

    geometry.computeBoundingSphere();
    if (linkMesh) {
      scene.remove(linkMesh);
    }

    linkMesh = new THREE.Line(geometry, material, THREE.LinePieces);
    scene.add(linkMesh);
  }

  function toggleLinks() {
    setOrGetLinksVisible(!linksVisible);
  }
}
