import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from './firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Admin.css';

const Admin = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "applications"));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setApplications(data);
        } catch (err) {
            console.error("Error fetching data: ", err);
            setError('تعذر تحميل البيانات، تحقق من اتصالك بالإنترنت وحاول مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    // دالة الرفض: حذف الطلب مباشرة من الفايربيز والجدول
    const handleDecline = async (id, name) => {
        if (window.confirm(`هل أنت متأكد من رفض وحذف طلب ${name}؟`)) {
            try {
                await deleteDoc(doc(db, "applications", id));
                setApplications((prev) => prev.filter((item) => item.id !== id));
            } catch (error) {
                console.error("Error deleting document: ", error);
                alert("حدث خطأ أثناء حذف الطلب.");
            }
        }
    };

    // دالة القبول: فتح واتساب بالرسالة ثم حذف الطلب من قائمة الانتظار
    const handleAccept = async (applicant) => {
        if (!applicant.phone) {
            alert('لا يوجد رقم هاتف مسجل لهذا المتقدم، لا يمكن إرسال رسالة واتساب.');
            return;
        }

        let cleanPhone = applicant.phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '962' + cleanPhone.substring(1);
        } else if (!cleanPhone.startsWith('962') && cleanPhone.length === 9) {
            cleanPhone = '962' + cleanPhone;
        }

        const message = encodeURIComponent(
            `Hello ${applicant.name},\nWe are thrilled to inform you that your application to join the JU Debate Club has been accepted! 🎙️✨\nWelcome aboard!`
        );

        window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');

        try {
            await deleteDoc(doc(db, "applications", applicant.id));
            setApplications((prev) => prev.filter((item) => item.id !== applicant.id));
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="admin-container">
            <div className="admin-header-flex">
                <h2>Club Admin Panel - Membership Requests</h2>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
            
            {loading ? (
                <p>Loading data...</p>
            ) : error ? (
                <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
            ) : (
                <div className="table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Age</th>
                                <th>Major</th>
                                <th>Year</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>English Level</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app) => (
                                <tr key={app.id}>
                                    <td>{app.name}</td>
                                    <td>{app.age}</td>
                                    <td>{app.major}</td>
                                    <td>{app.yearOfStudy}</td>
                                    <td>{app.email}</td>
                                    <td>{app.phone}</td>
                                    <td>{app.englishLevel}</td>
                                    <td>
                                        <div className="action-buttons-wrapper">
                                            <button 
                                                className="action-btn accept-btn" 
                                                onClick={() => handleAccept(app)}
                                                title="قبول وإرسال رسالة"
                                            >
                                                &#10003;
                                            </button>
                                            <button 
                                                className="action-btn decline-btn" 
                                                onClick={() => handleDecline(app.id, app.name)}
                                                title="رفض وحذف الطلب"
                                            >
                                                &#10005;
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Admin;