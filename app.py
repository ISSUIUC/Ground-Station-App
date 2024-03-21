from flask import Flask, render_template, Response
import cv2
import threading
import os

app = Flask(__name__)

# Global variables
frame_dir = 'frames'
if not os.path.exists(frame_dir):
    os.makedirs(frame_dir)

def generate_frames():
    cap = cv2.VideoCapture(0)  # Using the default webcam (index 0)

    while True:
        success, frame = cap.read()
        if not success:
            break

        frame_path = os.path.join(frame_dir, 'frame.jpg')
        cv2.imwrite(frame_path, frame)

        with open(frame_path, 'rb') as f:
            frame_bytes = f.read()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)  # Run on all network interfaces
