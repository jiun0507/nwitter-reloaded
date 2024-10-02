import { Link, Outlet, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { auth } from "../firebase";

const Wrapper = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;

const Menu = styled.div`
  position: fixed;
  bottom: 16px;
  left: 0;
  right: 0;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  padding: 0 16px; /* 16px padding on both sides */
  z-index: 1000; /* Ensures the menu is above other content */
  align-items: center;
  align-self: stretch;
`;

const LeftMenu = styled.div`
  display: flex;
  align-items: center;
  background: #dcff4e;
  width:48px;
  height:48px;
  border-radius: 14px;
`;

const RightMenu = styled.div`
  display: flex;
  align-items: center;
  background: #054807;
  padding: 10px 16px;
  height:50px;
  border-radius: 14px;
`;

const MenuItem = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px; /* Adjusted to 32px as specified */
  width: 32px; /* Adjusted to 32px as specified */
  margin: 0 8px; /* 16px total spacing between icons */
  flex-shrink: 0; /* Prevent shrinking */
  img,
  svg {
    width: 24px; /* Reduced size to fit within 32px container */
    height: 24px;
    width: 40px; 
    height: 40px;
    object-fit: cover;
    
  }
  &.log-out svg {
    fill: #fff; /* Set the logout icon color to white */
  }
`;
const Profile = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px; /* Adjusted to 32px as specified */
  width: 32px; /* Adjusted to 32px as specified */
  margin: 0 8px; /* 16px total spacing between icons */
  flex-shrink: 0; /* Prevent shrinking */
  img,
  svg {
    width: 32px; 
    height: 32px;
    object-fit: cover;
    border-radius: ${(props) => (props.className === "profile" ? "50%" : "0")}; /* Circular for profile */
  }
  &.log-out svg {
    fill: #fff; /* Set the logout icon color to white */
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
          <MenuItem onClick={onPostTweet}>
            <img src="/icon_plus_deepgreen.svg" alt="Post" />
          </MenuItem>
        </LeftMenu>

        {/* Right Menu with Home, Chat, Profile, and Log out Buttons */}
        <RightMenu>
          <Link to="/">
            <MenuItem>
              <img src="/icon_home_softgreen.svg" alt="Home" />
            </MenuItem>
          </Link>
          <Link to="/chatrooms">
            <MenuItem>
              <img src="/icon_chat_softgreen.svg" alt="Chatrooms" />
            </MenuItem>
          </Link>
          <Link to="/profile">
            <Profile className="profile">
              <img src={avatarPhotoURL} alt="Profile" />
            </Profile>  
          </Link>
          <Link to="https://open.kakao.com/o/shws3MRg">
            <MenuItem>
              <img src="/support_agent.svg" alt="support" />
            </MenuItem>  
          </Link>
        </RightMenu>
      </Menu>
    </Wrapper>
  );
}
