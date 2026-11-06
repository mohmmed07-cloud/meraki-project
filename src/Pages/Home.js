import React from 'react';
import { Link } from 'react-router-dom';

import './Home.css';

const Home = () => {
    return (
        <main className="hero">
            {/* قسم نصوص الرؤية داخل الورقة الممزقة */}
            <div className="text-content">
                <h2>OUR VISION</h2>
                <p>
                    Welcome to the JU Debate Club! Join us to enhance your public speaking and critical thinking skills.
                </p>
                <p>
                    We organize weekly debates, workshops and competitions. Whether you're a beginner or an experienced debater, there's a place for you here!
                </p>
                
                <Link to="/applications" className="join-button">
                    Join Us
                </Link>
            </div>
            
            {/* قسم الفيديو المائل */}
            <div className="image-wrapper">
                <div className="image-bg">
                    <video 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="hero-video"
                    >
                        <source src="/WEBVideo.mp4" type="video/mp4" />
                        متصفحك لا يدعم تشغيل الفيديو.
                    </video>
                </div>
            </div>
        </main>
    );
};

export default Home;