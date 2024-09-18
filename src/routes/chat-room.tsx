import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { StreamChat, Channel as StreamChannel } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
  DefaultStreamChatGenerics,
} from 'stream-chat-react';
import styled from 'styled-components';

import { auth } from '../firebase';
import { Auth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

import 'stream-chat-react/dist/css/v2/index.css';

const ChatContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
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

export const ChatRoom: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const [client, setClient] = useState<StreamChat<DefaultStreamChatGenerics> | null>(null);
  const [channel, setChannel] = useState<StreamChannel<DefaultStreamChatGenerics> | null>(null);
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
        console.log('Client initialized:', chatClient);
        setClient(chatClient);

        if (!channelId) return;

        // Extract the member IDs from the channelId
        const memberIds = channelId.replace('chat_', '').split('_');

        const fetchedChannel = chatClient.channel('messaging', channelId,{
          members: memberIds,
          
        });
        await fetchedChannel.watch();
        setChannel(fetchedChannel);

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
  }, [user, channelId]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!client || !channel) {
    return <div>Loading chat room...</div>;
  }

  return (
    <ChatContainer>
      <Chat client={client}>
        <Channel channel={channel}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </ChatContainer>
  );
};
