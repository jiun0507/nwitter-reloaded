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
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 600px;
  display: flex;
  justify-content: space-between; /* Space between left and right menus */
  align-items: center;
  background: rgba(255, 255, 255, 0.9); /* Semi-transparent background */
  padding: 10px 20px;
  border-radius: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000; /* Ensures the menu is above other content */
`;

const LeftMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const RightMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const MenuItem = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ddd;
  height: 50px;
  width: 50px;
  border-radius: 50%;
  background: #fff;
  svg {
    width: 30px;
    fill: #333;
  }
  &.log-out {
    border-color: tomato;
    svg {
      fill: tomato;
    }
  }
  &.post-tweet {
    background: tomato;
    border-color: tomato;
    svg {
      fill: #fff;
    }
    &:hover {
      background: #ff4d4d;
    }
  }
`;

export default function Layout() {
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
        <LeftMenu>
          <Link to="/">
            <MenuItem>
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Home Icon */}
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 
                  1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 
                  00-1 1v3a1 1 0 01-1 1H5a1 1 0 
                  01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                />
              </svg>
            </MenuItem>
          </Link>
          <Link to="/profile">
            <MenuItem>
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Profile Icon */}
                <path d="M10 8a3 3 0 100-6 3 3 0 000 
                  6zM3.465 14.493a1.23 1.23 0 00.41 
                  1.412A9.957 9.957 0 0010 
                  18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 
                  7.002 0 00-13.074.003z" />
              </svg>
            </MenuItem>
          </Link>
          <Link to="/chatrooms">
            <MenuItem>
              <svg
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Chatrooms Icon */}
                <path
                  d="M2 5a2 2 0 012-2h16a2 2 0 
                  012 2v12a2 2 0 01-2 2H8l-4 4V5z"
                />
              </svg>
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
        </LeftMenu>
        <RightMenu>
          <MenuItem onClick={onPostTweet} className="post-tweet">
            <svg
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Post Tweet Icon (Plus Icon) */}
              <path
                d="M12 4.5a.75.75 0 01.75.75V11.25H19.5a.75.75 
                0 010 1.5H12.75V19.5a.75.75 0 
                01-1.5 0V12.75H4.5a.75.75 0 
                010-1.5H11.25V5.25a.75.75 0 
                01.75-.75z"
              />
            </svg>
          </MenuItem>
        </RightMenu>
      </Menu>
    </Wrapper>
  );
}
