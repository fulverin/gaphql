// const graphMargin = 15
// const graphHeader = 20
var transactionData = ""
var auditData = ""

async function createTaskGraph() {
    if (transactionData == "") {
        var response = await getData(transactionQuery);
        transactionData = clearResponse(response.data.transaction, "bar")
    }
    if (document.contains(document.getElementById("svgGraph1"))) {
        document.getElementById("svgGraph1").remove()
    }
    createBarChart(transactionData, "Graph1", "Earned points from finished tasks");
}
async function createAuditGraph() {
    if (auditData == "") {
        var response = await getData(auditQuery);
        auditData = clearResponse(response.data.transaction)
    }
    if (document.contains(document.getElementById("svgGraph2"))) {
        document.getElementById("svgGraph2").remove()
    }
    createLineChart(auditData, "Graph2", "Audit progression")
}

function clearResponse(response, type) {
    if (type == "bar") {
        Object.values(response).forEach((x) => {
            x.path = x.path.slice(x.path.lastIndexOf("/") + 1)
            x.createdAt = yyyymmdd(x.createdAt)
            x.object = x.object.name
        });
        return response
    } else {
        var array = [];
        var order = ""
        var j = -1;
        for (i = 0; i < response.length; i++) {
            response[i].createdAt = yyyymmdd(response[i].createdAt)
            if (response[i].createdAt != order) {
                j++
                order = response[i].createdAt;
                array[j] = {};
                array[j].createdAt = response[i].createdAt;
                array[j].titleUp = [];
                array[j].titleDown = [];
                array[j].amountUp = 0;
                array[j].amountDown = 0;
                if (response[i].type == "up") {
                    if (!(array[j].titleUp.includes(response[i].path.slice(response[i].path.lastIndexOf("/") + 1)))) {
                        array[j].titleUp.push(response[i].path.slice(response[i].path.lastIndexOf("/") + 1));
                    }
                    array[j].amountUp = array[j].amountUp + response[i].amount;
                } else if (response[i].type == "down") {
                    if (!(array[j].titleDown.includes(response[i].path.slice(response[i].path.lastIndexOf("/") + 1)))) {
                        array[j].titleDown.push(response[i].path.slice(response[i].path.lastIndexOf("/") + 1));
                    }
                    array[j].amountDown = array[j].amountDown + response[i].amount;
                }
            } else {
                if (response[i].type == "up") {
                    if (!(array[j].titleUp.includes(response[i].path.slice(response[i].path.lastIndexOf("/") + 1)))) {
                        array[j].titleUp.push(response[i].path.slice(response[i].path.lastIndexOf("/") + 1));
                    }
                    array[j].amountUp = array[j].amountUp + response[i].amount;
                } else if (response[i].type == "down") {
                    if (!(array[j].titleDown.includes(response[i].path.slice(response[i].path.lastIndexOf("/") + 1)))) {
                        array[j].titleDown.push(response[i].path.slice(response[i].path.lastIndexOf("/") + 1));
                    }
                    array[j].amountDown = array[j].amountDown + response[i].amount;
                }
            }
        }
        return array
    }
}


function yAxisMaxValue(response, dict) {
    const key = Object.keys(dict);
    var valArray = []
    dict[key].forEach(() => valArray.push(0))
    Object.values(response).forEach(x => {
        for (i = 0; i < dict[key].length; i++) {
            var value = Array.isArray(x[dict[key[0]][i]]) ? x[dict[key[0]][i]].reduce(function (acc, obj) { return acc + obj.amount; }, 0) : x[dict[key[0]][i]];
            if (key[0] == "max") {
                valArray[i] = valArray[i] < value ? value : valArray[i];
            } else {
                valArray[i] = valArray[i] + value;
            }
        }
    });
    return Math.max(...valArray)
}

function graphDims(GraphDiv, response, xAxis, yAxis, orientation) {
    var dims = {}
    var h = document.getElementById(GraphDiv).clientHeight - 20
    var w = document.getElementById(GraphDiv).clientWidth - 20
    dims["svgH"] = h;
    dims["svgW"] = w;
    addNSElement("svg", { "id": "svg" + GraphDiv, "height": dims["svgH"], "width": dims["svgW"], }, "", GraphDiv)
    dims["mass"] = Math.floor(dims["svgW"] / response.length)

    dims["maxV"] = yAxisMaxValue(response, xAxis)

    dims["xLen"] = yBarWidth(dims["maxV"], "svg" + GraphDiv) + 20
    dims["yLen"] = xBarHeight(response, yAxis, "svg" + GraphDiv) + 20
    dims["rectW"] = Math.floor((dims["svgW"] - dims["xLen"]) / response.length * 100) / 100 - 4

    // console.log(GraphDiv, dims)
    return dims
}

function yBarWidth(val, GraphDiv) {
    addNSElement("text", { "id": "del", }, yTitles(val), GraphDiv)
    width = Math.ceil(document.getElementById("del").getBBox().width)
    document.getElementById("del").remove()
    return width
}

function yTitles(val) {
    return val > 1000 * 1000 ? Math.round(val / (1000 * 1000) * 100) / 100 + "MB" : val > 1000 ? Math.round(val / (1000) * 10) / 10 + "kB" : Math.round(val) + "B";
}

function xBarHeight(response, yAxis, GraphDiv) {
    val = 0
    Object.values(response).forEach((x) => {
        addNSElement("text", { "id": "del", "class": "gtext2" }, x[yAxis], GraphDiv)
        width = Math.ceil(document.getElementById("del").getBBox().width)
        var c = Math.ceil(Math.sqrt(width * width / 2))
        val = val < c ? c : val;
        document.getElementById("del").remove()
    });
    return val
}
function createLineChart(response, GraphDiv, title, orientation = "LeftRight") {
    // console.log(GraphDiv, response)
    var dims = graphDims(GraphDiv, response, { "sum": ["amountUp", "amountDown"] }, "path", orientation)
    addNSElement("text", { "x": (dims["svgW"] / 2), "y": "15", "text-anchor": "middle" }, title, "svg" + GraphDiv)
    addNSElement("text", { "class": "gtext", "x": "0", "y": "0", "text-anchor": "middle", "transform": "rotate(-90) translate(-" + (dims["svgH"] / 2) + " 10)" }, "XP", "svg" + GraphDiv)
    addNSElement("line", { "x1": dims["xLen"], "y1": 20, "x2": dims["xLen"], "y2": dims["svgH"] - dims["yLen"] + 5, "stroke": "gray" }, "", "svg" + GraphDiv)
    buildYaxis("svg" + GraphDiv, dims)
    buildXaxis("svg" + GraphDiv, dims, "createdAt", response)
    buildData("svg" + GraphDiv, dims, response, { "Audit Points received": "amountUp" }, "line", [{ "Project": "titleUp" }, { "Finish date": "createdAt" }], "red")
    buildData("svg" + GraphDiv, dims, response, { "Audit Points done": "amountDown" }, "line", [{ "Project": "titleDown" }, { "Finish date": "createdAt" }], "green")
}
function createBarChart(response, GraphDiv, title, orientation = "LeftRight") {
    var dims = graphDims(GraphDiv, response, { "max": ["amount"] }, "path", orientation)
    addNSElement("text", { "x": (dims["svgW"] / 2), "y": "15", "text-anchor": "middle" }, title, "svg" + GraphDiv)
    addNSElement("text", { "class": "gtext", "x": "0", "y": "0", "text-anchor": "middle", "transform": "rotate(-90) translate(-" + (dims["svgH"] / 2) + " 10)" }, "XP", "svg" + GraphDiv)
    addNSElement("line", { "x1": dims["xLen"], "y1": 20, "x2": dims["xLen"], "y2": dims["svgH"] - dims["yLen"] + 5, "stroke": "gray" }, "", "svg" + GraphDiv)
    buildYaxis("svg" + GraphDiv, dims)
    buildXaxis("svg" + GraphDiv, dims, "path", response)
    buildData("svg" + GraphDiv, dims, response, { "XP Earned": "amount" }, "bar", [{ "Project": "path" }, { "Full name": "object" }, { "Finish date": "createdAt" }], "lightblue")
}

function buildData(svg, dims, response, measure, type, tooltip, color) {
    measureName = Object.values(measure)[0]
    addNSElement("g", { "id": svg + measureName, "class": "xAxis" }, "", svg)
    var ly = 0
    var lastX = 0
    var lastY = 0

    for (i = 0; i < response.length; i++) {
        var tooltipData = [...tooltip];
        tooltipData.push(measure)
        var rectH = response[i][measureName] / dims["maxV"] * (dims["svgH"] - dims["yLen"] - 20)
        if (type == "bar") {
            var x = dims["xLen"] + 4 + (i * (dims["rectW"] + 4));
            var y = (dims["svgH"] - dims["yLen"]) - rectH;
            addNSElement("rect", { "x": x, "y": y, "height": rectH, "width": dims["rectW"], "fill": color, "rx": "2", "onmousemove": "showTooltip(evt," + JSON.stringify(tooltipData) + ", " + JSON.stringify(response[i]) + ")", "onmouseout": "hideTooltip();" }, "", svg + measureName)
        } else {
            const r = 5
            var x = dims["xLen"] + 4 + (i * (dims["rectW"] + 4)) + dims["rectW"] / 2;
            var y = (dims["svgH"] - dims["yLen"]) - rectH - r - ly;
            ly = rectH + ly
            if (lastX != 0) {
                addNSElement("line", { "x1": x, "y1": y, "x2": lastX, "y2": lastY, "stroke": color, "stroke-width": "2" }, "", svg + measureName)
            }
            addNSElement("circle", { "cx": x, "cy": y, "r": r, "stroke": "black", "stroke-width": "1", "fill": color, "onmousemove": "showTooltip(evt," + JSON.stringify(tooltipData) + ", " + JSON.stringify(response[i]) + ")", "onmouseout": "hideTooltip();" }, "", svg + measureName)
            lastX = x
            lastY = y
        }
    }
}

function buildYaxis(svg, dims) {
    addNSElement("g", { "id": svg + "yAxis", "class": "yAxis" }, "", svg)
    addNSElement("line", { "x1": dims["xLen"] - 5, "y1": dims["svgH"] - dims["yLen"], "x2": dims["svgW"], "y2": dims["svgH"] - dims["yLen"], "stroke": "gray" }, "", svg + "yAxis")
    addNSElement("text", { "class": "gtext2", "x": dims["xLen"] - 10, "y": dims["svgH"] - dims["yLen"] + 3, "text-anchor": "end" }, "0B", svg + "yAxis")
    var subCnt = Math.floor((dims["svgH"] - dims["yLen"] - 20) / 40);
    var maxV = Math.round((subCnt * 40) / (dims["svgH"] - dims["yLen"] - 20) * dims["maxV"])
    for (i = 1; i <= subCnt; i++) {
        var x1 = dims["xLen"] - 5
        var x2 = dims["svgW"]
        var y = dims["svgH"] - dims["yLen"] - (i * 40)
        addNSElement("line", { "x1": x1, "y1": y, "x2": x2, "y2": y, "stroke": "gray", "stroke-dasharray": "5,5" }, "", svg + "yAxis")
        addNSElement("text", { "class": "gtext2", "x": dims["xLen"] - 10, "y": y + 3, "text-anchor": "end" }, yTitles(maxV / subCnt * i), svg + "yAxis")
    }
}

function buildXaxis(svg, dims, xAxis, response) {
    addNSElement("g", { "id": svg + "datatitle", "class": "xAxis" }, "", svg)
    addNSElement("g", { "id": svg + "xAxis", "class": "xAxis" }, "", svg)
    for (i = 0; i < response.length; i++) {
        addNSElement("line", { "x1": dims["xLen"] + 4 + (i * (dims["rectW"] + 4)) + dims["rectW"] / 2, "y1": (dims["svgH"] - dims["yLen"]) + 5, "x2": dims["xLen"] + 4 + (i * (dims["rectW"] + 4)) + dims["rectW"] / 2, "y2": (dims["svgH"] - dims["yLen"]), "stroke": "gray" }, "", svg + "xAxis")
        addNSElement("text", { "class": "gtext2", "x": 0, "y": 0, "transform": `translate(${dims["xLen"] + 4 + (i * (dims["rectW"] + 4)) + dims["rectW"] / 2}, ${dims["svgH"] - dims["yLen"] + 10}) rotate(-45)`, "text-anchor": "end" }, response[i][xAxis], svg + "datatitle")
    }
}

// function showTooltip(e, data) {
function showTooltip(e, data, response) {
    var tooltip = document.getElementById("tooltip");
    tooltip.innerHTML = ""
    var i = 0
    Object.values(data).forEach(x => {
        i++
        var title = Object.keys(x)[0] + ":"
        var value = response[Object.values(x)[0]]
        // if (value != "") {
        addElement("tr", { "id": "tooltip_tr" + i }, "", "tooltip")
        addElement("td", {}, title, "tooltip_tr" + i)
        addElement("td", {}, value, "tooltip_tr" + i)
        // }
    });


    var tooltipW = tooltip.offsetWidth;
    // var tooltipH = tooltip.offsetHeight;
    tooltip.style.display = "block";
    tooltip.style.left = e.pageX + 40 + tooltipW > window.innerWidth ? e.pageX - 10 - tooltipW + 'px' : e.pageX + 10 + 'px';
    tooltip.style.top = e.pageY + 10 + 'px';

    // console.log(data)

    // tooltip.innerHTML = "<b>Project</b>: " + text + "<br><b>Full name</b>: " + title + "<br><b>Finish date</b>: " + date + "<br><b>Gained XP</b>: " + value;
}
function hideTooltip() {
    var tooltip = document.getElementById("tooltip");
    tooltip.style.display = "none";
}
