import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios'

function App() {
  const intervalRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [prediction, setPrediction] = useState(null)
  const [stream, setStream] = useState(null);
  const [tensor, setTensor] = useState(null);

  useEffect(() => {
    const getVideo = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }

    };

    getVideo();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);


  useEffect(() => {
    if (stream && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const processFrame = async () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = 320;
          canvas.height = 320;
          ctx.drawImage(video, 0, 0, 320, 320);

          const imageData = ctx.getImageData(0, 0, 320, 320).data;
          const imgArray = [];

          for (let i = 0; i < imageData.length; i += 4) {
            imgArray.push(imageData[i] / 255.0); // Red
            imgArray.push(imageData[i + 1] / 255.0); // Green
            imgArray.push(imageData[i + 2] / 255.0); // Blue
          }

          const reshapedArray = [imgArray];

          console.log(reshapedArray);

          const registerRequest = await axios.post("https://modelo-incendio-back.onrender.com/firecheck", { data: reshapedArray });
          console.log(registerRequest)
          console.log(registerRequest.data.hello)
          setPrediction(registerRequest.data.hello)
        }
      };

      const intervalId = setInterval(processFrame, 2000); // Process every 2 seconds

      return () => clearInterval(intervalId); // Clear the interval on unmount
    }
  }, [stream]);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div>
        <h2>
          {prediction ? prediction : ""}
        </h2>
      </div>
    </div>
  )
}

export default App
