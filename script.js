/*
Alex Moisiadis

Reference Project: WordPress, as seen on CV.

function getData() has been altered to anonymise client data and simplify a large amount of entries.

*/

function getData() {
  return {
    "nodes": [{
        "id": "Person A",
        "group": 1
      },
      {
        "id": "Person B",
        "group": 2
      },
      {
        "id": "Person C",
        "group": 1
      },
      {
        "id": "Person D",
        "group": 1
      },
      {
        "id": "Person E",
        "group": 1
      },
      {
        "id": "Person F",
        "group": 1
      },
      {
        "id": "Person G",
        "group": 1
      },

    ],
    "links": [{
        "source": "Person A",
        "target": "Person B",
        "value": 1
      },
      {
        "source": "Person B",
        "target": "Person C",
        "value": 2
      },
      {
        "source": "Person D",
        "target": "Person E",
        "value": 3
      },
      {
        "source": "Person E",
        "target": "Person F",
        "value": 4
      },
      {
        "source": "Person G",
        "target": "Person E",
        "value": 5
      },
      {
        "source": "Person G",
        "target": "Person F",
        "value": 6
      },
      {
        "source": "Person D",
        "target": "Person G",
        "value": 7
      },
    ]
  };
}


var graph = getData();
var store = Object.assign({}, graph);
var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");


var color = d3.scaleOrdinal(d3.schemeCategory10);
var zoom_handler = d3.zoom().on("zoom", zoom_actions);
var linkElements, nodeElements, textElements, grads;

var simulation = d3.forceSimulation()
  .force("link", d3.forceLink().distance(700).id(function(d) {
    return d.id;
  }))
  .force("charge", d3.forceManyBody().strength(-1000))

  .force("center", d3.forceCenter(width / 2, height / 2));

var g = svg.append("g")
  .attr("class", "everything");

svg.call(zoom_handler)
  .call(zoom_handler.transform, d3.zoomIdentity.translate(200, 150).scale(0.2));

linkElements = svg.append("g").selectAll(".link"),
  nodeElements = svg.append("g").selectAll(".nodes");
grads = svg.append("g").selectAll(".grads");
textElements = svg.append("g").selectAll(".texts");
drawGraph();


function drawGraph() {
  nodeElements = nodeElements.data(graph.nodes, function(d) {
    return d.id;
  });
  nodeElements.exit().remove();
  nodeElements = g.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("r", 60)
    .attr("stroke", "#fff")
    .attr('stroke-width', 21)
    .attr("id", function(d) {
      return d.id
    })
    .attr('fill', function(d, i) {
      return 'url(#grad' + i + ')';
    })
    .on('mouseover', selectNode)
    .on('mouseout', releaseNode)
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  textElements = textElements.data(graph.nodes, function(d) {
    return d.id;
  });
  textElements.exit().remove();
  textElements = g.append("g") // use g.append instead of svg.append to enable zoom
    .attr("class", "texts")
    .selectAll("text")
    .data(graph.nodes)
    .enter().append("text")
    .attr("text-anchor", "end")
    .text(function(node) {
      return node.id
    })
    .attr("font-size", 55)
    .attr("font-family", "sans-serif")
    .attr("fill", "black")
    .attr("style", "font-weight:bold;")
    .attr("dx", 30)
    .attr("dy", 80)

  grads = linkElements.data(graph.nodes, function(d) {
    return d.id;
  });
  grads.exit().remove();
  grads = svg.append("defs").selectAll("radialGradient")
    .attr("class", "grads")
    .data(graph.nodes)
    .enter()
    .append("radialGradient")
    .attr("gradientUnits", "objectBoundingBox")
    .attr("cx", 0)
    .attr("fill", function(d) {
      return color(d.id);
    })
    .attr("cy", 0)
    .attr("r", "100%")
    .attr("id", function(d, i) {
      return "grad" + i;
    });

  grads.append("stop")
    .attr("offset", "0%")
    .style("stop-color", "white");

  grads.append("stop")
    .attr("offset", "100%")
    .style("stop-color", function(d) {
      return color(d.id);
    });


  linkElements = linkElements.data(graph.links, function(d) {
    return d.id;
  });
  linkElements.exit().remove();
  linkElements = g.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .style("stroke-width", 5.5)
    .style("stroke", "grey")
}


function ticked() {
  linkElements
    .attr("x1", function(d) {
      return d.source.x;
    })
    .attr("y1", function(d) {
      return d.source.y;
    })
    .attr("x2", function(d) {
      return d.target.x;
    })
    .attr("y2", function(d) {
      return d.target.y;
    });
  nodeElements
    .attr("cx", function(d) {
      return d.x;
    })
    .attr("cy", function(d) {
      return d.y;
    })
    .each(d => {
      d3.select('#t_' + d.id).attr('x', d.x + 10).attr('y', d.y + 3);
    });
  textElements
    .attr('x', function(d) {
      return d.x
    })
    .attr('y', function(d) {
      return d.y
    });
}

simulation
  .nodes(graph.nodes)
  .on("tick", ticked);

simulation.force("link")
  .links(graph.links);


function zoom_actions() {
  g.attr("transform", d3.event.transform)
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

function selectNode(selectedNode) {
  var neighbors = getNeighbors(selectedNode)

  nodeElements.transition().duration(500)
    .attr('r', function(node) {
      return getNodeRadius(node, neighbors);
    });

  nodeElements.attr('fill', function(node) {
    return getNodeColor(node, neighbors, selectedNode);
  })


  textElements.transition().duration(500).style('font-size', function(node) {
    return getTextColor(node, neighbors)
  })

  linkElements.transition().duration(500).style('stroke', function(link) {
    return getLinkColor(selectedNode, link)
  })
}

function releaseNode() {
  nodeElements.transition().duration(500)
    .attr('r', 60);
  nodeElements.attr('fill', function(d, i) {
    return 'url(#grad' + i + ')';
  })

  linkElements.style('stroke', 'grey');
  textElements.style('font-size', '25px');


}


function getNeighbors(node) {
  return graph.links.reduce(function(neighbors, link) {
    if (link.target.id === node.id) {
      neighbors.push(link.source.id)
    } else if (link.source.id === node.id) {
      neighbors.push(link.target.id)
    }
    return neighbors
  }, [node.id])
}

function getNodeColor(node, neighbors, selectedNode) {
  // If is neighbor
  if (Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1) {
    return 'url(#grad' + selectedNode.index + ')'
    // return node.level === 1 ? '#9C4A9C' : 'rgba(251, 130, 30, 1)'
  } else {
    return 'url(#grad' + node.index + ')'
  }
  //return node.level === 0 ? '#91007B' : '#D8ABD8'
}


function getNodeRadius(node, neighbors) {
  // If is neighbor
  if (neighbors.indexOf(node.id) > -1) {
    return '100'
  } else {
    return '60'
  }
}

function getLinkColor(selectedNode, link) {
  return isNeighborLink(selectedNode, link) ? 'grey' : 'grey';
}

function isNeighborLink(node, link) {
  return link.target.id === node.id || link.source.id === node.id
}

function getTextColor(node, neighbors) {
  return Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1 ? '40px' : '25px'
}

var filter = document.querySelector('#filter');
filter.addEventListener('change', function(event) {
  filterData(event.target.value);
  drawGraph();
  return false;
})

function filterData(id) {
  graph = Object.assign({}, store);
  graph.nodes = [];
  graph.links = [];
  dummyStore = [id];
  store.links.forEach(function(link) {
    if (link.source.id === id) {
      graph.links.push(link);
      dummyStore.push(link.target.id);
    } else if (link.target.id === id) {
      graph.links.push(link);
      dummyStore.push(link.source.id)
    }
  });
  store.nodes.forEach(function(node) {
    if (dummyStore.includes(node.id)) {
      graph.nodes.push(node);
    }
  })
}
