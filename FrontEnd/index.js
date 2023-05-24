var hashmap = {};
var counter = 0;
var frequency = 2;
function handleSubmit(event) {
    event.preventDefault(); 
    // Get form data
    var form = event.target;
    var link = form.elements.url.value;
    // Call JavaScript function with form data
    addURL(link);
}

function addURL(link){
    // console.log(link);
    fetch('http://127.0.0.1:8080/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: link,
    })
    .then(response => response.text())
    .then(result => {
        // Process the response from the server
        // console.log(result);
        if (result=="ERROR"){
            //display error message
            console.log("ERROR");
            alert("Invalid URL")
        }
        else if(result == "DUPLICATE"){
            alert("Link is being monitored");
        }
        else{
            //call function fopr dom manipulation on the given link
            // Console.log("OKAY");
            splitStr = result.split("\n");
            console.log(splitStr[1]);
            let id = parseInt(splitStr[1]);
            hashmap[link] = id;
            //function for dom manipulation
            addElement(link, id);
        }
    })
    .catch(error => {
        console.error(error);
        // Handle the error
        //display there was some error in adding the link to server message
    });   
}
function start(){
    console.log(frequency);
    fetch('http://127.0.0.1:8080/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: ""
    })
    .then(response => response.text())
    .then(result => {
        if (result!="NA"){
            counter++;
            splitStr = result.split("|");
            url = splitStr[0];
            time = splitStr[1];
            console.log(result);
            changeUpdate(url, time, counter);
        }
    })
    .catch(error => {
        console.error(error);
    });
}
setInterval(start, frequency*2000);

function remove(url){
    fetch('http://127.0.0.1:8080/remove', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: url
    })
    .then(response => response.text())
    .then(result => {

    })
    .catch(error => {
        console.error(error);
    });
}


function changeUpdate(url, currtime, id){
    var urlList = document.getElementById('list');
    var name = "link-"+id;
    var box = document.createElement(name);
    box.textContent = currtime + "::" + url;
    urlList.appendChild(box);
    var firstChild = urlList.firstChild;
    urlList.insertBefore(box, firstChild);
}
function addElement(url, id){
    var form = document.createElement("form");
    form.id = "link-"+id;
    form.className = "links"
    var left = document.createElement("div");
    left.className = "components";
    left.textContent = url;
    // var urlDisplay = document.createElement("p");
    // urlDisplay.textContent = url;
    // left.appendChild(urlDisplay);
    var right = document.createElement("div");
    right.className = "components";
    var button = document.createElement("button");
    button.textContent = "Remove";
    button.onclick = function() {
        handleRemove(form.id, url);
    };
    right.appendChild(button);
    form.appendChild(left);
    form.appendChild(right);
    var container = document.getElementById("urlList");
    container.appendChild(form);
    // Post a req to remove the url from server()
    // 
}
function handleRemove(name, url){
    console.log("Sending remove req");
    remove(url);
    // var name = "link-2";
    // alert("name of ID "+name);
    var divElement = document.getElementById(name);
    if (divElement) {
        // Remove the div element from its parent
        divElement.remove(divElement);
    }
}
function decrease(){
    frequency++;
    let updateText = document.getElementById('center');
    var str = frequency+" Seconds";
    updateText.textContent = str;
}
function increase(){
    if(frequency==1){
        alert("Cannot increase the frequency");
        return;
    }
    frequency--;
    let updateText = document.getElementById('center');
    var str = frequency+" Seconds";
    updateText.textContent = str;
}