import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import styled from 'styled-components';
import Button from '@mui/material/Button';
import '../style/style.css';

// Styled Components
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

const Input = styled.input`
  width: 100%;  
  padding: 38px 24px 10px 24px;
  border: none;
  border-radius: 0;
  font-size: 16px;
  outline: none;
  color: #fff;
  border-bottom: 1px solid #113B18;
  background:none;

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


const EditNickname = () => {
  const [nickname, setNickname] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setNickname(userDoc.data().displayName || '');
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
      await updateProfile(currentUser, { displayName: nickname });
      await updateDoc(doc(db, 'users', currentUser.uid), { displayName: nickname });
      alert('닉네임이 변경되었습니다.');
      navigate('/edit-profile');
    } catch (error) {
      console.error('Error updating nickname:', error);
      alert('닉네임 업데이트에 실패했습니다.');
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
          <Label>닉네임</Label>
          <Input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="새 닉네임을 입력하세요"
            required
          />
        </InputField>


      </form>
    </Wrapper>
  );
};

export default EditNickname;
