import { Link, Outlet, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { auth } from "../firebase";
import '../style/style.css';

const Wrapper = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;

const Menu = styled.div`
  position: fixed;
  top: 0px;
  max-width:468px;
  width:100%;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  background:#ffffff;
  padding: 0 16px; 
  z-index: 1000; 
  align-items: center;
  align-self: stretch;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  img,
  svg {
    height: 16px;
    object-fit: cover; 
  }
`;


const LeftMenu = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap:24px;
`;

const RightMenu = styled.div`
  display: flex;
  align-items: center;
  height:50px;
  gap:16px;
  border-radius: 14px;
`;

const MenuItem = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; 
  padding:0;
  height:32px;
  width:32px;
  img,
  svg {
    width: 32px; 
    height: 32px;
  }
  &.post {
    background: #dcff4e;
    border-radius: 8px;
  }
`;
const Profile = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px; 
  width: 32px; 
  flex-shrink: 0; /* Prevent shrinking */
  img,
  svg {
    width: 32px; 
    height: 32px;
    object-fit: cover;
    border-radius: ${(props) => (props.className === "profile" ? "50%" : "0")}; /* Circular for profile */
  }
  
`;

export default function Layout() {
  const user = auth.currentUser;
  const avatarPhotoURL = user && user.photoURL ? user.photoURL : '/default-profile.svg';

  const navigate = useNavigate();

  const onPostTweet = () => {
    navigate("/post"); // Adjust this route as needed
  };

  return (
    <Wrapper>
      <Outlet />
      <Menu>
        {/* Left Menu with Posting Button */}
        <LeftMenu>
          <Logo>
            <img src="/birdie_logo_typo.svg" alt="Home" />
          </Logo>
          <MenuItem onClick={onPostTweet} className="post">
            <img src="/icon_plus_deepgreen.svg" alt="Post" />
          </MenuItem>
        </LeftMenu>

        {/* Right Menu with Home, Chat, Profile, and Log out Buttons */}
        <RightMenu>
          <Link to="/">
            <MenuItem>
              <img src="/icon_home_black.svg" alt="Home" />
            </MenuItem>
          </Link>
          <Link to="/chatrooms">
            <MenuItem>
              <img src="/icon_chat_black.svg" alt="Chatrooms" />
            </MenuItem>
          </Link>

          <Link to="/profile">
            <Profile className="profile">
              <img src={avatarPhotoURL} alt="Profile" />
            </Profile>
          </Link>
          {/* <Link to="https://open.kakao.com/o/shws3MRg">
            <MenuItem>
              <img src="/icon_help_softgreen.svg" alt="support" />
            </MenuItem>
          </Link> */}

        </RightMenu>
      </Menu>
    </Wrapper>
  );
}
