import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const [userName, setUserName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();

  const fetchUserData = () => {
    const token = localStorage.getItem('token');

    fetch('https://yt-clone-pt2b.onrender.com/SetProfile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUserName(data.name);
        setUserEmail(data.email);
      })
      .catch((error) => {
        // Handle errors
      });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const updateProfile = () => {
    const token = localStorage.getItem('token');

    const updatedData = {
      userName: userName,
    };

    fetch('https://yt-clone-pt2b.onrender.com/update-profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    })
      .then((response) => response.json())
      .then((data) => {
        alert('Profile updated successfully:', data);
        fetchUserData();
      })
      .catch((error) => {
        // Handle errors
      });
  };

  const logout = () => {
    // Clear the token from localStorage
    localStorage.removeItem('token');
    // Redirect to the login page or another appropriate page
    navigate('/');
  };

  const PassChange = () => {
    navigate('/PassChange');
  };

  return (
    <div className="form-container">
      <form className="form">
        <h2>Your Profile</h2>
        <div className="profile-input">
          <label>Name</label>
          <input
            className="underline-input"
            type="text"
            value={userName || ''}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div className="profile-input">
          <label>Email</label>
          <input className="underline-input" type="text" value={userEmail} readOnly />
        </div>

        <div className="profile-button">
        <div className="buttonkab" onClick={updateProfile}>
        <div className="text321">
        <p>Update profile</p>
        </div>
        </div>

        </div>
        <div className="register-link">
          <div className='abit' onClick={PassChange}>Change password</div>
        </div>
        <div className="profile-button">
        <div className="buttonkab" onClick={logout}>
        <div className="text321">
        <p>Log Out</p>
        </div>
        </div>
          

        </div>
      </form>
    </div>
  );
}

export default ProfilePage;
