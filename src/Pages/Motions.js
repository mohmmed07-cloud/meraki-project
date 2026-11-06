import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { db, auth } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './Motions.css';

const MotionCard = ({ title, description, images }) => {
  const imageList = (images && images.length > 0 && images.some(img => img)) 
    ? images 
    : ["https://via.placeholder.com/400x200?text=No+Image"];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === imageList.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? imageList.length - 1 : prevIndex - 1
    );
  };

  // دوال التقاط السحب بالأصبع (Swipe Gestures)
  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX) return;
    const touchEndX = e.changedTouches[0].clientX;
    const distance = touchStartX - touchEndX;

    // مسافة 40 بكسل لتأكيد حركة السحب
    if (distance > 40) {
      nextSlide(); // سحب لليسار -> الصورة التالية
    } else if (distance < -40) {
      prevSlide(); // سحب لليمين -> الصورة السابقة
    }
    setTouchStartX(0);
  };

  const prevIndex = currentIndex === 0 ? imageList.length - 1 : currentIndex - 1;
  const nextIndex = currentIndex === imageList.length - 1 ? 0 : currentIndex + 1;

  return (
    <div className="content-container">
      <div className="text-section">
        <h2 className="section-title">{title}</h2>
        <p className="section-desc">{description}</p>
      </div>

      <div className="slider-section">
        <div className="carousel">
          <button className="arrow-btn" onClick={prevSlide}>&#11013;</button>
          
          <div 
            className="images-wrapper"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'pan-y' }}
          >
            {imageList.length > 1 ? (
              <>
                <img src={imageList[prevIndex]} alt="Previous" className="side-img" onError={(e)=>{e.target.src="https://via.placeholder.com/200?text=Error"}} />
                <img src={imageList[currentIndex]} alt="Current" className="center-img" onError={(e)=>{e.target.src="https://via.placeholder.com/400?text=Error"}} />
                <img src={imageList[nextIndex]} alt="Next" className="side-img" onError={(e)=>{e.target.src="https://via.placeholder.com/200?text=Error"}} />
              </>
            ) : (
              <img src={imageList[0]} alt="Current" className="center-img" style={{ margin: '0 auto' }} onError={(e)=>{e.target.src="https://via.placeholder.com/400?text=Error"}} />
            )}
          </div>

          <button className="arrow-btn" onClick={nextSlide}>&#10145;</button>
        </div>
      </div>
    </div>
  );
};

const Motions = () => {
  const { user } = useAuth();
  const [dbMotions, setDbMotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMotionsFromDB = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "motions"));
        const motions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        motions.sort((a, b) => {
           if (b.createdAt && a.createdAt) {
               return b.createdAt.toMillis() - a.createdAt.toMillis();
           }
           return 0;
        });

        setDbMotions(motions);
      } catch (error) {
        console.error("Error fetching motions: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMotionsFromDB();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="motions-page">
      <div className="motions-header">
        <h1 className="main-title">MOTIONS</h1>
        {user && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="add-motion-btn" onClick={() => navigate('/add-motion')}>
              + Add Motion (Admin)
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', fontWeight: 'bold' }}>
          Loading Motions...
        </div>
      ) : dbMotions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', fontWeight: 'bold' }}>
          No motions available at the moment.
        </div>
      ) : (
        dbMotions.map((motion) => (
          <MotionCard 
            key={motion.id} 
            title={motion.title} 
            description={motion.description} 
            images={motion.images} 
          />
        ))
      )}
    </div>
  );
};

export default Motions;