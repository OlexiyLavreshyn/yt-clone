import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';

const MainPage = () => {
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch all videos or search videos by name
  const fetchVideos = async (query = '') => {
    try {
      const token = localStorage.getItem('token'); // Get the JWT token from localStorage
      const response = await axios.get('https://yt-clone-backend-05d9.onrender.com/videos', {
        params: { search: query }, // Send search query to the backend
        headers: {
          Authorization: `Bearer ${token}`, // Send the JWT token in the Authorization header
        },
      });
      setVideos(response.data); // Update the state with the fetched videos
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle search submission
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchVideos(searchQuery); // Fetch videos based on the search query
  };

  // Redirect to /videoupload
  const redirectToUpload = () => {
    navigate('/videoupload'); // Redirect to the /videoupload route
  };

  // Fetch videos on component mount and whenever searchQuery changes
  useEffect(() => {
    fetchVideos(searchQuery);
  }, [searchQuery]);

  return (
    <div>
      <h1>All Uploaded Videos</h1>

      {/* Search form */}
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search by video name"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button type="submit">Search</button>
      </form>

      {/* Redirect Button */}
      <button onClick={redirectToUpload}>Upload a Video</button>

      {/* Video List */}
      <div>
        {videos.length === 0 ? (
          <p>No videos found</p>
        ) : (
          videos.map((video) => (
            <div key={video.id}>
              <h3>{video.VideoName}</h3>
              <video width="600" controls>
                <source src={video.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MainPage;
