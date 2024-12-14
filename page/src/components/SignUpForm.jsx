import React, { useState } from 'react';
import '../css/register.css';
import Axios from "axios";
import {useNavigate } from "react-router-dom";


function SignUpForm(props) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");
  const [RegistrationSatus, setRegistrationStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Perform form validation
    if (password !== ConfirmPassword) {
      console.log('Passwords do not match.');
      return;
    }
  };

  const register = (e) => {
    e.preventDefault();
    Axios.post("https://yt-clone-backend-05d9.onrender.com/register", {
      name: name,
      email: email,
      password: password,
    }).then((response) => {
      // setRegisterStatus(response);
      if(response.data.message){
        setRegistrationStatus(response.data.message);
      }else{
        setRegistrationStatus("ACCOUNT CREATED SUCCESSFULLY");
      }
    })
  }

  const LoginForm = () => {
    // Programmatically navigate to a specific route
    navigate('/LoginForm');
  };

  return (
    
    <div className="form-container">
    <form className="form" onSubmit={handleSubmit}>
      <h2>Реєстрація</h2>
      <div className='group'>
        <label>Ім'я</label>
        <input
          type="text"
          name="name"
          className="underline-input"
          onChange={(e) => {setName(e.target.value)}}
          required
        />
      </div>

      <div className='group'>
        <label>Електронна пошта</label>
        <input
          type="email"
          name="email"
          className="underline-input"
          onChange={(e) => {setEmail(e.target.value)}}
          required
        />
      </div>
      <div className='group'>
        <label>Пароль</label>
        <input
          type="password"
          name="password"
          className="underline-input"
          onChange={(e) => {setPassword(e.target.value)}}
          required
        />
      </div>
      <div className='group'>
        <label className='label'>Підтвердження пароля</label>
        <input
          type="password"
          name="confirmPassword"
          className="underline-input2"
          onChange={(e) => {setConfirmPassword(e.target.value)}}
          required
        />
      </div>
      <div>
      <div className="buttonkab" onClick={register}>
        <div className="text321">
        <p>Зареєстуватись</p>
        </div>
        </div>



              <div className="log-link">
              <h5>Уже маєте аккаунт?</h5>
              <div onClick={LoginForm}>Login</div>
              </div>
        
      </div>
    </form>
    </div>
  );
}

export default SignUpForm;
