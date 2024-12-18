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
        path: "edit-background-photos",
        element: <EditBackgroundPhotos />,
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
        path: "manage-golf-scores",
        element: <ManageGolfScores />,
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
        path: "chatrooms/:channelId",
        element: <ChatRoom />,
      },
      {
        path: "post",
        element: <PostTweet />,
      },
      {
        path: "chatrooms",
        element: <ChatList />,
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
    display: flex;
    padding-bottom: 16px;
    flex-direction: column;
    align-items: center;
    align-self: stretch;
    background-color: white;
    color: white;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.5;
    font-size: 16px;
    color:#2D2D2D;
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

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width:100vw;
`;

const ContentWrapper = styled.div`

  display: flex;
  flex-direction: column;
  align-items: center;
  width:100vw;
  margin: 0 auto;


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