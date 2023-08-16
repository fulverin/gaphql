const domain = "01.kood.tech"
const graphQL = "https://" + domain + "/api/graphql-engine/v1/graphql"
const loginPage = "https://" + domain + "/api/auth/signin"
const PiscineJs = 102
const PiscineGo = 45
const SchoolTasks = 85
const cookieTimeInSeconds = 60
const userQuery = "{user {login attrs auditRatio totalUp totalDown}}"
const totalExpQuery = `{transaction(where: { eventId: { _eq: ${SchoolTasks} }, type:{ _eq: "xp"}}) {amount}}`
const progressQuery = `{progress{id createdAt userId groupId eventId version grade isDone path campus objectId}}`
const transactionQuery = `{transaction(where: { eventId: { _eq: ${SchoolTasks} }, type:{ _eq: "xp"}}, order_by: { createdAt:asc }) {amount path object{name} createdAt }}`
const auditQuery = `{transaction(where: { eventId: { _eq: ${SchoolTasks} }, type:{ _in: ["up","down"]}}, order_by: { createdAt:asc }) {type amount path object{name} createdAt }}`
// const auditQuery = `{transaction(where: { eventId: { _eq: ${SchoolTasks} }, type:["up,"down"]}}, order_by: { createdAt:asc }) {type amount path object{name} createdAt}}`

const roleQuery = "{role{id slug name description user_role{user{ id login profile attrs campus}}}}"
var userKey = "Go to HELL!!!"

if (localStorage.getItem("GraphQLTime") !== null) {
    const date = new Date()
    if (new Date(date.getTime() - 20 * 60000) < new Date(localStorage.getItem("GraphQLTime"))) {
        document.getElementById("loginForm").classList.add("hidden")
        document.getElementById("logout").classList.remove("hidden")
        document.getElementById("pageContent").classList.remove("hidden")
        askData();
    } else {
        killSession("GraphQL", "GraphQLTime", 0)
    }
}

async function askData() {
    document.getElementById("pageContent").innerHTML = ""
    addElement("div", { "id": "userDataMain", "class": "col2" }, "", "pageContent")
    addElement("div", { "id": "GraphDataMain", "class": "col2" }, "", "pageContent")
    addElement("div", { "id": "Title", "class": "container" }, "", "GraphDataMain")
    addElement("div", { "class": "font20" }, "Welcome to Project GraphQL", "Title")
    addElement("button", { "onclick": "logOut()" }, "Log Out", "Title")
    addElement("div", { "id": "Graph1", "class": "container fill" }, "", "GraphDataMain")
    addElement("div", { "id": "Graph2", "class": "container fill" }, "", "GraphDataMain")

    await createUserScreen()
    createTaskGraph()
    createAuditGraph()
    window.addEventListener("resize", function () {
        createTaskGraph()
        createAuditGraph()
    });
}
function logIn() {
    const user = document.getElementById("user").value
    const password = document.getElementById("password").value
    const encodedData = window.btoa(user + ':' + password);
    fetch(loginPage, {
        method: "POST",
        headers: {
            "Content-type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + encodedData,
        },
    })
        .then((response) => response.json())
        .then((response) => {
            if (typeof response.error != "undefined") {
                alert(response.error)
                return
            }
            localStorage.setItem("GraphQL", response);
            localStorage.setItem("GraphQLTime", new Date());
            killSession("GraphQL", "GraphQLTime", 60 * 20)
            document.getElementById("loginForm").classList.add("hidden")
            document.getElementById("logout").classList.remove("hidden")
            document.getElementById("pageContent").classList.remove("hidden")
            askData()
        });
}

function logOut() {
    killSession("GraphQL", 0)
    document.getElementById("loginForm").classList.remove("hidden")
    document.getElementById("pageContent").classList.add("hidden")
    document.getElementById("logout").classList.add("hidden")
    document.getElementById("pageContent").innerHTML = "";
    transactionData = ""
    auditData = ""
}

async function getData(query) {
    let result = await fetch(graphQL, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + localStorage.getItem("GraphQL"),
        },
        body: JSON.stringify({
            query: query
        }),
    })
        .then((response) => response.json())
        .then((response) => {
            return response
        });
    return result
}

function addElement(tag, attr, val = "", into) {
    elem = document.createElement(tag);
    Object.entries(attr).forEach(([key, value]) => elem.setAttribute(key, value));
    elem.innerHTML = val
    document.getElementById(into).append(elem)
}

function addNSElement(tag, attr, val, into) {
    elem = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (let [key, value] of Object.entries(attr)) {
        elem.setAttribute(key, value)
    }
    elem.innerHTML = val
    document.getElementById(into).appendChild(elem)
}

function yyyymmdd(val) {
    var date = new Date(val);
    var yyyy = date.getFullYear();
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    mm = mm < 10 ? "0" + mm : mm;
    dd = dd < 10 ? "0" + dd : dd;
    return yyyy + "/" + mm + "/" + dd
}

function killSession(elem, elem2, seconds) {
    setTimeout(() => {
        localStorage.removeItem(elem);
        localStorage.removeItem(elem2);
        console.log(localStorage.removeItem(elem))
    }, seconds * 1000)
}