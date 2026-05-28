import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Layout = () => (
  <div className="flex min-h-screen bg-dark-50 dark:bg-dark-950">
    <Sidebar />
    <main className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-8 pt-16 lg:pt-8">
      <Outlet />
    </main>
  </div>
);

export default Layout;