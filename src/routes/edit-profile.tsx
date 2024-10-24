import { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

// Styled Components
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 64px 16px 80px 16px ;
  background-color: #05330D; 
  color: #ffffff; 
  min-height: 100vh;
  width:100%;
`;

const Section = styled.div`
  display: flex;
  width:100%;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
`;




const SectionTitle = styled.h2`
  font-size: 14px;
  color: #9ccd8d; 
  width: 100%;
  height:40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
`;

const ProfileButton = styled.button`
  
  background: url('/icon_chevron_right_softgreen.svg') no-repeat right 8px center / 24px 24px #012007;
  border: none;
  height:64px;
  padding: 0px 16px;
  margin-top: 8px;
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
    background-color: #022708; /* Darker green on hover */
  }
`;

const LogoutButton = styled.button`
  background: url('/icon_chevron_right_red.svg') no-repeat right 8px center / 24px 24px #012007;
  border: none;
  height:64px;
  padding: 0px 16px;
  margin-top: 8px;
  width: 100%;
  font-size: 16px;
  color: #FF5656;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #022708; /* Darker green on hover */
  }
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


      <header className='header_sub'>
        <Button
          type="button"
          variant="contained"
          onClick={() => navigate("/profile")}
          className="back_button"
        >
        </Button>
      
       
      </header>

      <Section>
        <SectionTitle>프로필</SectionTitle>
        <ProfileButton onClick={() => handleNavigation("/edit-nickname")}>
          닉네임
        </ProfileButton>
        <ProfileButton onClick={() => handleNavigation("/edit-photo")}>
          프로필 사진  
        </ProfileButton>
        <ProfileButton onClick={() => handleNavigation("/edit-description")}>
          자기소개
        </ProfileButton>
      </Section>

      <Section>
        <SectionTitle>계정</SectionTitle>
        {/* 비밀번호 button not implemented */}

        <LogoutButton onClick={handleLogout}>
          로그아웃
        </LogoutButton>
      </Section>



    </Wrapper>
  );
}
