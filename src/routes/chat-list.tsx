import { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { auth } from '../firebase';
import { Auth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { StreamChat, ChannelFilters, ChannelOptions, ChannelSort } from 'stream-chat';
import {
  Chat,
  ChannelList,
  LoadingIndicator,
  DefaultStreamChatGenerics,
} from 'stream-chat-react';
import CustomChannelPreview from "../components/custom-channel-list-preview";

import 'stream-chat-react/dist/css/v2/index.css';

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
`;

const ChannelListContainer = styled.div`
  width: 100%;
  border-right: 1px solid #ccc;
`;

const ErrorMessage = styled.div`
  color: red;
  padding: 10px;
  text-align: center;
`;

const apiKey = '33ap3pfzwk43';

const fetchStreamUserToken = async (auth: Auth): Promise<string> => {
  const functions = getFunctions();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User is not authenticated.');
  }

  const getToken = httpsCallable(functions, 'ext-auth-chat-getStreamUserToken');
  try {
    const response = await getToken();
    console.log('Stream user token:', response.data);
    return response.data as string;
  } catch (error) {
    console.error('Error fetching Stream user token:', error);
    throw error;
  }
};

export default function ChatList() {
  const [client, setClient] = useState<StreamChat<DefaultStreamChatGenerics> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const user = auth.currentUser;

  useEffect(() => {
    let chatClient: StreamChat<DefaultStreamChatGenerics> | null = null;

    const initializeChat = async () => {
      if (!user) {
        setError('User is not authenticated.');
        return;
      }

      try {
        const token = await fetchStreamUserToken(auth);

        chatClient = StreamChat.getInstance<DefaultStreamChatGenerics>(apiKey);
        await chatClient.connectUser(
          {
            id: user.uid,
            name: user.displayName || user.uid,
            image: user.photoURL || undefined,
          },
          token
        );
        console.log('Client', chatClient);
        setClient(chatClient);
        setError(null);
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Failed to initialize chat. Please try again.');
      }
    };

    initializeChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [user]);

  const filters: ChannelFilters<DefaultStreamChatGenerics> = { members: { $in: [user?.uid || ''] } };
  const sort: ChannelSort<DefaultStreamChatGenerics> = { last_message_at: -1 };
  const options: ChannelOptions = { limit: 10 };

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (!client) {
    console.log('Loading chat...');
    return <LoadingIndicator />;
  }

  // // Custom ChannelPreview component
  // const CustomChannelPreview: React.FC<ChannelPreviewUIComponentProps<DefaultStreamChatGenerics>> = ({
  //   channel,
  //   latestMessage,
  // }) => {
  //   console.log(channel);
  //   const handleClick = () => {
  //     navigate(`/chatrooms/${channel.id}`);
  //   };

  //   return (
  //     <div
  //       onClick={handleClick}
  //       style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #eee' }}
  //     >
  //       <div style={{ fontWeight: 'bold' }}>{channel.data?.name || 'Unnamed Channel'}</div>
  //       <div style={{ fontSize: '12px', color: '#999' }}>{latestMessage}</div>
  //     </div>
  //   );
  // };

  return (
    <Wrapper>
      <Chat client={client}>
        <ChannelListContainer>
          <ChannelList
            filters={filters}
            sort={sort}
            options={options}
            Preview={CustomChannelPreview}
          />
        </ChannelListContainer>
      </Chat>
    </Wrapper>
  );
}