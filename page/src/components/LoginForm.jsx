import React, { useState } from 'react';
import '../css/login.css';
import Axios from "axios";
import {useNavigate } from "react-router-dom";

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = (e) => {
    e.preventDefault();
    Axios.post("https://yt-clone-pt2b.onrender.com/login", {
      email: email,
      password: password,
    })
      .then((response) => {
        if (response.status === 200) {
          const data = response.data;
          if (data.token) {
            // Store the token in local storage
            localStorage.setItem('token', data.token);
  
            if (data.email_verified_at === null) {
              // Email is not verified, navigate to EmailVerification
              navigate('/EmailVerification', { state: { email: email } });
            } else {
              // Email is already verified, you can navigate to another page
              navigate('/MainPage'); // Replace 'MainPage' with the desired page
            }
          } else {
            alert("Token not received");
          }
        } else {
          alert("Bad data");
        }
      })
      .catch((error) => {
        console.error("Axios Error:", error);
        alert(error);
      });
  };

  const SignUpForm = () => {
    // Programmatically navigate to a specific route
    navigate('/SignUpForm');
  };
//<</form>button type="button" onClick={SignUpForm}>Sign Up</button>
  return (
    
    <div className="form-container">
      <form className="form">
        <h2>Вхід</h2>
        <div className='group'>
          <label>Електронна пошта</label>
          <input
            type="text"
            name="email"
            className="underline-input" // Apply custom input class
            onChange={(e) => {setEmail(e.target.value)}}
          />
        </div>
        
        <div className='group'>
          <label>Пароль</label>
          <input
            type="password"
            name="password"
            className="underline-input2" // Apply custom input class
            onChange={(e) => {setPassword(e.target.value)}}
          />
        </div>
        <div>
        <div className="buttonkab" onClick={login}>
        <div className="text321">
        <p>Увійти</p>
        </div>
        </div>


              <div className="register-link">
              <h5>Не маєте аккаунту?</h5>
              <div onClick={SignUpForm}>Зареєстуватись</div>
              </div>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
