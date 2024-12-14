import React, { useState } from 'react';
import '../css/EmailVerification.css'; // Create a CSS file for styling
import Axios from "axios";
import { useLocation } from 'react-router-dom';
import {useNavigate } from "react-router-dom";

function EmailVerification() {
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const location = useLocation(); // Get the location object from React Router
  const email = location.state ? location.state.email : ''; // Get the email from location.state
  const navigate = useNavigate();

  const handleVerification = () => {
    // Send a request to your backend to verify the code
    Axios.post("https://yt-clone-pt2b.onrender.com/verify-code", {
      email: email,
      verificationCode: verificationCode,
    })
      .then((response) => {
        if (response.status === 200) {
          setVerificationStatus("Verification successful");
          navigate('/MainPage');
        } else {
          setVerificationStatus("Verification failed");
        }
      })
      .catch((error) => {
        console.error("Axios Error:", error);
        setVerificationStatus("Verification failed");
      });
  };

  return (
    <div className="main">
    <div className="centered-input-box">
      <input
        type="text"
        placeholder="Enter verification code..."
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
      />
      <div className="button_el">
      <div className="buttonkab" onClick={handleVerification}>
        <div className="EmailLoginButton">
        <p>Увійти</p>
        </div>
        </div>




      </div>
      <div className="verification-status">{verificationStatus}</div>
    </div>
    </div>
  );
}

export default EmailVerification;
