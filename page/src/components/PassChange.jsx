import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PassChange() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const navigate = useNavigate();

  const Profile = () => {
    // Programmatically navigate to a specific route
    navigate('/Profile');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the new password and confirm new password match
    if (newPassword !== confirmNewPassword) {
      alert('New password and confirm new password do not match');
      return;
    }

    // Create a request body with old and new passwords
    const data = {
      oldPassword,
      newPassword,
    };

    const token = localStorage.getItem('token'); // Get the user's token from localStorage

    // Send a POST request to your backend to change the password
    try {
      const response = await fetch('https://yt-clone-pt2b.onrender.com/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('Password changed successfully');
        navigate('/Profile');
      } else {
        const errorData = await response.json();
        alert(`Password change failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Password change failed. Please try again later.');
    }
  };

  return (
    <div className="form-container">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Password Change</h2>
        <div className="profile-input">
          <label>Enter old password</label>
          <input
            className="underline-input"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>
        <div className="profile-input">
          <label>Enter new password</label>
          <input
            className="underline-input"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="profile-input">
          <label>Confirm new password</label>
          <input
            className="underline-input"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
        </div>
        <div className="profile-button">
          <button className="submit-button" type="submit">
            Submit Changes
          </button>
        </div>
        <div className="register-link">
          <div className='abit' onClick={Profile}>Change userdata</div>
        </div>
      </form>
    </div>
  );
}

export default PassChange;
