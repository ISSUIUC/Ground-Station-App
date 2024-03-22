from flask import Flask, render_template, Response
import cv2
import threading
from gevent.pywsgi import WSGIServer

app = Flask(__name__)

class Camera:
    def __init__(self):
        self.cap = cv2.VideoCapture(0)  # Using the default webcam (index 0)
        self.lock = threading.Lock()
        self.frames = []

    def capture_frames(self):
        while True:
            success, frame = self.cap.read()
            if not success:
                break
            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            with self.lock:
                self.frames = [frame_bytes]

    def get_frame(self):
        with self.lock:
            return self.frames[-1]

camera = Camera()
thread = threading.Thread(target=camera.capture_frames)
thread.daemon = True
thread.start()

@app.route('/')
def index():
    return render_template('index.html')

def generate_frames():
    while True:
        frame = camera.get_frame()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/ping')
def ping():
    return "OK"

if __name__ == '__main__':
    http_server = WSGIServer(('0.0.0.0', 5001), app)
    http_server.serve_forever()
