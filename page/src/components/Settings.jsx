import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import '../css/Settings.css'; // Import your CSS file for styling

const Settings = () => {
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [gender, setGender] = useState("Не вказано");
  const [bio, setBio] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  const [avatarBase64, setAvatarBase64] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUsername(decodedToken.userName);
      setUserId(decodedToken.userId);
      setNewUsername(decodedToken.userName); // Pre-fill the newUsername field
  
      fetch(`https://yt-clone-pt2b.onrender.com/get-user-info?userId=${decodedToken.userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        setGender(data.gender);
        setBio(data.bio);
        if (data.avatarBase64) {
          setImageUrl(`data:image/jpeg;base64,${atob(data.avatarBase64)}`);
        }
      })
      .catch(error => console.error('Error fetching user information:', error));
    }
  }, []);


console.log(avatarBase64)

  const handleUsernameChange = (event) => {
    setNewUsername(event.target.value);
  };

  const handleGenderChange = (event) => {
    setGender(event.target.value);
  };

  const handleBioChange = (event) => {
    setBio(event.target.value);
  };

  const handleUpdateUserInfo = () => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('newUsername', newUsername);
    formData.append('gender', gender);
    formData.append('bio', bio);
    if (selectedImage) {
      formData.append('avatar', selectedImage);
    }

    fetch('https://yt-clone-pt2b.onrender.com/update-user-info', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          alert(data.message);
          setUsername(newUsername);
          if (data.avatarUrl) {
            setImageUrl(data.avatarUrl);
          }
        } else {
          alert('Error updating user information');
        }
      })
      .catch(error => console.error('Error updating user information:', error));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    loadImage(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    loadImage(file);
  };

  const deleteImage = () => {
    setSelectedImage(null);
  };

  const loadImage = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      const img = new Image();
      img.src = reader.result;
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const targetWidth = 120;
        const targetHeight = 120;
        let newWidth = img.width;
        let newHeight = img.height;

        const aspectRatio = img.width / img.height;

        if (img.height > targetHeight) {
          newHeight = targetHeight;
          newWidth = newHeight * aspectRatio;
        }

        const offsetX = (newWidth - targetWidth) / 2;

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.drawImage(img, -offsetX, 0, newWidth, newHeight);

        canvas.toBlob((blob) => {
          const croppedFile = new File([blob], file.name, { type: file.type });
          setSelectedImage(croppedFile);
        }, file.type);
      };
    };
  };

  const handlePasswordChange = async () => {
    const userId = localStorage.getItem('userId'); // or wherever you store your user ID

  
    const response = await fetch('https://yt-clone-pt2b.onrender.com/update-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // if you're using a token
      },
      body: JSON.stringify({
        userId,
        currentPassword,
        newPassword,
        confirmPassword
      })
    });
  
    const data = await response.json();
    if (response.ok) {
      alert(data.message);
    } else {
      console.error(data.error || data.message);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className='inside'>
            <div>
              <div className='TextGeneral'>Аватар</div>
              <div className="UploadArea2" onDrop={handleDrop} onDragOver={handleDragOver}>
                <input type="file" accept="image/*" onChange={handleFileInputChange} style={{ display: 'none' }} id="fileInput" />
                <label htmlFor="fileInput">Drag and drop image or click here to upload</label>
              </div>
              {selectedImage ? (
                <div className="ImageContainer">
                  <img className='BookImg' src={URL.createObjectURL(selectedImage)} alt="Selected" />
                  <button className="DeleteButton" onClick={deleteImage}>Delete</button>
                </div>
              ) : imageUrl ? (
                <div className="ImageContainer">
                  <img className='BookImg' src={imageUrl} alt="Avatar" />
                </div>
              ) : null}
            </div>
  
            <div className='case'>
              <div className='TextGeneral'>Ім'я</div>
              <input className='form-input__field_max' value={newUsername} onChange={handleUsernameChange} />
            </div>
  
            <div className='case'>
              <div className='TextGeneral'>Стать</div>
              <select className='form-select_max' value={gender} onChange={handleGenderChange}>
                <option value="Не вказано">Не вказано</option>
                <option value="Чоловіча">Чоловіча</option>
                <option value="Жіноча">Жіноча</option>
              </select>
            </div>
  
            <div className='case'>
              <div className='TextGeneral'>Про себе</div>
              <textarea className='textarea' value={bio} onChange={handleBioChange}></textarea>
            </div>
            <button className='btn' onClick={handleUpdateUserInfo}>Зберегти</button>
          </div>
        );
      case 'security':
        return (
          <div>
            <div className='t1'>Зміна паролю</div>
            <div className='case'>
              <div className='TextGeneral'>Поточний пароль</div>
              <input 
                className='form-input__field_max' 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
              />
            </div>
            <div className='case'>
              <div className='TextGeneral'>Новий пароль</div>
              <input 
                className='form-input__field_max' 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
              />
            </div>
            <div className='case'>
              <div className='TextGeneral'>Підтвердити новий пароль</div>
              <input 
                className='form-input__field_max' 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
            </div>
            <button className='btn' onClick={handlePasswordChange}>Зберегти</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='App'>
      <main className='Container'>
        <div className='PageList'>
          <div className={activeTab === 'info' ? 'SettingsActive pointer' : 'TextBig pointer'} onClick={() => setActiveTab('info')}>Інформація</div>
          <div className={activeTab === 'security' ? 'SettingsActive pointer' : 'TextBig pointer'} onClick={() => setActiveTab('security')}>Безпека та вхід</div>
        </div>

        <div className='Settings'>
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default Settings;
