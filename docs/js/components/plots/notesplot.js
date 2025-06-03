const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const num_white_notes = 7;
let noteYscale = {};
function showNotes(
  dashboard,
  plot_width,
  plot_height,
  movieName,
  sceneNum,

  hoverLinePlot
) {
  const side_w = 100;

  const xScale = d3
    .scaleLinear()
    .domain([0, data[movieName].audioSceneData.length])
    .range([side_w, plot_width]);
  const note_width = xScale(1) - xScale(0);
  const note_height = plot_height / num_white_notes;
  const black_note_height = (note_height * 2) / 3;
  const svg = dashboard
    .append("svg")
    .attr("width", plot_width)
    .attr("height", plot_height)
    .style("background-color", d3.select("#films-page").style("--bgColor"));

  function makeYScale() {
    let y = 0;
    for (const note of NOTES) {
      console.log(note, note.length);
      if (note.length == 1) {
        noteYscale[note] = y;
        y += note_height;
      } else {
        noteYscale[note] = y - black_note_height / 2;
      }
    }
  }

  if (Object.keys(noteYscale).length == 0) {
    makeYScale();
  }

  function getNoteClass(d) {
    // d=d.note
    if (d.length == 1) {
      return "note-" + d;
    } else if (d.length == 2) {
      return "note-" + d.slice(0, 1) + "sharp";
    } else {
      return "error";
    }
  }

  svg
    .selectAll("rect")
    .data(NOTES.sort((a, b) => a.length - b.length))
    .enter()
    .append("rect")
    .attr("class", (d) => "note " + getNoteClass(d))
    .attr("x", 0)
    .attr("y", (d) => noteYscale[d])
    .attr("stroke", "black")
    .attr("fill", (d) => (d.length === 2 ? "black" : "white"))
    .attr("width", (d) => (d.length === 2 ? (side_w * 2) / 3 : side_w))
    .attr("height", (d) => (d.length === 2 ? black_note_height : note_height))
    .on("mouseover", (event, d) => {
      d3.selectAll(".note").attr("opacity", 0.5);
      console.log(d, getNoteClass(d));
      d3.selectAll("." + getNoteClass(d)).attr("opacity", 1);
    });

  const sceneColors = data[movieName].imageSceneData
    .map((d) => d["colors"][0])
    .map((d) => `rgb(${d[0]},${d[1]},${d[2]})`);
  const notes_data = data[movieName].audioSceneData.map(
    (d) => new Set(Object.values(d["notes_at_timestamps"]).flat())
  );
  svg
    .selectAll("g")
    .data(notes_data)
    .enter()
    .append("g")
    .attr("class", (d, i) => "pianoScene pianoScene-" + i)
    .attr("transform", (d, i) => `translate(${xScale(i)}, 0)`)
    .selectAll("rect")
    .data((d, i) =>
      [...d]
        .sort((a, b) => a.length - b.length)
        .map((d) => ({ note: d, index: i }))
    )
    .enter()
    .append("rect")
    .attr("class", (d) => "note " + getNoteClass(d.note))
    .attr("x", 0)
    .attr("y", (d) => noteYscale[d.note])
    .attr("stroke-width", 0.4)
    .attr("stroke", (d) => (d.note.length === 2 ? "white" : "black"))
    .attr("fill", (d) => (d.note.length === 2 ? "black" : "white"))
    .attr("width", (d) =>
      d.note.length === 2 ? (note_width * 2) / 3 : note_width
    )
    .attr("height", (d) =>
      d.note.length === 2 ? black_note_height : note_height
    );

  svg
    .selectAll("rect.pianoSceneBG")
    .data(data[movieName].imageSceneData.map((d) => d["colors"][0]))
    .enter()
    .append("rect")
    .attr("data-index", (d, i) => i)
    .attr("class", (d, i) => "pianoSceneBG pianoSceneBG-" + i)
    .attr("x", (d, i) => xScale(i))
    .style("mix-blend-mode", "screen")
    .style("-webkit-mix-blend-mode", "screen")
    .attr("y", 0)
    .attr("opacity", 0)
    // .attr("stroke", d3.select("#films-page").style("--bgColor"))
    .attr("fill", (d) => `rgb(${d[0]},${d[1]},${d[2]})`)
    .attr("height", plot_height)
    .attr("width", note_width)
    .on("mouseover", function (event, d) {
      const i = +this.getAttribute("data-index");
      console.log(i);
      highlightNoteScene(i);
      hoverLinePlot(i);
    })
    .on("click", function (event, d) {
      const i = +this.getAttribute("data-index");
      changeDisplayedVideo(movieName, i);
    });

  highlightNoteScene(sceneNum);
}

function highlightNoteScene(sceneNum) {
  d3.selectAll(".pianoScene .note").attr("opacity", 0.2);
  d3.selectAll(".pianoSceneBG").attr("opacity", 0.01);
  d3.selectAll(".pianoSceneBG-" + sceneNum).attr("opacity", 0.7);
  d3.selectAll(".pianoScene-" + sceneNum + " .note").attr("opacity", 1);
}
