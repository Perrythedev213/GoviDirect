import os
import sys
import threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import webview


if getattr(sys, "frozen", False):
    BASE_DIR = sys._MEIPASS
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class GoviDirectHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)


def start_server():
    server = ThreadingHTTPServer(("127.0.0.1", 0), GoviDirectHandler)

    port = server.server_address[1]

    threading.Thread(
        target=server.serve_forever,
        daemon=True
    ).start()

    return server, port


server, port = start_server()


window = webview.create_window(
    "GoviDirect",
    f"http://127.0.0.1:{port}/Loading/index.html",
    width=1400,
    height=900,
    min_size=(1000, 700),
    resizable=True
)


def on_start():
    window.maximize()


webview.start(on_start)

server.shutdown()