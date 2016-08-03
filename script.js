// initial parameters for canvas and positions
var width = 2000;
var height = 1000;

var posX = 400;
var posY = 300;

var rule = 0;

var hRatio = 1;
var vRatio = 1;

// starting values for controls, rectangle dimensions and calculated metrics
var nTop = 40;
var nBottom = 50;
var nRight = 200;
var nLeft = 101;
var nHeight = nTop + nBottom;
var nWidth = nLeft + nRight;
var nArea = nHeight * nWidth;

var maxTop = Number(d3.select("#sTop").property("max"));
var maxBottom = Number(d3.select("#sBottom").property("max"));
var maxRight = Number(d3.select("#sRight").property("max"));
var maxLeft = Number(d3.select("#sLeft").property("max"));

var minLeft = Number(d3.select("#sLeft").property("min"));

var yMetric = nTop*(nBottom/100);
var xMetric = nRight/(201-nLeft);
var areaMetric = xMetric * yMetric;

var target = maxTop*(maxBottom/100)*(maxRight/(201-maxLeft))
d3.select("#fTargetArea").property("value", target);

// create svg canvas
var holder = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// create scales for the axis
var xScale = d3.scaleLinear()
    .domain([0, maxRight])
    .range([0, maxRight]);

var yScale = d3.scaleLinear()
    .domain([maxTop, 0])
    .range([-maxTop, 0]);

var xScale2 = d3.scaleLinear()
    .domain([maxLeft, 0])
    .range([-maxLeft, 0]);

var yScale2 = d3.scaleLinear()
    .domain([0, maxBottom/100])
    .range([0, maxBottom]);

// create the generate axis functions
var xAxis = d3.axisBottom()
    .scale(xScale)
    .tickValues([maxRight])
    .tickSize(1);

var yAxis = d3.axisLeft()
    .scale(yScale)
    .tickValues([maxTop])
    .tickSize(1);

var xAxis2 = d3.axisBottom()
    .scale(xScale2)
    .tickValues([maxLeft])
    .tickSize(1);

var yAxis2 = d3.axisLeft()
    .scale(yScale2)
    .tickValues([1])
    .tickFormat(d3.format(".0%"))
    .tickSize(1);

// draw the axis by calling the axis function, each as its own group
holder.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + posX + "," + posY + ")")
    .call(xAxis);

holder.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + posX + "," + posY + ")")
    .call(yAxis);

holder.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + posX + "," + posY + ")")
    .call(xAxis2);

holder.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + posX + "," + posY + ")")
    .call(yAxis2);

// draw the interactive rectangle
holder.append("rect")
    .attr("id", "targetRect")
    .attr("x", posX)
    .attr("y", posY)
    .style("fill", "none")
    .style("stroke", "black")
    .attr("height",nWidth)
    .attr("width", nHeight);

// draw the limit or bounding rectangle based on max dimensions
holder.append("rect")
    .attr("x", posX - maxLeft)
    .attr("y", posY - maxTop)
    .style("stroke", "grey")
    .style("fill", "none")
    .attr("height", maxTop + maxBottom)
    .attr("width", maxRight + maxLeft);

// draw the moving text labels
holder.append("text")
      .attr("id", "areaLabel")
      .attr("text-anchor", "middle")
      .attr("x", posX)
      .attr("y", posY)
      .text(areaMetric.toFixed(0))
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
updateTop(nTop, nBottom);
updateRight(nRight, nLeft);
updateRules();


// Update via top slider, depending on rules
function updateTop(valueTop, valueBottom) {
  // All free
  if (rule == 0){updateAllFree(valueTop, valueBottom, nRight, nLeft)}
  // link opposite
  else if (rule == 1){topLinkOpposite(valueTop)}
  // link adjacent
  else if (rule == 2){topRightLink(valueTop)}

  updateSliders()
}


// Update via top slider, depending on rules
function updateBottom(valueTop, valueBottom) {
  // All free
  if (rule == 0){updateAllFree(valueTop, valueBottom, nRight, nLeft)}
  // link opposite
  else if (rule == 1){bottomLinkOpposite(valueBottom)}
  // link adjacent
  else if (rule == 2){bottomLeftLink(valueBottom)}

  updateSliders()
}


// Update via right slider, depending on rules
function updateRight(valueRight, valueLeft) {
  // All free
  if (rule == 0){updateAllFree(nTop, nBottom, valueRight, valueLeft)}
  // link opposite
  else if (rule == 1){rightLinkOpposite(valueRight)}
  // link adjacent
  else if (rule == 2){rightTopLink(valueRight)}

  updateSliders()
}


// Update via left slider, depending on rules
function updateLeft(valueRight, valueLeft) {

  // All free
  if (rule == 0){updateAllFree(nTop, nBottom, valueRight, valueLeft)}
  // link opposite
  else if (rule == 1){leftLinkOpposite(valueLeft)}
  // link adjacent
  else if (rule == 2){leftBottomLink(valueLeft)}

  updateSliders()
}

// free adjustments of the interactive rectangle
function updateAllFree(valueTop, valueBottom, valueRight, valueLeft) {
  // calculate and update values for controls and rectangle
  nTop = valueTop;
  nBottom = valueBottom;
  nRight = valueRight;
  nLeft = valueLeft;
  nHeight = nTop + nBottom;
  nWidth = nRight + nLeft;
  nArea = nHeight * nWidth;

  yMetric = nTop*(nBottom/100);
  xMetric = nRight/(201-nLeft);
  areaMetric = xMetric * yMetric;

  updateRect()
}

// change top, link to bottom
function topLinkOpposite(valueTop) {
  // calculate and update values for controls and rectangle
  nTop = valueTop;
  var calcBottom = 100 * yMetric / nTop;

  if (calcBottom <= maxBottom) {
    nBottom = calcBottom;
  }

  else {
    nBottom = maxBottom;
    nTop = yMetric;
  }

  nHeight = nTop + nBottom;
  nArea = nHeight * nWidth;

  updateRect()
}

// change bottom, link to top
function bottomLinkOpposite(valueBottom) {
  // calculate and update values for controls and rectangle
  nBottom = valueBottom;
  var calcTop = yMetric / (nBottom/100);

  if (calcTop <= maxTop) {
    nTop = calcTop;
  }

  else {
    nTop = maxTop;
    nBottom = yMetric;
  }

  nHeight = nTop + nBottom;
  nArea = nHeight * nWidth;

  updateRect()
}

// change right, link to left
function rightLinkOpposite(valueRight) {
  // calculate and update values for controls and rectangle
  nRight = valueRight;
  var calcLeft = 201-(nRight / xMetric);

  if (calcLeft <= maxLeft && calcLeft >= minLeft) {
    nLeft = calcLeft;
  }

  else if (calcLeft < minLeft) {
    nLeft = minLeft;
    nRight = xMetric * (201-nLeft);
  }

  else {
    nLeft = maxLeft;
    nRight = xMetric;
  }

  nWidth = nLeft + nRight;
  nArea = nHeight * nWidth;

  updateRect()
}

// change left, link to right
function leftLinkOpposite(valueLeft) {
  // calculate and update values for controls and rectangle
  nLeft = valueLeft;
  var calcRight = xMetric * (201-nLeft);

  if (calcRight <= maxRight) {
    nRight = calcRight;
  }

  else {
    nRight = maxRight;
    nLeft = xMetric;
  }

  nWidth = nLeft + nRight;
  nArea = nHeight * nWidth;

  updateRect()
}

// change top, link to right
function topRightLink(valueTop) {
  // calculate and update values for controls and rectangle
  nTop = valueTop;
  var calcRight = (areaMetric * (201 - nLeft)) / (nTop * nBottom / 100)

  if (calcRight <= maxRight) {
    nRight = calcRight;
  }

  else {
    nRight = maxRight;
    var calcTop = (areaMetric * (201 - nLeft)) / (nRight * nBottom / 100)
    nTop = calcTop;
  }

  nHeight = nTop + nBottom
  nWidth = nLeft + nRight;
  nArea = nHeight * nWidth;

  yMetric = nTop*(nBottom/100);
  xMetric = nRight/(201-nLeft);

  updateRect()
}

// change right, link to top
function rightTopLink(valueRight) {
  // calculate and update values for controls and rectangle
  nRight = valueRight;
  var calcTop = (areaMetric * (201 - nLeft)) / (nRight * nBottom / 100)

  if (calcTop <= maxTop) {
    nTop = calcTop;
  }

  else {
    nTop = maxTop;
    var calcRight = (areaMetric * (201 - nLeft)) / (nTop * nBottom / 100)
    nRight = calcRight;
  }

  nHeight = nTop + nBottom
  nWidth = nLeft + nRight;
  nArea = nHeight * nWidth;

  yMetric = nTop*(nBottom/100);
  xMetric = nRight/(201-nLeft);

  updateRect()
}

// change bottom, link to left
function bottomLeftLink(valueBottom) {
  // calculate and update values for controls and rectangle
  nBottom = valueBottom;
  var calcLeft = 201 - ((nRight * nBottom * nTop / 100) / areaMetric)

  if (calcLeft <= maxLeft && calcLeft >= minLeft) {
    nLeft = calcLeft;
  }

  else if (calcLeft < minLeft) {
    nLeft = minLeft
    var calcBottom = (areaMetric * (201 - nLeft)) / (nRight * nTop / 100);
    nBottom = calcBottom;
  }

  else if (calcLeft > maxLeft) {
    nLeft = maxLeft;
    var calcBottom = (areaMetric * (201 - nLeft)) / (nRight * nTop / 100);
    nBottom = calcBottom;
  }

  nHeight = nTop + nBottom;
  nWidth = nLeft + nRight;
  nArea = nHeight * nWidth;

  yMetric = nTop*(nBottom/100);
  xMetric = nRight/(201-nLeft);

  updateRect()
}

// change left, link to bottom
function leftBottomLink(valueLeft) {
  // calculate and update values for controls and rectangle
  nLeft = valueLeft;
  var calcBottom = (areaMetric * (201 - nLeft)) / (nRight * nTop / 100);

  if (calcBottom <= maxBottom) {
    nBottom = calcBottom;
  }

  else {
    nBottom = maxBottom;
    var calcLeft = 201 - ((nRight * nBottom * nTop / 100) / areaMetric);
    nLeft = calcLeft;
  }

  nHeight = nTop + nBottom
  nWidth = nLeft + nRight;
  nArea = nHeight * nWidth;

  yMetric = nTop*(nBottom/100);
  xMetric = nRight/(201-nLeft);

  updateRect()
}

// update the interactive rectangle
function updateRect(){
  // calculate color
  var colorRatio = areaMetric/target;
  if (colorRatio >= 1) {colorRatio = 1}

  holder.select("#targetRect")
    .attr("x", posX-(nLeft))
    .attr("y", posY-(nTop))
    .attr("width", nWidth)
    .attr("height", nHeight)
    .style("fill", function(d) { return "hsla(" + Math.floor(colorRatio * 220) + ", 70%, 70%, .9)"});

  holder.select("#areaLabel")
        .attr("x", posX + (-nLeft + nRight)/2)
        .attr("y", posY + 5 + (-nTop + nBottom)/2)
        .text(areaMetric.toFixed(2) + " PWH");
}

// update the sliders
function updateSliders() {
  // adjust the text in the range sliders
  d3.select("#sTop-value").text(nTop.toFixed(0));
  d3.select("#sTop").property("value", nTop);

  d3.select("#sBottom-value").text(nBottom.toFixed(0));
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

// Update the target value
function updateTarget(form) {
  target = Number(form.targetArea.value);
  console.log(target);
  updateRect();
}
