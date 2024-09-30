import { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// Styled Components
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
  background-color: #0d1e12; /* Dark green background */
  color: #ffffff; /* White text */
`;

const BackButtonContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #213829;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  font-size: 18px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #9ccd8d; /* Light green on hover */
  }
`;

const BackArrowIcon = styled.span`
  font-size: 24px;
  margin-right: 8px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  color: #9ccd8d; /* Light green color for section titles */
  margin-bottom: 10px;
  width: 100%;
  padding-left: 20px; /* Indentation for title */
`;

const ProfileButton = styled.button`
  background-color: #213829;
  border: none;
  padding: 15px 20px;
  margin: 8px 0;
  width: 100%;
  font-size: 16px;
  color: #ffffff;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1a2d23; /* Darker green on hover */
  }
`;

const LogoutButton = styled.button`
  background-color: #a82020; /* Red color for logout */
  border: none;
  padding: 15px 20px;
  margin: 8px 0;
  width: 100%;
  font-size: 16px;
  color: #ffffff;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #8c1b1b; /* Darker red on hover */
  }
`;

const ArrowIcon = styled.span`
  font-size: 20px;
  color: #ffffff; /* White arrow color */
`;

export default function EditProfile() {
  const currentUser = auth.currentUser;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("로그아웃 오류:", error);
      alert("로그아웃에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <Wrapper>
      <BackButtonContainer>
        <BackButton onClick={() => navigate("/profile")}>
          <BackArrowIcon>←</BackArrowIcon>
          프로필로 돌아가기
        </BackButton>
      </BackButtonContainer>
      <SectionTitle>프로필</SectionTitle>
      <ProfileButton onClick={() => handleNavigation("/edit-nickname")}>
        닉네임
        <ArrowIcon>›</ArrowIcon>
      </ProfileButton>
      <ProfileButton onClick={() => handleNavigation("/edit-photo")}>
        프로필 사진
        <ArrowIcon>›</ArrowIcon>
      </ProfileButton>
      <ProfileButton onClick={() => handleNavigation("/edit-description")}>
        자기소개
        <ArrowIcon>›</ArrowIcon>
      </ProfileButton>

      <SectionTitle>계정</SectionTitle>
      {/* 비밀번호 button not implemented */}

      <LogoutButton onClick={handleLogout}>
        로그아웃
      </LogoutButton>
    </Wrapper>
  );
}
