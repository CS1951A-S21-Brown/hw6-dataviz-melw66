// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin1 = {top: 40, right: 130, bottom: 40, left: 190};
const margin2 = {top: 40, right: 100, bottom: 40, left: 175};
const margin3 = {top: 40, right: 100, bottom: 150, left: 140};
const radius = 110;

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you"d like
let graph_1_width = (MAX_WIDTH / 2) - 50, graph_1_height = 250;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 300;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

const filename = "data/video_games.csv"

let svg1 = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", `translate(${margin1.left}, ${margin1.top})`);

let svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)
    .attr("height", graph_2_height)
    .append("g")
    .attr("transform", "translate(" + graph_2_width / 3 + "," + graph_2_height / 2 + ")");

let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)
    .attr("height", graph_3_height)
    .append("g")
    .attr("transform", `translate(${margin3.left}, ${margin3.top})`);

let title2 = svg2.append("text")
    .attr("transform", `translate(${(graph_2_width - margin2.left - margin2.right) / 50}, ${-120})`)
    .style("text-anchor", "middle")
    .style("font-size", 15);

const region_back_map = {"Global_Sales": "Total Global Sales (millions)", "EU_Sales": "Total Sales (millions) in Europe", 
                        "JP_Sales": "Total Sales (millions) in Japan", "NA_Sales": "Total Sales (millions) in North America", 
                        "Other_Sales": "Total Sales (millions) in Other Regions"}

let arc_grp = svg2.append("g")
    .attr("class", "arcGrp");

let chart = arc_grp.selectAll("path");

let x3 = d3.scaleBand()
    .range([0, graph_3_width - margin3.left - margin3.right])
    .padding(0.3);
    
let y3 = d3.scaleLinear()
    .range([graph_3_height - margin3.bottom - margin3.top, 0]);

let y_axis_label3 = svg3.append("g").transition().duration(1000);
let x_axis_label3 = svg3.append("g");

const middle_width3 = (graph_3_width - margin3.left - margin3.right) / 2;
const middle_height3 = (graph_3_height - margin3.top - margin3.bottom) / 2;

svg3.append("text")
    .attr("transform", `translate(${middle_width3}, ${530})`)
    .style("text-anchor", "middle")
    .text("Publisher");

let y_axis_text3 = svg3.append("text")
    .attr("transform", `translate(${-50}, ${middle_height3})rotate(-90)`)
    .style("text-anchor", "middle")
    .text("Total Sales (millions)");

let title3 = svg3.append("text")
    .attr("transform", `translate(${middle_width3}, ${-20})`)
    .style("text-anchor", "middle")
    .style("font-size", 15);

// FUNCTIONS____________________________________________________________________________________________________

// GRAPH 1
function setData1() {
    d3.csv(filename).then(function(data) {
        data1 = sortGames(data);
        makeChart1(data1);
    });
}

function sortGames(data) {
    data.sort((a, b) => parseFloat(b["Global_Sales"]) - parseFloat(a["Global_Sales"]));
    if (data.length > 10) {
        return data.slice(0, 10);
    }
    return data;
}

function makeChart1(data1) {
    let x = d3.scaleLinear()
        .range([0, graph_1_width - margin1.left - margin1.right]);
    let y = d3.scaleBand()
        .range([0, graph_1_height - margin1.bottom - margin1.top])
        .padding(0.2);

    let countRef = svg1.append("g");
    let y_axis_label = svg1.append("g");

    const middle_width = (graph_1_width - margin1.left - margin1.right) / 2;

    svg1.append("text")
        .attr("transform", `translate(${middle_width}, ${200})`)
        .style("text-anchor", "middle")
        .text("Global Sales (millions)");

    let title = svg1.append("text")
        .attr("transform", `translate(${middle_width}, ${-20})`)
        .style("text-anchor", "middle")
        .style("font-size", 15);
    
    x.domain([0, d3.max(data1, function(d) { return parseFloat(d["Global_Sales"]);})]);
    y.domain(data1.map(x => x["Name"]));

    y_axis_label.call(d3.axisLeft(y).tickSize(0));

    let bars = svg1.selectAll("rect").data(data1);
    bars.enter()
        .append("rect")
        .merge(bars)
        .attr("fill", "#81c2c3")
        .transition()
        .duration(1000)
        .attr("x", x(0))
        .attr("y", function(d) { return y(d["Name"]); })
        .attr("width", function(d) { return x(parseFloat(d["Global_Sales"])); })
        .attr("height", y.bandwidth());

    let counts = countRef.selectAll("text").data(data1);
    counts.enter()
        .append("text")
        .merge(counts)
        .transition()
        .duration(1000)
        .attr("x", function (d) { return x(d["Global_Sales"]) + 10;})
        .attr("y", function (d) { return y(d["Name"]) + 10;})
        .style("text-anchor", "start")
        .style("font-size", 5)
        .text(function (d) { return d["Global_Sales"];});

    title.text("Top 10 Video Games of All Time");

    bars.exit().remove();
    counts.exit().remove();
}

// GRAPH 2
function setData2(region) {
    d3.csv(filename).then(function(data) {
        const salesPerGenre = getSalesPerGenre(data, region);
        makeChart2(salesPerGenre, region);
    });
}

function getSalesPerGenre(data, region) {
    let salesPerGenre = {};
    for (let i = 0; i < data.length; i++) {
        if (data[i]["Genre"] in salesPerGenre) {
            salesPerGenre[data[i]["Genre"]] += parseFloat(data[i][region]);
        } 
        else {
            salesPerGenre[data[i]["Genre"]] = parseFloat(data[i][region]);
        }
    }
    return salesPerGenre;
}

function makeChart2(data, region) {
    let color = d3.scaleOrdinal()
        .domain(Object.keys(data))
        .range(d3.schemePaired);

    let pie = d3.pie()
      .value(function(d) {return d.value; })
      .sort(function(a, b) { return d3.ascending(a.value, b.value);} );

    let chart_data = pie(d3.entries(data));

    let arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)
    
    chart = chart.data(chart_data);
    chart.exit().remove();

    let tooltip = d3.select("#graph2")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border-radius", "5px")
        .style("border", "solid")
        .style("padding", "5px");

    chart.enter()
        .append("path")
        .on("mouseover", function(d) {
            tooltip.style("left", d3.event.pageX + "px")
                .style("top", d3.event.pageY + "px")
                .style("opacity", 1)
                .text(d.data.key + ": " + d.value.toFixed(2) + " million sales");
        })
        .on("mousemove", function(d) {
            tooltip.style("left", d3.event.pageX + "px")
                .style("top", d3.event.pageY + "px")
        })
        .on("mouseleave", function(d) {
            tooltip.style("opacity", 0)
        })
        .merge(chart)
        .attr("d", arcGenerator)
        .attr("fill", function(d){ return(color(d.data.key)) })
        .attr("stroke", "white")
        .style("stroke-width", "1px");
    
    let legend = svg2.selectAll(".legend")
        .data(chart_data);
    
    let legendEnter = legend.enter()
        .append("g")
        .attr("transform", `translate(240,-140)`)
        .attr("class", "legend");
    
    legend.exit().remove();
    
    legendEnter.append("rect")
        .attr("y", d => 10 * (chart_data.length - d.index) * 1.8)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", d => color(d.data.key));
    legendEnter.append("text")
        .text(d => d.data.key)
        .attr("x", 10 * 1.2)
        .attr("y", d => 10 * (chart_data.length - d.index) * 1.8 + 10)
        .style("font-size", "15px");
    
    title2.text(region_back_map[region] + " by Genre");
}

// GRAPH 3
function setData3(genre) {
    d3.csv(filename).then(function(data) {
        const publishers = getPublisherSales(data, genre);
        makeChart3(publishers, genre);
    });
}

function getPublisherSales(data, genre) {
    let publishersToSales = {};
    for (let i = 0; i < data.length; i++) {
        if (data[i]["Genre"].localeCompare(genre) == 0) {
            if (data[i]["Publisher"] in publishersToSales) {
                publishersToSales[data[i]["Publisher"]] += parseFloat(data[i]["Global_Sales"]);
            } else {
                publishersToSales[data[i]["Publisher"]] = parseFloat(data[i]["Global_Sales"]);
            }
        }
    }
    const keys = Object.keys(publishersToSales);
    let publishers = [];
    for (let i = 0; i < keys.length; i++) {
        publishers.push({"Publisher": keys[i], "Total_Sales": publishersToSales[keys[i]]})
    }
    publishers.sort((a, b) => b["Total_Sales"] - a["Total_Sales"])
    if (publishers.length > 15) {
        return publishers.slice(0, 15);
    }
    return publishers;
}

function makeChart3(data3, genre) {
    x3.domain(data3.map(x => x["Publisher"]));
    y3.domain([0, d3.max(data3, function(d) { return d["Total_Sales"];})]);

    y_axis_label3.call(d3.axisLeft(y3));
    x_axis_label3.attr("transform", `translate(${0}, ${385})`)
        .call(d3.axisBottom(x3))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    let bars = svg3.selectAll("rect").data(data3);

    bars.enter()
        .append("rect")
        .merge(bars)
        .attr("fill", "#66a0e2")
        .transition()
        .duration(1000)
        .attr("x", function(d) { return x3(d["Publisher"]); })
        .attr("y", function(d) { return y3(d["Total_Sales"]); })
        .attr("width", x3.bandwidth())
        .attr("height", function(d) { return graph_3_height - margin3.top - margin3.bottom - y3(d["Total_Sales"]); });

    title3.text("Total Sales of Top 15 Publishers of " + genre + " Games")
    bars.exit().remove();
}

// Update graphs based on dropdown
function update2() {
    const selected = document.getElementById("regions");
    setData2(region_map[selected.options[selected.selectedIndex].text]);
}

function update3() {
    const selected = document.getElementById("genres");
    setData3(selected.options[selected.selectedIndex].text);
}

// MAIN____________________________________________________________________________________________________
document.getElementById("update2").onclick = update2;
document.getElementById("update3").onclick = update3;
const region_map = {"Global": "Global_Sales", "Europe": "EU_Sales", "Japan": "JP_Sales", 
                "North America": "NA_Sales", "Other Regions": "Other_Sales"}
setData1();
setData2("Global_Sales");
setData3("Action");


