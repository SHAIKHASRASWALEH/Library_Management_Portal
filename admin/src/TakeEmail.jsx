import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css'; // Optional: Add your custom styles here
import axios from 'axios';

const EmailForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}admins/reset-password-request`, {email});
        setMessage('Email sent successfully');
    }
    catch{
        console.log("Error");
    }
    // Here you can add any logic to actually send the email.
    
  };

  return (
    <div className="email-form-container d-flex justify-content-center align-items-center vh-100">
      <div className="col-md-5">
        <div className="card shadow-lg border-0 p-4">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Enter Your Email</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Submit</button>
            </form>
            {message && (
              <div className="alert alert-success mt-3" role="alert">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailForm;