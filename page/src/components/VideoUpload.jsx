import React, { useState } from 'react';
import axios from 'axios';

const VideoUpload = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setError('Please select a video file.');
      return;
    }
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post('https://yt-clone-backend-05d9.onrender.com/upload-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
           Authorization: `Bearer ${token}`, // Send the JWT token in the Authorization header
        },
      });

      setVideoUrl(response.data.videoUrl);
      alert('Video uploaded successfully!');
    } catch (err) {
      setError('Error uploading video.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1>Upload Video</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <input type="file" accept="video/*" onChange={handleFileChange} />
        </div>
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {videoUrl && (
        <div>
          <h2>Uploaded Video</h2>
          <video width="320" height="240" controls>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
