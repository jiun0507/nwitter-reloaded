// src/pages/EditDescription.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
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

const Textarea = styled.textarea`
  padding: 10px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  resize: none;
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

const EditDescription = () => {
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setDescription(userDoc.data().description || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { description });
      alert('자기소개가 변경되었습니다.');
      navigate('/edit-profile');
    } catch (error) {
      console.error('Error updating description:', error);
      alert('자기소개 업데이트에 실패했습니다.');
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
      <h2>자기소개 변경</h2>
      <form onSubmit={handleSubmit}>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="자기소개를 입력하세요"
          rows={4}
          required
        />
        <Button type="submit">저장</Button>
      </form>
    </Wrapper>
  );
};

export default EditDescription;
