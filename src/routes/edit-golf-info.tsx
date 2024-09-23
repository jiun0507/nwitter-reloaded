// src/pages/EditGolfInfo.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #0d1e12; /* Dark green background */
  color: #ffffff; /* White text */
  min-height: 100vh;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #9ccd8d; /* Light green color for back arrow */
  font-size: 20px;
  cursor: pointer;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  color: #9ccd8d; /* Light green color */
  margin-bottom: 10px;
`;

const InputField = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  color: #9ccd8d;
  margin-bottom: 5px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #4a4a4a;
  border-radius: 5px;
  background-color: #213829; /* Darker green for input */
  color: #ffffff;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #9ccd8d; /* Light green border on focus */
  }
`;

const SaveButton = styled.button`
  background-color: #a5d337; /* Light lime color */
  color: #0d1e12; /* Dark text */
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  align-self: flex-end;
  margin-top: 20px;

  &:hover {
    background-color: #94c32b; /* Darker lime on hover */
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
      <BackButton onClick={() => navigate(-1)}>←</BackButton>
      <SectionTitle>골프 정보 수정</SectionTitle>
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
      <SaveButton onClick={handleSave}>저장</SaveButton>
    </Wrapper>
  );
};

export default EditGolfInfo;
