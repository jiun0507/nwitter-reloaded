// src/pages/EditPhoto.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
  background-color: #0d1e12;
  color: #ffffff;
`;

const Input = styled.input`
  padding: 10px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #1d9bf0;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  &:hover {
    background-color: #0d8ae0;
  }
`;

const BackButton = styled.button`
  background-color: #213829;
  border: none;
  padding: 10px 15px;
  color: #ffffff;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1a2d23;
  }
`;

const ArrowIcon = styled.span`
  font-size: 20px;
  margin-right: 8px;
`;

const EditPhoto = () => {
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setPhotoURL(userDoc.data().photoURL || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1 && currentUser) {
      const file = files[0];
      const photoRef = ref(storage, `avatars/${currentUser.uid}`);
      try {
        const snapshot = await uploadBytes(photoRef, file);
        const uploadedPhotoURL = await getDownloadURL(snapshot.ref);
        setPhotoURL(uploadedPhotoURL);
      } catch (error) {
        console.error('Error uploading photo:', error);
        alert('사진 업로드에 실패했습니다. 다시 시도해 주세요.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !photoURL) return;

    try {
      await updateProfile(currentUser, { photoURL });
      await updateDoc(doc(db, 'users', currentUser.uid), { photoURL });
      alert('프로필 사진이 변경되었습니다.');
      navigate('/edit-profile');
    } catch (error) {
      console.error('Error updating profile photo:', error);
      alert('프로필 사진 업데이트에 실패했습니다.');
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <Wrapper>
      <BackButton onClick={() => navigate('/edit-profile')}>
        <ArrowIcon>←</ArrowIcon>
        프로필로 돌아가기
      </BackButton>
      <h2>프로필 사진 변경</h2>
      <form onSubmit={handleSubmit}>
        <Input type="file" accept="image/*" onChange={handlePhotoChange} />
        <Button type="submit">저장</Button>
      </form>
      {photoURL && <img src={photoURL} alt="Profile Preview" width={80} height={80} />}
    </Wrapper>
  );
};

export default EditPhoto;
