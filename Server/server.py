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
        response.raise_for_status()  # Raise an exception if the request was not successful
        return response.text  # Return the website content
    except requests.exceptions.RequestException as e:
        print(f"Error fetching website content: {e}")
        return None
    
# Function to track changes in the websites, this will run in threads
def track_url(url):
    prev = website(url)
    while True:
        curr = website(url)
        if curr!=prev:
            print("Change detected in ", url)
            with queue_lock:
                queue.put(url)
        time.sleep(2)
        prev = curr

# Endpoint to constantly check the server for updates       
@app.route('/check', methods=['POST'])
def updater():
    with queue_lock:
        if not queue.empty():
            url = queue.get()
            return url
        else:
            return 'NA'


@app.route('/add', methods=['POST'])
def add_url():
    req = request.get_data(as_text=True)
    body = req.splitlines()
    url = body[0]
    # Add URL to the hashset
    # urlID=urlID+1
    with map_lock:
        # time.sleep(5)
        if url in url_map:
            return 'ERROR'
        else:
            global urlID
            urlID+=1
            url_map[url] = urlID
            print(urlID)
            #launch thread here
            thread = threading.Thread(target=track_url, args=(url,))
            thread.start()
            return str(urlID)  

if __name__ == '__main__':
    port = 8080  # Set your desired port value here
    app.run(port=port)
