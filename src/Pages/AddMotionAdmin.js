import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import './AddMotionAdmin.css';

const IMGBB_API_KEY = "875be18cca7c2fcde6c8e84c6ad86143"; // احصل عليه مجاناً من https://api.imgbb.com/

const AddMotionAdmin = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image1File, setImage1File] = useState(null);
    const [image2File, setImage2File] = useState(null);
    const [image3File, setImage3File] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const compressAndConvertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(compressedBase64);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const uploadToImgBB = async (base64) => {
        if (!base64) return null;

        const cleanBase64 = base64.split(',')[1];
        const formData = new FormData();
        formData.append('image', cleanBase64);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (data.success) {
            return data.data.url;
        }
        throw new Error('فشل رفع الصورة إلى imgBB');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg('');
        setErrorMsg('');

        try {
            const img1Base64 = await compressAndConvertToBase64(image1File);
            const img2Base64 = await compressAndConvertToBase64(image2File);
            const img3Base64 = await compressAndConvertToBase64(image3File);

            const [url1, url2, url3] = await Promise.all([
                uploadToImgBB(img1Base64),
                uploadToImgBB(img2Base64),
                uploadToImgBB(img3Base64),
            ]);

            const imagesArray = [url1, url2, url3].filter(url => url !== null);

            await addDoc(collection(db, "motions"), {
                title,
                description,
                images: imagesArray,
                createdAt: new Date()
            });

            setSuccessMsg('Motion added successfully! 🚀');
            setTitle('');
            setDescription('');
            setImage1File(null);
            setImage2File(null);
            setImage3File(null);

            setTimeout(() => setSuccessMsg(''), 4000);

        } catch (error) {
            console.error("Error adding motion: ", error);
            setErrorMsg('حدث خطأ أثناء نشر الموشن، حاول مرة أخرى.');
            setTimeout(() => setErrorMsg(''), 4000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-motion-page-wrapper">
            <div className="add-motion-container">
                <h2>Add Motion</h2>
                {successMsg && <p className="add-motion-success">{successMsg}</p>}
                {errorMsg && <p className="add-motion-error">{errorMsg}</p>}

                <form onSubmit={handleSubmit} className="add-motion-form">
                    <div className="form-field">
                        <label>Motion Title:</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="Enter motion title..."
                            required 
                        />
                    </div>

                    <div className="form-field">
                        <label>Description:</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            rows="4" 
                            placeholder="Write a brief overview of the debate topic..."
                            required 
                        />
                    </div>

                    <div className="form-field">
                        <label>The First Image: </label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => setImage1File(e.target.files[0])} 
                        />
                    </div>

                    <div className="form-field">
                        <label>The Second Image:</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => setImage2File(e.target.files[0])} 
                        />
                    </div>

                    <div className="form-field">
                        <label>The Third Image:</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => setImage3File(e.target.files[0])} 
                        />
                    </div>

                    <button type="submit" disabled={loading} className="submit-motion-btn">
                        {loading ? 'Publishing...' : 'Publish Motion'}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default AddMotionAdmin;