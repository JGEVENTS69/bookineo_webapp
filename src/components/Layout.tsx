import React from 'react';
import Navigation from './Navigation'; // Importez la navigation depuis son fichier

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-16">{children}</main>
    </div>
  );
};

export default Layout;
