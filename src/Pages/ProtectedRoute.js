import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute = ({ children }) => {
    // حالة لتخزين بيانات المستخدم
    const [user, setUser] = useState(null);
    // حالة لتتبع ما إذا كان الفايربيز لا يزال يتحقق من الجلسة
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // onAuthStateChanged يراقب حالة الدخول ويتأكد منها من سيرفرات فايربيز
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false); // إيقاف شاشة التحميل بمجرد معرفة النتيجة (مسجل أو غير مسجل)
        });

        // تنظيف المراقب عند إغلاق المكون
        return () => unsubscribe();
    }, []);

    // 1. عرض شاشة تحميل بسيطة أثناء انتظار رد الفايربيز (يمنع الوميض والطرد الخاطئ)
    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2rem', color: '#1B365D' }}>
                جاري التحقق من الصلاحيات...
            </div>
        );
    }

    // 2. إذا انتهى التحميل ولم يتم العثور على مستخدم، يتم طرده لصفحة تسجيل الدخول
    if (!user) {
        return <Navigate to="/login" />;
    }

    // 3. إذا كان المستخدم مسجلاً، يتم عرض الصفحة المطلوبة (مثل صفحة الأدمن)
    return children;
};

export default ProtectedRoute;