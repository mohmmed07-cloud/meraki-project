import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { FaCopy, FaCheck } from 'react-icons/fa'; 
import './Inbox.css';

const Inbox = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedData, setCopiedData] = useState({ id: null, field: null });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                
                const msgs = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(msgs);
            } catch (error) {
                console.error("Error fetching messages: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const handleCopy = async (text, id, fieldName) => {
        if (!text) return;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.top = "-9999px";
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('حدث خطأ في النسخ الكلاسيكي', err);
                }
                document.body.removeChild(textArea);
            }

            setCopiedData({ id, field: fieldName }); 
            
            setTimeout(() => {
                setCopiedData({ id: null, field: null });
            }, 2000);

        } catch (err) {
            console.error("فشل النسخ: ", err);
        }
    };

    return (
        <div className="inbox-container">
            {/* شريط علوي يحتوي العنوان وزر الخروج */}
            <div className="inbox-header-flex">
                <h2 className="inbox-title">Admin Inbox - Contact Messages</h2>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
            
            {loading ? (
                <p style={{textAlign: 'center', fontSize: '1.2rem'}}>Loading Messages...</p>
            ) : messages.length === 0 ? (
                <p style={{textAlign: 'center', fontSize: '1.2rem'}}> Inbox is empty. No messages available.</p>
            ) : (
                <div className="messages-list">
                    {messages.map((msg) => (
                        <div key={msg.id} className="message-card">
                            <div className="message-header">
                                <h3>{msg.fullName}</h3>
                                <span className="message-date">
                                    {msg.createdAt ? new Date(msg.createdAt.toMillis()).toLocaleString() : 'تاريخ غير متوفر'}
                                </span>
                            </div>
                            
                            {/* حاوية الإيميل وزر النسخ */}
                            <div className="message-detail-container">
                                <p className="message-detail"><strong>Email:</strong> {msg.email}</p>
                                <button 
                                    className={`copy-btn ${copiedData.id === msg.id && copiedData.field === 'email' ? 'copied' : ''}`}
                                    onClick={() => handleCopy(msg.email, msg.id, 'email')}
                                    title="Copy Email"
                                >
                                    {copiedIdCheck(copiedData, msg.id, 'email') ? <FaCheck /> : <FaCopy />}
                                </button>
                            </div>

                            {/* حاوية الهاتف وزر النسخ */}
                            {msg.phone && (
                                <div className="message-detail-container">
                                    <p className="message-detail"><strong>Phone:</strong> <span dir="ltr">{msg.phone}</span></p>
                                    <button 
                                        className={`copy-btn ${copiedData.id === msg.id && copiedData.field === 'phone' ? 'copied' : ''}`}
                                        onClick={() => handleCopy(msg.phone, msg.id, 'phone')}
                                        title="Copy Phone"
                                    >
                                        {copiedIdCheck(copiedData, msg.id, 'phone') ? <FaCheck /> : <FaCopy />}
                                    </button>
                                </div>
                            )}

                            <div className="message-body">
                                <p>{msg.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const copiedIdCheck = (copiedData, msgId, field) => {
    return copiedData.id === msgId && copiedData.field === field;
};

export default Inbox;