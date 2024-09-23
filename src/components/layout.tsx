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
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 16px; /* 16px padding on both sides */
  z-index: 1000; /* Ensures the menu is above other content */
`;

const LeftMenu = styled.div`
  display: flex;
  align-items: center;
  background: #dcff4e;
  padding: 10px 16px;
  border-top-right-radius: 16px; /* Less rounded */
  border-bottom-right-radius: 16px; /* Less rounded */
  border-top-left-radius: 8px; /* Slightly rounded for aesthetic */
  border-bottom-left-radius: 8px; /* Slightly rounded for aesthetic */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const RightMenu = styled.div`
  display: flex;
  align-items: center;
  background: #054807;
  padding: 10px 16px;
  border-top-left-radius: 16px; /* Less rounded */
  border-bottom-left-radius: 16px; /* Less rounded */
  border-top-right-radius: 8px; /* Slightly rounded for aesthetic */
  border-bottom-right-radius: 8px; /* Slightly rounded for aesthetic */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
    object-fit: cover;
    border-radius: ${(props) => (props.className === "profile" ? "50%" : "0")}; /* Circular for profile */
  }

  &.log-out svg {
    fill: #fff; /* Set the logout icon color to white */
  }
`;

export default function Layout() {
  const user = auth.currentUser;
  const avatarPhotoURL = user && user.photoURL ? user.photoURL : '/default-avatar.png';

  const navigate = useNavigate();

  const onLogOut = async () => {
    const ok = window.confirm("Are you sure you want to log out?");
    if (ok) {
      await auth.signOut();
      navigate("/login");
    }
  };

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
            <img src="/post.png" alt="Post" />
          </MenuItem>
        </LeftMenu>

        {/* Right Menu with Home, Chat, Profile, and Log out Buttons */}
        <RightMenu>
          <Link to="/">
            <MenuItem>
              <img src="/home.png" alt="Home" />
            </MenuItem>
          </Link>
          <Link to="/chatrooms">
            <MenuItem>
              <img src="/union.png" alt="Chatrooms" />
            </MenuItem>
          </Link>
          <Link to="/profile">
            <MenuItem className="profile">
              <img src={avatarPhotoURL} alt="Profile" />
            </MenuItem>
          </Link>
          <MenuItem onClick={onLogOut} className="log-out">
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Logout Icon */}
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 
                  2.25 0 0113 4.25v2a.75.75 0 
                  01-1.5 0v-2a.75.75 0 
                  00-.75-.75h-5.5a.75.75 0 
                  00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 
                  0 00.75-.75v-2a.75.75 0 011.5 
                  0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 
                  013 15.75V4.25z"
              />
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 
                  0 10-1.004-1.114l-2.5 
                  2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 
                  101.004-1.114l-1.048-.943h9.546A.75.75 0 
                  0019 10z"
              />
            </svg>
          </MenuItem>
        </RightMenu>
      </Menu>
    </Wrapper>
  );
}
