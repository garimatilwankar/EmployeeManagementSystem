import Sidebar from './Sidebar';
import Navbar from './Navbar';
import '../styles/layout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;