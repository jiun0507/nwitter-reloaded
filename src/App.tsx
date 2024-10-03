import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout";
import NoMenuLayout from "./components/noMenuLayout";
import Home from "./routes/home";
import Profile from "./routes/profile";
import Login from "./routes/login";
import CreateAccount from "./routes/create-account";
import { createGlobalStyle, styled } from "styled-components";
import reset from "styled-reset";
import { useEffect, useState } from "react";
import LoadingScreen from "./components/loading-screen";
import { auth } from "./firebase";
import ProtectedRoute from "./components/protected-route";
import ChatList from "./routes/chat-list";
import { ChatRoom } from "./routes/chat-room";
import EditProfile from "./routes/edit-profile";
import EditPhoto from "./routes/edit-photo";
import EditBackgroundPhotos from "./routes/edit-background-photos";
import EditDescription from "./routes/edit-description";
import EditNickname from "./routes/edit-nickname";
import EditGolfInfo from "./routes/edit-golf-info";
import ManageGolfScores from "./routes/manage-golf-scores";
import PostTweet from "./routes/post-tweet";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "edit-profile",
        element: <EditProfile />,
      },
      {
        path: "edit-nickname",
        element: <EditNickname />,
      },
      {
        path: "edit-photo",
        element: <EditPhoto />,
      },
      {
        path: "edit-background-photos",
        element: <EditBackgroundPhotos />,
      },
      {
        path: "edit-description",
        element: <EditDescription />,
      },
      {
        path: "edit-golf-info",
        element: <EditGolfInfo />,
      },
      {
        path: "manage-golf-scores",
        element: <ManageGolfScores />,
      },
      {
        path: "chatrooms",
        element: <ChatList />,
      },
      
    ],
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <NoMenuLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "chatrooms/:channelId",
        element: <ChatRoom />,
      },
      {
        path: "post",
        element: <PostTweet />,
      },
    ],
  },
  {
    path: "profile/:userId",
    element: <Profile />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/create-account",
    element: <CreateAccount />,
  },
]);

const GlobalStyles = createGlobalStyle`
  ${reset};
  * {
    box-sizing: border-box;
  }
  body {
    background-color: white;
    color: white;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.5;
    font-size: 16px;
  }
  
  @media (max-width: 768px) {
    body {
      font-size: 14px;
    }
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button, input, textarea {
    font-family: inherit;
    font-size: inherit;
  }
`;

const AppWrapper = styled.div`
  max-width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 0px;
  }
`;

function App() {
  const [isLoading, setLoading] = useState(true);
  
  const init = async () => {
    await auth.authStateReady();
    setLoading(false);
  };

  useEffect(() => {
    init();
    document.title = "버디: 골프 SNS";
  }, []);

  return (
    <AppWrapper>
      <GlobalStyles />
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <ContentWrapper>
          <RouterProvider router={router} />
        </ContentWrapper>
      )}
    </AppWrapper>
  );
}

export default App;