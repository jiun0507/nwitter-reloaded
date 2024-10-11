// src/pages/EditGolfInfo.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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



const EditGolfInfo = () => {
  const currentUser = auth.currentUser;
  const navigate = useNavigate();
  const [golfInfo, setGolfInfo] = useState({
    bestScore: '',
    averageScore: '',
    driverDistance: '',
    experience: '',
    favoriteGolfer: '',
    eagles: '',
    holeInOne: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGolfInfo = async () => {
      if (!currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setGolfInfo({
            bestScore: data.bestScore || '',
            averageScore: data.averageScore || '',
            driverDistance: data.driverDistance || '',
            experience: data.experience || '',
            favoriteGolfer: data.favoriteGolfer || '',
            eagles: data.eagles || '',
            holeInOne: data.holeInOne || '',
          });
        }
      } catch (error) {
        console.error('Error fetching golf info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGolfInfo();
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGolfInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), golfInfo);
      alert('골프 정보가 저장되었습니다.');
      navigate('/profile'); // Navigate back to the profile page after saving
    } catch (error) {
      console.error('Error saving golf info:', error);
      alert('골프 정보 저장에 실패했습니다.');
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <Wrapper>
      <header className='header_sub'>
        <Button
          type="button"
          variant="contained"
          onClick={() => navigate(-1)}
          className="back_button"
        >
        </Button>
      
        <Button
          type="button"
          variant="contained"
          onClick={handleSave}
          className="primary"
        >
          저장
        </Button>
      </header>
      
      <InputField>
        <Label htmlFor="bestScore">베스트 스코어</Label>
        <Input
          id="bestScore"
          name="bestScore"
          type="number"
          value={golfInfo.bestScore}
          onChange={handleChange}
          placeholder="베스트 스코어를 입력하세요"
        />
      </InputField>
      <InputField>
        <Label htmlFor="averageScore">평균 스코어</Label>
        <Input
          id="averageScore"
          name="averageScore"
          type="number"
          value={golfInfo.averageScore}
          onChange={handleChange}
          placeholder="평균 스코어를 입력하세요"
        />
      </InputField>
      <InputField>
        <Label htmlFor="driverDistance">드라이버 비거리</Label>
        <Input
          id="driverDistance"
          name="driverDistance"
          type="number"
          value={golfInfo.driverDistance}
          onChange={handleChange}
          placeholder="드라이버 비거리를 입력하세요"
        />
      </InputField>
      <InputField>
        <Label htmlFor="experience">구력</Label>
        <Input
          id="experience"
          name="experience"
          type="text"
          value={golfInfo.experience}
          onChange={handleChange}
          placeholder="구력을 입력하세요 (예: 3년 6개월)"
        />
      </InputField>
      <InputField>
        <Label htmlFor="favoriteGolfer">최애 골프선수</Label>
        <Input
          id="favoriteGolfer"
          name="favoriteGolfer"
          type="text"
          value={golfInfo.favoriteGolfer}
          onChange={handleChange}
          placeholder="최애 골프선수를 입력하세요"
        />
      </InputField>
      <InputField>
        <Label htmlFor="eagles">이글</Label>
        <Input
          id="eagles"
          name="eagles"
          type="number"
          value={golfInfo.eagles}
          onChange={handleChange}
          placeholder="이글 횟수를 입력하세요"
        />
      </InputField>
      <InputField>
        <Label htmlFor="holeInOne">홀인원</Label>
        <Input
          id="holeInOne"
          name="holeInOne"
          type="number"
          value={golfInfo.holeInOne}
          onChange={handleChange}
          placeholder="홀인원 횟수를 입력하세요"
        />
      </InputField>
      
    </Wrapper>
  );
};

export default EditGolfInfo;
