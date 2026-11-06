import React, { useState, useRef } from 'react';
import './Contact.css'; 
import { FaInstagram, FaFacebookF, } from "react-icons/fa";
// 1. استيراد دوال الفايربيز
import { db } from './firebase'; 
import { collection, addDoc } from 'firebase/firestore';
import contactImg from './Contact2.png';
// 2. استيراد مكون الريكابتشا
import ReCAPTCHA from "react-google-recaptcha";


const Contact = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        message: '',
        phone: ''  // إضافة حقل الهاتف  
    });
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // حالة لتتبع ما إذا كان المستخدم قد اجتاز اختبار الكابتشا
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const recaptchaRef = useRef();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // دالة تتنفذ عندما ينجح المستخدم في حل الكابتشا
    const onCaptchaChange = (value) => {
        if (value) {
            setCaptchaVerified(true);
        } else {
            setCaptchaVerified(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // التحقق الإضافي (احتياطي) في حال تجاوز المستخدم زر الإرسال بطريقة ما
        if (!captchaVerified) {
            setStatusMessage({ type: 'error', text: 'الرجاء التحقق من أنك لست روبوتاً 🤖' });
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
            return;
        }

        setIsSubmitting(true);
        setStatusMessage({ type: '', text: '' }); // مسح أي رسائل سابقة

        try {
            // إضافة البيانات فعلياً إلى Firestore في مجموعة (Collection) اسمها "contacts"
            await addDoc(collection(db, "contacts"), {
                fullName: formData.fullName,
                email: formData.email,
                message: formData.message,
                phone: formData.phone,  // إضافة رقم الهاتف 
                createdAt: new Date() // لتسجيل وقت وصول الرسالة
            });

            setStatusMessage({ type: 'success', text: 'Message sent successfully ✅ We will contact you soon!' });
            
            // تصفير الحقول بعد الإرسال الناجح
            setFormData({ fullName: '', email: '', message: '', phone: '' });
            
            // إعادة ضبط الكابتشا لطلب جديد إن أراد
            setCaptchaVerified(false);
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }

        } catch (error) {
            console.error("Error submitting contact form: ", error);
            setStatusMessage({ type: 'error', text: 'Error Adding Message ❌' });
        } finally {
            setIsSubmitting(false);
            // إخفاء الرسالة بعد 4 ثواني
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
        }
    };

    return (
        <div className="contact-page-wrapper">
            {statusMessage.text && (
                <div className={`form-status ${statusMessage.type}`}>
                    {statusMessage.text}
                </div>
            )}
            <div className="contact-container">
                <div className="contact-left">
                    <img 
                        src={contactImg} 
                        alt="Models" 
                        className="contact-image" 
                    />
                </div>

                <div className="contact-right">
                    <h1 className="contact-heading">Contact Us</h1>

                    <div className="contact-content-split">
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="fullName">Full Name</label>
                                <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <label htmlFor="email">E-mail</label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <label htmlFor="phone">Phone</label>
                                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <label htmlFor="message">Message</label>
                                <input type="text" id="message" name="message" value={formData.message} onChange={handleChange} required />
                            </div>

                            
                            {/* مربع التحقق reCAPTCHA */}
                            <div className="recaptcha-wrapper">
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey="6LemINYtAAAAAAxsz30AQ3jDbTsCn3BYSMKfFWu4" // مفتاح اختبار معتمد من جوجل
                                    onChange={onCaptchaChange}
                                />
                            </div>

                            {/* الزر غير مفعل (disabled) إذا لم يحل المستخدم الكابتشا أو أثناء التحميل */}
                            <button 
                                type="submit" 
                                className="contact-submit-btn"
                                disabled={!captchaVerified || isSubmitting}
                                style={{ opacity: (!captchaVerified || isSubmitting) ? 0.5 : 1, cursor: (!captchaVerified || isSubmitting) ? 'not-allowed' : 'pointer' }}
                            >
                                {isSubmitting ? 'Sending...' : 'Contact Us'}
                            </button>
                        </form>

                        <div className="contact-info">
                            <div className="info-block">
                                <h3>Contact</h3>
                                <p>JUDebateClub@Gmail.Com</p>
                            </div>
                            <div className="info-block">
                                <h3>Based in</h3>
                                <p>Jordan University,<br/>Amman</p>
                            </div>
                           <div className="social-icons">
  <a 
    href="https://www.instagram.com/debateclubju/" 
    target="_blank" 
    rel="noopener noreferrer"
    aria-label="Instagram"
  >
    <FaInstagram />
  </a>

  <a 
    href="https://www.facebook.com/reel/1922484598395708" 
    target="_blank" 
    rel="noopener noreferrer"
    aria-label="Facebook"
  >
    <FaFacebookF />
  </a>

  
</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;