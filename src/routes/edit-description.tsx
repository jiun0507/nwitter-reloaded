// src/pages/EditDescription.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import styled from 'styled-components';
import Button from "@mui/material/Button";
import '../style/style.css';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 64px 0px 80px 0px ;
  background-color: #05330D; 
  color: #ffffff; 
  min-height: 100vh;
`;

const Label = styled.label`
  position:absolute;
  left:24px;
  top:6px;
  font-size: 14px;
  text-align: left; 
  color: #A2E3AD; 
`;


const Textarea = styled.textarea`
  width: 100%;  
  height:50vh;
  padding: 38px 24px 10px 24px;
  line-height:1.6;
  border: none;
  border-radius: 0;
  font-size: 16px;
  outline: none;
  color: #fff;
  border-bottom: 1px solid #113B18;
  background:none;
  resize:none;

  &:focus {
    border-bottom: 1px solid #DCFF4E;
  }

  &::placeholder {
    color: #366D3F;
  }

}
`;

const InputField = styled.div`
  margin-top:16px;
  display: flex;
  position:relative;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  align-self: stretch;
  width:100%;
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

    
      <form onSubmit={handleSubmit}>
      <header className='header_sub'>
          <Button
            type="button"
            variant="contained"
            onClick={() => navigate('/edit-profile')}
            className="back_button"
          >
          </Button>
          <Button type="submit" className="primary">저장</Button>
        </header>
        <InputField>
          <Label>자기소개</Label>
          <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="자기소개를 입력하세요"
          rows={4}
          required
        />
        </InputField>
        
       
      </form>
    </Wrapper>
  );
};

export default EditDescription;
