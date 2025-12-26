import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Admin from './Admin';
import ResetPassword from './ResetPassword';
import TakeEmail from './TakeEmail';
import AdminManageArticles from './Article';
import ArticleManagement from './ArticleManagement';
import AdminSeatBooking from './AdminSeatBooking';
import AdminSearchStudents from './Student';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/email" element={<TakeEmail />} />
        <Route path="/article-requests" element={<AdminManageArticles />} />
        <Route path="/articles" element={<ArticleManagement />} />
        <Route path="/seat-booking" element={<AdminSeatBooking />} />
        <Route path="/student-details" element={<AdminSearchStudents />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;
