import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css'; // Custom styles
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}${role}s/login`, 
        { email, password },
        { withCredentials: true }
      );

      if (!res || !res.data) {
        throw new Error("Invalid response from server");
      }

      if (role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      alert("Login failed. Please check your credentials.");
      console.error("Login Error:", err);
    }
  };

  const handleGoogleLogin = async (response) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}auth/google`, 
        { credential: response.credential },
        { withCredentials: true }
      );

      if (res.status === 200) {
        if (res.data.data.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error('Google Login Error:', error);
      alert("Google login failed. Please try again.");
    }
  };

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="login-container d-flex justify-content-center align-items-center vh-100">
        <div className="col-md-5">
          <div className="card shadow-lg border-0 p-4">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Library Portal Login</h2>
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Role</label>
                  <select
                    className="form-select"
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100">Login</button>
              </form>
              <div className="text-center mt-3">
                <Link to="/email" className="text-decoration-none">Forgot Password?</Link>
              </div>
              <div className="text-center mt-4">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={(error) => {
                    console.error("Google Login Error:", error);
                    alert("Google login failed. Please try again.");
                  }}
                  useOneTap
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;