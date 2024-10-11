import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import styled from 'styled-components';
import Button from "@mui/material/Button";
import CircularProgress from '@mui/material/CircularProgress'; // 로딩 스피너 추가
import '../style/style.css';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 64px 0px 80px 0px;
  background-color: #05330D;
  color: #ffffff;
  min-height: 100vh;
  align-items: center;
  position: relative;
`;

const ProfileImageWrapper = styled.div`
  position: relative;
  width: 180px;
  height: 180px;
  margin-top:16px;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;  // 동그랗게 만들기
  object-fit: cover;
  border: 2px solid #fff;
`;

const FileInputLabel = styled.label`
  position: absolute;
  width:48px;
  height:48px;
  bottom: -4px;
  right:-4px;
  background-color: #DCFF4E;
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Label = styled.label`
  font-size: 14px;
  text-align: center; 
  color: #A2E3AD; 
`;

const HiddenFileInput = styled.input`
  display: none; // 파일 첨부 버튼 숨기기
`;

const LoadingWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const InputField = styled.div`
  margin-top:16px;
  padding:30px;
  display: flex;
  position:relative;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  width:100%;
`;

const EditPhoto = () => {
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false); // 업로드 상태 관리
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
      setIsUploading(true); // 업로드 시작 시 로딩 상태로 변경
      try {
        const snapshot = await uploadBytes(photoRef, file);
        const uploadedPhotoURL = await getDownloadURL(snapshot.ref);
        setPhotoURL(uploadedPhotoURL); // 사진 업데이트

        // 사진이 업로드된 후 1초 후에 로딩을 종료
        setTimeout(() => {
          setIsUploading(false); // 1초 후 로딩 중단
        }, 2000);
        
      } catch (error) {
        console.error('Error uploading photo:', error);
        alert('사진 업로드에 실패했습니다. 다시 시도해 주세요.');
        setIsUploading(false); // 실패 시 로딩 중단
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

          <ProfileImageWrapper>
            {/* 사진 업로드 중일 때만 CircularProgress 표시 */}
            {isUploading && (
              <LoadingWrapper>
                <CircularProgress sx={{ color: '#DCFF4E' }} />
              </LoadingWrapper>
            )}

            {/* 사진이 있을 때만 보여주기 */}
            {photoURL && <ProfileImage src={photoURL} alt="Profile Preview" />}

            {/* 파일 첨부 아이콘 */}
            <FileInputLabel>
              <img src="/icon_camera_deepgreen.svg" width="24px" height="24px" />
              <HiddenFileInput type="file" accept="image/*" onChange={handlePhotoChange} />
            </FileInputLabel>
          </ProfileImageWrapper>
        </InputField>
      </form>
    </Wrapper>
  );
};

export default EditPhoto;