import './App.css';

import { Routes, Route } from 'react-router-dom';
import React from 'react';
import SignUpForm from './components/SignUpForm';
import LoginForm from './components/LoginForm';
import EmailVerification from './components/EmailVerification';
import Profile from './components/Profile';
import PassChange from './components/PassChange';
import Settings from './components/Settings'; 
import VideoUpload from './components/VideoUpload'; 
import MainPage from './components/MainPage'; 


function App() {


  return (
    <div className="App">
      <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/SignUpForm" element={<SignUpForm />} />
      <Route path="/LoginForm" element={<LoginForm />} />
      <Route path="/EmailVerification" element={<EmailVerification />} />
      <Route path="/Profile" element={<Profile />} />
      <Route path="/PassChange" element={<PassChange />} />
      <Route path="/Settings" element={<Settings />} />
      <Route path="/VideoUpload" element={<VideoUpload />} />
      <Route path="/MainPage" element={<MainPage />} />



      </Routes>
  </div>
  );
}

export default App;
