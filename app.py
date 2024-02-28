from flask import Flask, render_template, Response
import cv2
from time import sleep


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

def generate_frames():
    video_path = 'SA Cup Launch.mp4'  # Update with your video file path
    cap = cv2.VideoCapture(video_path)

    while True:
        success, frame = cap.read()
        if not success:
            break

        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        sleep(0.016)
@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True)
