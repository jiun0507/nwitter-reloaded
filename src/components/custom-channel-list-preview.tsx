// src/components/CustomChannelPreview.tsx

import React, { useEffect, useState } from 'react';
import { ChannelPreviewUIComponentProps } from 'stream-chat-react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Styled Components
const PreviewContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0 16px;
  margin-top:16px;
  cursor: pointer;
  background:none;
  border:none;
  &:hover {
    background: none;
  }
`;

const OpponentPhoto = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
`;

const PreviewContent = styled.div`
  flex: 1;
`;

const OpponentName = styled.div`
  font-weight: bold;
  font-size: 16px;
`;

const LastMessage = styled.div`
  font-size: 14px;
  color: #555;
`;

// Simple in-memory cache for user data
const userCache: { [key: string]: { displayName: string; photoURL: string | null } } = {};

// Interface for user data
interface UserData {
  displayName: string;
  photoURL: string | null;
}

const CustomChannelPreview: React.FC<ChannelPreviewUIComponentProps> = ({ channel, latestMessage }) => {
  const navigate = useNavigate();
  const [opponent, setOpponent] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchOpponentData = async () => {
      try {
        if (!currentUserId) {
          setError('Current user not found.');
          setLoading(false);
          return;
        }
        console.log("channel header preview", currentUserId, channel.state.members);
        // Identify opponent's ID (assuming 2-person chat)
        const opponentMember = Object.values(channel.state.members).find(member => member.user_id !== currentUserId);
        console.log("opponent", opponentMember);
        if (!opponentMember) {
          setError('Opponent not found.');
          setLoading(false);
          return;
        }

        const opponentId = opponentMember.user_id || "";

        // Check if opponent data is already in cache
        if (userCache[opponentId]) {
          setOpponent(userCache[opponentId]);
          setLoading(false);
          return;
        }
        const displayName = opponentMember.user?.name || 'Anonymous';
        const photoURL = opponentMember.user?.image || null;
        const opponentData: UserData = { displayName, photoURL };

        userCache[opponentId] = opponentData;
        setOpponent(opponentData);
      } catch (err) {
        console.error('Error fetching opponent data:', err);
        setError('Failed to load opponent data.');
      } finally {
        setLoading(false);
      }
    };

    fetchOpponentData();
  }, [channel, currentUserId]);

  const handleClick = () => {
    navigate(`/chatrooms/${channel.id}`);
  };

  if (loading) {
    return (
      <PreviewContainer>
        <OpponentPhoto src="/default-profile.png" alt="Loading..." />
        <PreviewContent>
          <OpponentName>Loading...</OpponentName>
          <LastMessage>Loading...</LastMessage>
        </PreviewContent>
      </PreviewContainer>
    );
  }

  if (error || !opponent) {
    return (
      <PreviewContainer onClick={handleClick}>
        <OpponentPhoto src="/default-profile.png" alt="Default profile" />
        <PreviewContent>
          <OpponentName>Unknown User</OpponentName>
          <LastMessage>{latestMessage || 'No messages yet.'}</LastMessage>
        </PreviewContent>
      </PreviewContainer>
    );
  }

  return (
    <PreviewContainer onClick={handleClick}>
      <OpponentPhoto src={opponent.photoURL || '/default-profile.png'} alt={`${opponent.displayName}'s profile`} />
      <PreviewContent>
        <OpponentName>{opponent.displayName}</OpponentName>
        <LastMessage>{latestMessage || 'No messages yet.'}</LastMessage>
      </PreviewContent>
    </PreviewContainer>
  );
};

export default CustomChannelPreview;
