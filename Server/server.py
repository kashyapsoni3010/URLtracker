from flask import Flask, request
from flask_cors import CORS
import threading
import requests
import time
import logging
from queue import Queue
app = Flask(__name__)
CORS(app)
# Disable Flask logger
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# List of shared datastructures and locks for mutex
urlID = 0
queue = Queue()
queue_lock = threading.Lock()
url_map = {}
map_lock = threading.Lock()

# Function to retreive text data from the url
def website(url):
    try:
        response = requests.get(url)
        # Raise an exception if the request was not successful
        response.raise_for_status()  
        # Return the website content
        return response.text  
    except requests.exceptions.RequestException as e:
        return "ERROR"
    
# Function to track changes in the websites, this will run in threads
def track_url(url, id):
    print("started tracking: ", url)
    prev = website(url)
    flag = True
    while flag:
        with map_lock:
            if url not in url_map:
                flag = False
        curr = website(url)
        if curr!=prev:
            print("Change detected in ", url)
            with queue_lock:
                pair = (url, id)
                queue.put(pair)
        time.sleep(2)
        prev = curr
    print("Ended tracking ", url)


# Endpoint to add link and create thread for link monitoring
@app.route('/add', methods=['POST'])
def add_url():
    req = request.get_data(as_text=True)
    url = req
    # Add URL to the hashmap
    with map_lock:
        # time.sleep(5)
        if url in url_map:
            return 'DUPLICATE'
        if website(url)=="ERROR":
            return 'ERROR'
        else:
            global urlID
            urlID+=1
            url_map[url] = urlID
            print("added: ",url)
            #launch thread
            thread = threading.Thread(target=track_url, args=(url,urlID,))
            thread.start()
            pair = (url, str(urlID))
            resp = "\n".join(pair)
            return resp 

# Endpoint to constantly check the server for updates       
@app.route('/check', methods=['POST'])
def updater():
    with queue_lock:
        if not queue.empty():
            url = queue.get()
            return url[0]
        else:
            return 'NA'

# Endpoint to remove links from monitoring and kill thread
@app.route('/remove', methods=['POST'])
def remove():
    req = request.get_data(as_text=True)
    print("received req to remove ",req)
    with map_lock:
        if req in url_map:
            del url_map[req]
    return ''


if __name__ == '__main__':
    port = 8080 
    app.run(port=port)
