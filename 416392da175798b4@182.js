// function _1(md){return(
// md`
// `
// )}

function _chart(d3,topojson,us)
{
  const width = 800;
  const height = 610;

  const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", zoomed);

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
       .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto;")
      .on("click", reset);

  const path = d3.geoPath();

  console.log()

  const g = svg.append("g");

  console.log(us.objects.states)

  const states = g.append("g")
      .attr("fill", "#444")
      .attr("cursor", "pointer")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .join("path")
      .on("click", clicked)
      .attr("d", path);
  
  states.append("title")
      .text(d => d.properties.name);

  g.append("path")
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));

  svg.call(zoom);

  function reset() {
    states.transition().style("fill", null);
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity,
      d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    );
  }

  function clicked(event, d) {

    console.log(d.properties.name)

    // Ruta al archivo JSON de edificios
    var rutaJSONEdificios = './files/edificios.json';

    // El nombre del edificios sobre el que se hizo click
    var selected = d.properties.name;

    fetch(rutaJSONEdificios)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {

            for (var i = 0; i < data.edificios.length; i++) {
                var edificio = data.edificios[i];
                
                if (edificio.nombre === selected) {

                  var rutaImg = edificio.rutaImgEdificio;
                  document.getElementById("nombreEdificio").textContent = selected;
                  document.getElementById("imagenEdificio").src = rutaImg;
                  console.log("El edificio " + selected + " tiene la siguiente ruta de imagen: " + rutaImg);
                  break;
                }
            }
            
            if (i === data.edificios.length) {
                document.getElementById("h11").textContent = "NO INFO";
                console.log("No se encontró un edificio con el nombre " + selected);
            }
        })
        .catch(function(error) {
            console.error("Error al cargar el archivo JSON: " + error);
        });

    const [[x0, y0], [x1, y1]] = path.bounds(d);
    event.stopPropagation();  
    states.transition().style("fill", null);
    d3.select(this).transition().style("fill", "#00A5FF");
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
      d3.pointer(event, svg.node())
    );
  }

  function zoomed(event) {
    const {transform} = event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1 / transform.k);
  }

  // Anexa el SVG al div contenedor
  mapaContainer.appendChild(svg.node());

  return svg.node();
}


function _us(FileAttachment){return(
FileAttachment("states-albers-10m.json").json()
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["states-albers-10m.json", {url: new URL("./files/States.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("chart")).define("chart", ["d3","topojson","us"], _chart);
  main.variable(observer("us")).define("us", ["FileAttachment"], _us);
  return main;
}
