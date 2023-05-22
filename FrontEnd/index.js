// var hashmap = {};
var counter = 0;
function handleSubmit(event) {
    event.preventDefault(); 
    // Get form data
    var form = event.target;
    var link = form.elements.url.value;
    // Call JavaScript function with form data
    addURL(link);
}

function start(){
    fetch('http://127.0.0.1:8080/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: ""
    })
    .then(response => response.text())
    .then(result => {
        // Process the response from the server
        // console.log(result);
        
        if (result!="NA"){
            //display error message
            // console.log(result);
            //call function fopr dom manipulation on the given link
            // var urlID = hashmap[result];
            counter++;
            changeUpdate(result, counter);

        }
    })
    .catch(error => {
        console.error(error);
    });
}
setInterval(start, 2000);


// connect to the server
// send it a post req
// wait for it's response
// on appropriate response, add the link name and do necessary dom manipulation
// else display error message
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
            alert("Link is being monitored")
            console.log("ERROR");
        }
        else{
            //call function fopr dom manipulation on the given link
            // Console.log("OKAY");
            let id = parseInt(result);
            
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
function changeUpdate(url, id){
    var urlList = document.getElementById('changes');
    var name = "link-"+id;
    var box = document.createElement(name);
    box.textContent = url;
    urlList.appendChild(box);
}
function addElement(url, id){
    var urlList = document.getElementById('urlList');
    var name = "link-"+id;
    var box = document.createElement(name);
    box.textContent = url;
    urlList.appendChild(box);
    // var link = document.createElement(url+'link');


}
