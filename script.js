// JS for Strategy Tool

// initial parameters for canvas and positions
var width = 2000;
var height = 1000;

var posX = 400;
var posY = 350;

var rangeTopRight = 300
var rangeBottomLeft = 150

var rule = 0;

// default values for controls, rectangle dimensions and calculated metrics
var maxTop = 168;
var maxBottom = 1;
var maxRight = 1000;
var maxLeft = 200;

var minTop = 1;
var minBottom = 0;
var minRight = 1;
var minLeft = 1;

var nTop = 40;
var nBottom = .5;
var nRight = 500;
var nLeft = 100;

var target = maxTop*(maxBottom)*(maxRight/(201-maxLeft));

// create placeholder global variables to be filled by function updateMetrics()
var yMetric;
var xMetric;
var areaMetric;

d3.select("#fTargetArea").property("value", target);

// create svg canvas
var holder = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// create scales for the axis
var xScale = d3.scaleLinear()
    .domain([0, maxRight])
    .range([0, rangeTopRight]);

var yScale = d3.scaleLinear()
    .domain([maxTop, 0])
    .range([-rangeTopRight, 0]);

var xScale2 = d3.scaleLinear()
    .domain([maxLeft, 0])
    .range([-rangeBottomLeft, 0]);

var yScale2 = d3.scaleLinear()
    .domain([0, maxBottom])
    .range([0, rangeBottomLeft]);

// create the generate axis functions
var xAxis = d3.axisBottom()
    .scale(xScale)
    .tickValues([maxRight, (maxRight-minRight)*.75, (maxRight-minRight)*.5, (maxRight-minRight)*.25])
    .tickSize(1);

var yAxis = d3.axisLeft()
    .scale(yScale)
    .tickValues([maxTop, (maxTop-minTop)*.75, (maxTop-minTop)*.5, (maxTop-minTop)*.25])
    .tickSize(1);

var xAxis2 = d3.axisBottom()
    .scale(xScale2)
    .tickValues([maxLeft, (maxLeft-minLeft)*.75, (maxLeft-minLeft)*.5, (maxLeft-minLeft)*.25])
    .tickSize(1);

var yAxis2 = d3.axisLeft()
    .scale(yScale2)
    .tickValues([maxBottom, (maxBottom-minBottom)*.75, (maxBottom-minBottom)*.5, (maxBottom-minBottom)*.25])
    .tickFormat(d3.format(".0%"))
    .tickSize(1);

// draw the axis by calling the axis function, each as its own group
holder.append("g")
    .attr("class", "axis")
    .attr("id", "x1")
    .attr("transform", "translate(" + posX + "," + posY + ")")
    .call(xAxis);

holder.append("g")
    .attr("class", "axis")
    .attr("id", "y1")
    .attr("transform", "translate(" + posX + "," + posY + ")")
    .call(yAxis);

holder.append("g")
    .attr("class", "axis")
    .attr("id", "x2")
    .attr("transform", "translate(" + posX + "," + posY + ")")
    .call(xAxis2);

holder.append("g")
    .attr("class", "axis")
    .attr("id", "y2")
    .attr("transform", "translate(" + posX + "," + posY + ")")
    .call(yAxis2);

// create the dynamic rectangle
holder.append("rect")
    .attr("id", "targetRect")
    .style("fill", "none")
    .style("stroke", "black");

// create the static limit rectangle based on max dimensions
holder.append("rect")
    .attr("id", "limitRect")
    .attr("x", posX - rangeBottomLeft)
    .attr("y", posY - rangeTopRight)
    .style("stroke", "grey")
    .style("fill", "none")
    .attr("height", rangeTopRight + rangeBottomLeft)
    .attr("width", rangeTopRight + rangeBottomLeft);

// create edges
holder.append("line")
  .attr("id", "topEdge")
  .attr("class", "edge");

holder.append("line")
  .attr("id", "bottomEdge")
  .attr("class", "edge");

holder.append("line")
  .attr("id", "leftEdge")
  .attr("class", "edge");

holder.append("line")
  .attr("id", "rightEdge")
  .attr("class", "edge");

// create the dynamic text label
holder.append("text")
      .attr("id", "areaLabel")
      .attr("text-anchor", "middle")
      .attr("font-family", "Roboto Condensed", "sans-serif")
      .attr("font-size", "20px")
      .attr("font-weight", "700")
      .attr("fill", "black");

// read a change to the drop down menu
d3.select("#ruleset").on("change", function() {
  updateRules()
});

// read a change in the top input
d3.select("#sTop").on("input", function() {
  updateTop(+this.value, Number(d3.select("#sBottom").property("value")));
});

// read a change in the bottom input
d3.select("#sBottom").on("input", function() {
  updateBottom(Number(d3.select("#sTop").property("value")), +this.value);
});

// read a change in the right input
d3.select("#sRight").on("input", function() {
  updateRight(+this.value, Number(d3.select("#sLeft").property("value")));
});

// read a change in the left input
d3.select("#sLeft").on("input", function() {
  updateLeft(Number(d3.select("#sRight").property("value")), +this.value);
});

// update and intialize the values by calling functions
updateMetrics();
updateRules();
updateSliders();
updateSliderMaxMin();
updateInputFields();
updateTop(nTop, nBottom);
updateRight(nRight, nLeft);


// Update via top slider, depending on rules
function updateTop(valueTop, valueBottom) {
  // highlight the edge
  holder.select('#topEdge')
    .attr("style", "stroke:rgb(0,0,0); stroke-width:3");

  // All free
  if (rule == 0){updateAllFree(valueTop, valueBottom, nRight, nLeft)}
  // link same measure
  else if (rule == 1){topLinkOpposite(valueTop)}
  // link same unit types
  else if (rule == 2){topRightLink(valueTop)}
  // link different unit types
  else if (rule == 3){topLeftLink(valueTop)}

  updateMetrics();
  updateRect();
  updateSliders();
}

// Update via top slider, depending on rules
function updateBottom(valueTop, valueBottom) {
  // highlight the edge
  holder.select('#bottomEdge')
    .attr("style", "stroke:rgb(0,0,0); stroke-width:3");

  // All free
  if (rule == 0){updateAllFree(valueTop, valueBottom, nRight, nLeft)}
  // link opposite
  else if (rule == 1){bottomLinkOpposite(valueBottom)}
  // link adjacent
  else if (rule == 2){bottomLeftLink(valueBottom)}
  // link different unit types
  else if (rule == 3){bottomRightLink(valueBottom)}

  updateMetrics();
  updateRect();
  updateSliders();
}

// Update via right slider, depending on rules
function updateRight(valueRight, valueLeft) {
  // highlight the edge
  holder.select('#rightEdge')
    .attr("style", "stroke:rgb(0,0,0); stroke-width:3");

  // All free
  if (rule == 0){updateAllFree(nTop, nBottom, valueRight, valueLeft)}
  // link opposite
  else if (rule == 1){rightLinkOpposite(valueRight)}
  // link adjacent
  else if (rule == 2){rightTopLink(valueRight)}
  // link different unit types
  else if (rule == 3){rightBottomLink(valueRight)}

  updateMetrics();
  updateRect();
  updateSliders();
}

// Update via left slider, depending on rules
function updateLeft(valueRight, valueLeft) {
  // highlight the edge
  holder.select('#leftEdge')
    .attr("style", "stroke:rgb(0,0,0); stroke-width:3");

  // All free
  if (rule == 0){updateAllFree(nTop, nBottom, valueRight, valueLeft)}
  // link opposite
  else if (rule == 1){leftLinkOpposite(valueLeft)}
  // link adjacent
  else if (rule == 2){leftBottomLink(valueLeft)}
  // link different unit types
  else if (rule == 3){leftTopLink(valueLeft)}

  updateMetrics();
  updateRect();
  updateSliders();
}


// free adjustments of the interactive rectangle
function updateAllFree(valueTop, valueBottom, valueRight, valueLeft) {
  // calculate and update values for controls and rectangle
  nTop = valueTop;
  nBottom = valueBottom;
  nRight = valueRight;
  nLeft = valueLeft;
}

// change top, link to bottom
function topLinkOpposite(valueTop) {
  // calculate and update values for controls and rectangle
  nTop = valueTop;
  var calcBottom = yMetric / nTop;

  // check to make sure dyanmic rectangle does not cross axis
  if (calcBottom <= maxBottom) {nBottom = calcBottom}
  else {
    nBottom = maxBottom;
    nTop = yMetric;
  }
}

// change bottom, link to top
function bottomLinkOpposite(valueBottom) {
  // calculate and update values for controls and rectangle
  nBottom = valueBottom;
  var calcTop = yMetric / nBottom;

  // check to make sure dyanmic rectangle does not cross axis
  if (calcTop <= maxTop) {nTop = calcTop}
  else {
    nTop = maxTop;
    nBottom = yMetric / nTop;
  }
}

// change right, link to left
function rightLinkOpposite(valueRight) {
  // calculate and update values for controls and rectangle
  nRight = valueRight;
  var calcLeft = 201-(nRight / xMetric);

  // check to make sure dyanmic rectangle does not cross axis
  if (calcLeft <= maxLeft && calcLeft >= minLeft) {nLeft = calcLeft}
  else if (calcLeft < minLeft) {
    nLeft = minLeft;
    nRight = xMetric * (201-nLeft);
  }
  else if (calcLeft > maxLeft) {
    nLeft = maxLeft;
    nRight = xMetric * (201-nLeft);
  }
}

// change left, link to right
function leftLinkOpposite(valueLeft) {
  // calculate and update values for controls and rectangle
  nLeft = valueLeft;
  var calcRight = xMetric * (201-nLeft);

  // check to make sure dyanmic rectangle does not cross axis
  if (calcRight <= maxRight) {nRight = calcRight}
  else {
    nRight = maxRight;
    nLeft = 201 - (nRight / xMetric);
  }
}

// change top, link to right
function topRightLink(valueTop) {
  // calculate and update values for controls and rectangle
  nTop = valueTop;
  var calcRight = (areaMetric * (201 - nLeft)) / (nTop * nBottom)

  if (calcRight <= maxRight) {
    nRight = calcRight;
  }

  else {
    nRight = maxRight;
    nTop = (areaMetric * (201 - nLeft)) / (nRight * nBottom);
  }
}

// change right, link to top
function rightTopLink(valueRight) {
  // calculate and update values for controls and rectangle
  nRight = valueRight;
  var calcTop = (areaMetric * (201 - nLeft)) / (nRight * nBottom)

  if (calcTop <= maxTop) {
    nTop = calcTop;
  }

  else {
    nTop = maxTop;
    nRight = (areaMetric * (201 - nLeft)) / (nTop * nBottom);
  }
}

// change bottom, link to left
function bottomLeftLink(valueBottom) {
  // calculate and update values for controls and rectangle
  nBottom = valueBottom;
  var calcLeft = 201 - ((nRight * nBottom * nTop) / areaMetric)

  if (calcLeft <= maxLeft && calcLeft >= minLeft) {
    nLeft = calcLeft;
  }

  else if (calcLeft < minLeft) {
    nLeft = minLeft
    nBottom = (areaMetric * (201 - nLeft)) / (nRight * nTop);
  }

  else if (calcLeft > maxLeft) {
    nLeft = maxLeft;
    nBottom = (areaMetric * (201 - nLeft)) / (nRight * nTop);
  }
}

// change left, link to bottom
function leftBottomLink(valueLeft) {
  // calculate and update values for controls and rectangle
  nLeft = valueLeft;
  var calcBottom = (areaMetric * (201 - nLeft)) / (nRight * nTop);

  if (calcBottom <= maxBottom) {
    nBottom = calcBottom;
  }

  else {
    nBottom = maxBottom;
    nLeft = 201 - ((nRight * nBottom * nTop) / areaMetric);
  }
}

function topLeftLink(valueTop){
  // calculate and update values for controls and rectangle
  nTop = valueTop;
  var calcLeft = 201 - ((nRight * nBottom * nTop) / areaMetric);

  if (calcLeft <= maxLeft && calcLeft >= minLeft) {
    nLeft = calcLeft;
  }

  else if (calcLeft < minLeft) {
    nLeft = minLeft;
    nTop = (areaMetric * (201 - nLeft)) / (nRight * nBottom);
  }

  else if (calcLeft > maxLeft) {
    nLeft = maxLeft;
    nTop = (areaMetric * (201 - nLeft)) / (nRight * nBottom);
  }
}

function bottomRightLink(valueBottom){
  // calculate and update values for controls and rectangle
  nBottom = valueBottom;
  var calcRight = (areaMetric * (201 - nLeft)) / (nTop * nBottom);

  if (calcRight <= maxRight && calcRight >= minRight) {
    nRight = calcRight;
  }

  else if (calcRight < minRight) {
    nRight = minRight;
    nBottom = (areaMetric * (201 - nLeft)) / (nRight * nTop);
  }

  else if (calcRight > maxRight) {
    nRight = maxRight;
    nBottom = (areaMetric * (201 - nLeft)) / (nRight * nTop);
  }
}

function rightBottomLink(valueRight){
  // calculate and update values for controls and rectangle
  nRight = valueRight;
  var calcBottom = (areaMetric * (201 - nLeft)) / (nRight * nTop);

  if (calcBottom <= maxBottom && calcBottom >= minBottom) {
    nBottom = calcBottom;
  }

  else if (calcBottom < minBottom) {
    nBottom = minBottom;
    nRight = (areaMetric * (201 - nLeft)) / (nTop * nBottom);
  }

  else if (calcBottom > maxBottom) {
    nBottom = maxBottom;
    nRight = (areaMetric * (201 - nLeft)) / (nTop * nBottom);
  }
}

function leftTopLink(valueLeft){
  // calculate and update values for controls and rectangle
  nLeft = valueLeft;
  var calcTop = (areaMetric * (201 - nLeft)) / (nRight * nBottom);

  if (calcTop <= maxTop && calcTop >= minTop) {
    nTop = calcTop;
  }

  else if (calcTop < minTop) {
    nTop = minTop;
    nLeft = 201 - ((nRight * nBottom * nTop) / areaMetric);
  }

  else if (calcTop > maxTop) {
    nTop = maxTop;
    nLeft = 201 - ((nRight * nBottom * nTop) / areaMetric);
  }
}


// update the interactive rectangle
function updateRect(duration){
  // calculate color
  var colorRatio = areaMetric/target;

  // setup transition
  var t = holder.transition().duration(duration);
  // setup transition to fade the edges back to original state (a bit of a hack)
  var s = holder.transition().delay(100);

  // redraw interactive rectangle with transition
  t.select("#targetRect")
    .attr("x", posX+xScale2(nLeft))
    .attr("y", posY+yScale(nTop))
    .attr("width", xScale(nRight)-xScale2(nLeft))
    .attr("height", yScale2(nBottom)-yScale(nTop))
    .style("fill", function(d) {
      if (colorRatio >= 1){return "hsla(220, 100%, 60%, .9)"}
      else {return "hsla(" + Math.floor(colorRatio * 200) + ", 70%, 70%, .9)"}});

  // reposition text label
  t.select("#areaLabel")
        .attr("x", posX+xScale2(nLeft)+(xScale(nRight)-xScale2(nLeft))/2)
        .attr("y", posY+5+yScale(nTop)+(yScale2(nBottom)-yScale(nTop))/2)
        .text(areaMetric.toFixed(2) + " PWH");

  // move the lines
  t.select('#topEdge')
    .attrs({
      x1: posX+xScale2(nLeft),
      x2: posX+xScale(nRight),
      y1: posY+yScale(nTop),
      y2: posY+yScale(nTop)
    });

  t.select('#bottomEdge')
    .attrs({
      x1: posX+xScale2(nLeft),
      x2: posX+xScale(nRight),
      y1: posY+yScale2(nBottom),
      y2: posY+yScale2(nBottom)
    });

  t.select('#rightEdge')
    .attrs({
      x1: posX+xScale(nRight),
      x2: posX+xScale(nRight),
      y1: posY+yScale(nTop),
      y2: posY+yScale2(nBottom)
    });

  t.select('#leftEdge')
    .attrs({
      x1: posX+xScale2(nLeft),
      x2: posX+xScale2(nLeft),
      y1: posY+yScale(nTop),
      y2: posY+yScale2(nBottom)
    });

  // fade the lines back to original style
  s.selectAll('.edge')
    .attr("style", "stroke:rgb(0,0,0); stroke-width:1");
}


// update the sliders
function updateSliders() {
  // adjust the text in the range sliders
  d3.select("#sTop-value").text(nTop.toFixed(0));
  d3.select("#sTop").property("value", nTop);

  d3.select("#sBottom-value").text(d3.format(".1%")(nBottom));
  d3.select("#sBottom").property("value", nBottom);

  d3.select("#sRight-value").text(nRight.toFixed(0));
  d3.select("#sRight").property("value", nRight);

  d3.select("#sLeft-value").text(201-nLeft.toFixed(0));
  d3.select("#sLeft").property("value", nLeft);

  d3.select("#height").text(yMetric.toFixed(2));
  d3.select("#width").text(xMetric.toFixed(2));
  d3.select("#area").text(areaMetric.toFixed(2));
}


// Update the ruleset marker variable
function updateRules() {
  var sel = document.getElementById('ruleset');
  rule = sel.options[sel.selectedIndex].value;

  console.log(rule);
}


// Update the target KPI value when user submits new value
function updateTarget(form) {
  target = Number(form.targetArea.value);
  console.log(target);
  updateRect(500);
}


// Update the global variables when user submits new max and min values
function updateInputs(form) {
  // transition duration in ms
  var duration = 500

  // write to global variables
  maxTop = Number(form.topMax.value);
  maxBottom = Number(form.bottomMax.value);
  maxRight = Number(form.rightMax.value);
  maxLeft = Number(form.leftMax.value);

  minTop = Number(form.topMin.value);
  minBottom = Number(form.bottomMin.value);
  minRight = Number(form.rightMin.value);
  minLeft = Number(form.leftMin.value);

  target = maxTop*(maxBottom)*(maxRight/(201-maxLeft));
  d3.select('#fTargetArea').property("value", target.toFixed(0))

  // scale the global dynamic variables to their static screen position
  var calcTop = yScale(nTop);
  var calcBottom = yScale2(nBottom);
  var calcRight = xScale(nRight);
  var calcLeft = xScale2(nLeft);

  updateMetrics();

  // re-initalize sliders and axis (which updates scale functions)
  updateSliderMaxMin();
  updateAxis(duration);

  // re-scale static screen position to global dynamic variables (preserves rectangle position)
  nTop = yScale.invert(calcTop);
  nBottom = yScale2.invert(calcBottom);
  nRight = xScale.invert(calcRight);
  nLeft = xScale2.invert(calcLeft);

  // update sliders with re-scaled global variables
  updateSliders();

  // redraw the dynamic rectangle with recalculated values
  updateRect();
}


// update axis when max and min change
function updateAxis(time){

  // adjust the domains only of the four scales, keeping range constant
  xScale.domain([0, maxRight]);
  yScale.domain([maxTop, 0]);
  xScale2.domain([maxLeft, 0]);
  yScale2.domain([0, maxBottom]);

  // update the axis tick values
  xAxis.tickValues([maxRight, (maxRight-minRight)*.75, (maxRight-minRight)*.5, (maxRight-minRight)*.25]);
  yAxis.tickValues([maxTop, (maxTop-minTop)*.75, (maxTop-minTop)*.5, (maxTop-minTop)*.25]);
  xAxis2.tickValues([maxLeft, (maxLeft-minLeft)*.75, (maxLeft-minLeft)*.5, (maxLeft-minLeft)*.25]);
  yAxis2.tickValues([maxBottom, (maxBottom-minBottom)*.75, (maxBottom-minBottom)*.5, (maxBottom-minBottom)*.25]);

  // create transition function (variable)
  var t = holder.transition().duration(time);

  // change axis with transition
  t.select("#x1").call(xAxis);
  t.select("#x2").call(xAxis2);
  t.select("#y1").call(yAxis);
  t.select("#y2").call(yAxis2);
}


// initialize input sliders with values set at top of script file
function updateSliderMaxMin(){
  d3.select("#sTop")
    .property("max", maxTop)
    .property("min", minTop);

  d3.select("#sBottom")
    .property("max", maxBottom)
    .property("min", minBottom);

  d3.select("#sRight")
    .property("max", maxRight)
    .property("min", minRight);

  d3.select("#sLeft")
    .property("max", maxLeft)
    .property("min", minLeft);
}


// initialize input fields with values set at top of script file
function updateInputFields(){
    d3.select("#topMax")
      .property("value", maxTop);
    d3.select("#topMin")
      .property("value", minTop)

    d3.select("#bottomMax")
      .property("value", maxBottom)
    d3.select("#bottomMin")
      .property("value", minBottom)

    d3.select("#rightMax")
      .property("value", maxRight)
    d3.select("#rightMin")
      .property("value", minRight)

    d3.select("#leftMax")
      .property("value", maxLeft)
    d3.select("#leftMin")
      .property("value", minLeft)
}


function updateMetrics(){
  yMetric = nTop*(nBottom);
  xMetric = nRight/(201-nLeft);
  areaMetric = xMetric * yMetric;
}


Math.average = function() {
    var cnt, tot, i;
    cnt = arguments.length;
    tot = i = 0;
    while (i < cnt) tot+= arguments[i++];
    return tot / cnt;
}
