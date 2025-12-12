import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from '../layout/Layout';
import Home from '../tabs/Home';
import Questions from '../tabs/Questions';
import SmartPopup from '../popup/SmartPopup';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout><Outlet /></Layout>}>
        <Route index element={<Home />} />
        <Route path="questions" element={<Questions />} />
        <Route path="smart-popup" element={<SmartPopup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
