import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';
import clubLogo from './JUDebateLOGO.jpeg';

const Navbar = () => {
    const { user } = useAuth();
    const [sliderStyle, setSliderStyle] = useState({ opacity: 0, left: 0, width: 0 });
    const [menuOpen, setMenuOpen] = useState(false);

    // إغلاق القائمة تلقائياً عند الضغط على أي رابط للتنقل
    const closeMobileMenu = () => setMenuOpen(false);

    const handleMouseEnter = (e) => {
        if (window.innerWidth <= 900) return;

        setSliderStyle({
            opacity: 1,
            left: e.currentTarget.offsetLeft,
            width: e.currentTarget.offsetWidth
        });
    };

    const handleMouseLeave = () => {
        if (window.innerWidth <= 900) return;
        setSliderStyle((prev) => ({ ...prev, opacity: 0 }));
    };

    return (
        <nav className="navbar">
            <div className="logo">
                <img src={clubLogo} alt="Club Logo" className="logo-icon" />
                <h3>JU DEBATE CLUB</h3>
            </div>

            {/* زر الهامبرغر يظهر فقط في الشاشات الصغيرة */}
            <div className="menu-toggle-btn" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <FaTimes /> : <FaBars />}
            </div>
            
            <ul className={`nav-list ${menuOpen ? 'active' : ''}`} onMouseLeave={handleMouseLeave}>
                <li onMouseEnter={handleMouseEnter} onClick={closeMobileMenu}>
                    <Link to="/">Home</Link>
                </li>
               
                <li onMouseEnter={handleMouseEnter} onClick={closeMobileMenu}>
                    <Link to="/motions">Motions</Link>
                </li>
                <li onMouseEnter={handleMouseEnter} onClick={closeMobileMenu}>
                    <Link to="/contact">Contact</Link>
                </li>
                
                {user ? (
                    <>
                        <li onMouseEnter={handleMouseEnter} onClick={closeMobileMenu}>
                            <Link to="/admin">Applications (Admin)</Link>
                        </li>
                        <li onMouseEnter={handleMouseEnter} onClick={closeMobileMenu}>
                            <Link to="/inbox">Inbox</Link>
                        </li>
                    </>
                ) : (
                    <li onMouseEnter={handleMouseEnter} onClick={closeMobileMenu}>
                        <Link to="/login">Login</Link>
                    </li>
                )}
                
                <div className="animation-slider" style={sliderStyle}></div>
            </ul>
        </nav>
    );
};

export default Navbar;