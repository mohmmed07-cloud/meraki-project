import React, { useState, useRef } from 'react';
import './Applications.css';
import { collection, addDoc } from "firebase/firestore";
import { db } from './firebase';
// استيراد مكون الريكابتشا
import ReCAPTCHA from "react-google-recaptcha";

const Applications = () => {
    // 1. تعريف الحالة لتخزين قيم الحقول
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        major: '',
        email: '',
        phone: '',
        yearOfStudy: '',
        englishLevel: '',
        schoolSystem: '',
        schoolSystemOtherText: '',
        experience: [],
        experienceOtherText: ''
    });
    
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    
    // حالة لتتبع الكابتشا وحالة التحميل أثناء الإرسال
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const recaptchaRef = useRef();

    // 2. دالة تحديث النصوص وخيارات الراديو
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. دالة معالجة مربعات الاختيار (Checkboxes)
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setFormData(prev => ({ ...prev, experience: [...prev.experience, value] }));
        } else {
            setFormData(prev => ({ ...prev, experience: prev.experience.filter(item => item !== value) }));
        }
    };

    // دالة تتنفذ عندما ينجح المستخدم في حل الكابتشا
    const onCaptchaChange = (value) => {
        if (value) {
            setCaptchaVerified(true);
        } else {
            setCaptchaVerified(false);
        }
    };

    // 4. دالة الإرسال إلى Firestore
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // تحقق أمني إضافي
        if (!captchaVerified) {
            setStatusMessage({ type: 'error', text: 'الرجاء التحقق من أنك لست روبوتاً 🤖' });
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
            return;
        }

        setIsSubmitting(true);
        setStatusMessage({ type: '', text: '' });

        try {
            await addDoc(collection(db, "applications"), {
                ...formData,
                createdAt: new Date() // إضافة تاريخ التقديم
            });

            setStatusMessage({ type: 'success', text: 'تم إرسال طلبك بنجاح ✅' });
            
            // تصفير النموذج
            setFormData({
                name: '', age: '', major: '', email: '', phone: '',
                yearOfStudy: '', englishLevel: '', schoolSystem: '',
                schoolSystemOtherText: '', experience: [], experienceOtherText: ''
            });

            // إعادة ضبط الكابتشا
            setCaptchaVerified(false);
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }

        } catch (error) {
            console.error("Error adding document: ", error);
            setStatusMessage({ type: 'error', text: 'حدث خطأ أثناء الإرسال، حاول مرة ثانية.' });
        } finally {
            setIsSubmitting(false);
            // الرسالة بتختفي لحالها بعد 4 ثواني
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
        }
    };

    return (
        <main className="applications-container">
            <h2>Applications</h2>
            {statusMessage.text && (
                <div className={`form-status ${statusMessage.type}`}>
                    {statusMessage.text}
                </div>
            )}
            
            <form className="application-form" onSubmit={handleSubmit}>

                <label htmlFor="name">Name:</label>
                <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    required 
                    placeholder="Your Name" 
                    value={formData.name} 
                    onChange={handleChange} 
                />    

                <label htmlFor="age">Age:</label>
                <input 
                    type="number" 
                    id="age" 
                    name="age" 
                    required 
                    placeholder="Your Age" 
                    value={formData.age} 
                    onChange={handleChange} 
                />

                <label htmlFor="major">Major:</label>
                <input 
                    type="text" 
                    id="major" 
                    name="major" 
                    required 
                    placeholder="Your Major" 
                    value={formData.major} 
                    onChange={handleChange} 
                />

                <label htmlFor="email">Email:</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required 
                    placeholder="Your Email@gmail.com" 
                    value={formData.email} 
                    onChange={handleChange} 
                />

                {/* سنة الدراسة */}
                <div className="form-group">
                    <p>Year of study:</p>
                    {['1st year', '2nd year', '3rd year', '4th year', 'Other'].map((year) => (
                        <div key={year} className="radio-option">
                            <input 
                                type="radio" 
                                id={`year-${year}`} 
                                name="yearOfStudy" 
                                value={year} 
                                onChange={handleChange} 
                                checked={formData.yearOfStudy === year} 
                            />
                            <label htmlFor={`year-${year}`}>{year}</label>
                        </div>
                    ))}
                </div>

                <label htmlFor="phone">Phone Number:</label>
                <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    required 
                    placeholder="Your Phone Number" 
                    value={formData.phone} 
                    onChange={handleChange} 
                />

                {/* مستوى اللغة الإنجليزية */}
                <div className="form-group">
                    <p>What english level have you been assigned originally in the level exam?</p>
                    {['A1.1', 'A1.2', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2.1', 'B2.2', 'C1.1', 'C1.2'].map((level) => (
                        <div key={level} className="radio-option">
                            <input 
                                type="radio" 
                                id={`level-${level}`} 
                                name="englishLevel" 
                                value={level} 
                                onChange={handleChange} 
                                checked={formData.englishLevel === level} 
                            />
                            <label htmlFor={`level-${level}`}>{level}</label>
                        </div>
                    ))}
                </div> 

                {/* النظام المدرسي */}
                <div className="form-group">
                    <p>What school system is your school degree based on?</p>
                    {['Jordanian Tawjihi', 'American program', 'IB', 'IGCSE', 'Arabic Degrees'].map((system) => (
                        <div key={system} className="radio-option">
                            <input 
                                type="radio" 
                                id={`system-${system}`} 
                                name="schoolSystem" 
                                value={system} 
                                onChange={handleChange} 
                                checked={formData.schoolSystem === system} 
                            />
                            <label htmlFor={`system-${system}`}>{system}</label>
                        </div>
                    ))}
                    
                    {/* خيار Other للنظام المدرسي */}
                    <div className="radio-option" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', marginTop: '5px' }}>
                        <input 
                            type="radio" 
                            id="system-other" 
                            name="schoolSystem" 
                            value="Other" 
                            onChange={handleChange} 
                            checked={formData.schoolSystem === 'Other'} 
                            style={{ margin: 0 }}
                        />
                        <label htmlFor="system-other" style={{ width: 'auto', margin: 0, whiteSpace: 'nowrap', cursor: 'pointer' }}>Other:</label>
                        <input 
                            type="text" 
                            name="schoolSystemOtherText" 
                            placeholder="Please specify..."
                            value={formData.schoolSystemOtherText} 
                            onChange={handleChange} 
                            onFocus={() => setFormData(prev => ({ ...prev, schoolSystem: 'Other' }))}
                            style={{ 
                                flex: 1, 
                                minWidth: '150px', 
                                border: '1px solid #ccc', 
                                borderRadius: '4px',
                                padding: '6px 10px', 
                                fontSize: '14px',
                                outline: 'none',
                                background: '#fff'
                            }} 
                        />
                    </div>
                </div>

                {/* الخبرات السابقة */}
                <div className="form-group">
                    <p>Do you have any experience with debate, MUN, public speaking, presentations?</p>
                    {['Yes, Formal Debate', 'Yes, Public speaking', 'Yes, Presentations', 'Yes, MUN', 'No prior experience'].map((exp) => (
                        <div key={exp} className="checkbox-option">
                            <input 
                                type="checkbox" 
                                id={`exp-${exp}`} 
                                name="experience" 
                                value={exp} 
                                onChange={handleCheckboxChange} 
                                checked={formData.experience.includes(exp)} 
                            />
                            <label htmlFor={`exp-${exp}`}>{exp}</label>
                        </div>
                    ))}

                    {/* خيار Other للخبرات السابقة */}
                    <div className="checkbox-option" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', marginTop: '5px' }}>
                        <input 
                            type="checkbox" 
                            id="exp-other" 
                            name="experience" 
                            value="Other" 
                            onChange={handleCheckboxChange} 
                            checked={formData.experience.includes('Other')} 
                            style={{ margin: 0 }}
                        />
                        <label htmlFor="exp-other" style={{ width: 'auto', margin: 0, whiteSpace: 'nowrap', cursor: 'pointer' }}>Other:</label>
                        <input 
                            type="text" 
                            name="experienceOtherText" 
                            placeholder="Please specify..."
                            value={formData.experienceOtherText} 
                            onChange={handleChange} 
                            onFocus={() => {
                                if (!formData.experience.includes('Other')) {
                                    setFormData(prev => ({ ...prev, experience: [...prev.experience, 'Other'] }));
                                }
                            }}
                            style={{ 
                                flex: 1, 
                                minWidth: '150px', 
                                border: '1px solid #ccc', 
                                borderRadius: '4px',
                                padding: '6px 10px', 
                                fontSize: '14px',
                                outline: 'none',
                                background: '#fff'
                            }} 
                        />
                    </div>
                </div>
                
                {/* مربع التحقق reCAPTCHA */}
                <div className="recaptcha-wrapper">
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey="6LemINYtAAAAAAxsz30AQ3jDbTsCn3BYSMKfFWu4"
                        onChange={onCaptchaChange}
                    />
                </div>

                {/* زر الإرسال معطل حتى يتم حل الكابتشا */}
                <button 
                    type="submit"
                    disabled={!captchaVerified || isSubmitting}
                    style={{ 
                        opacity: (!captchaVerified || isSubmitting) ? 0.5 : 1, 
                        cursor: (!captchaVerified || isSubmitting) ? 'not-allowed' : 'pointer',
                        marginTop: '15px'
                    }}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </main>
    );
};

export default Applications;