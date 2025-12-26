import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css'; // Custom styles
import axios from 'axios';
const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
    } else {
      try{
        const url = new URL(window.location.href);
        const token = url.searchParams.get('token');
        const res = await axios.patch(`${import.meta.env.VITE_API_BASE_URL}admins/reset-password`,{password: newPassword,token: token});
        alert("Password reset successful");
      }
      catch(err){
        console.error("Password Reset Error:", err);
        alert("Password reset failed. Please try again.");
        return;
      }
      navigate("/"); // Redirect to login page
    }
  };

  return (
    <div className="reset-password-container d-flex justify-content-center align-items-center vh-100">
      <div className="col-md-5">
        <div className="card shadow-lg border-0 p-4">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Reset Password</h2>
            <form onSubmit={handleReset}>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Reset Password</button>
            </form>
            <div className="text-center mt-3">
              <button className="btn btn-link" onClick={() => navigate("/")}>Back to Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
