// src/pages/Profile.tsx

import { styled } from "styled-components";
import { ACTIVITY_FEEDS_USER_DB_PATH, auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";
import { useParams, useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  display: flex;
  align-items: flex-start; 
  flex-direction: column;
  gap: 0px;
  color: #ffffff;
  background-color: #0a2e14; /* Darker green */
  min-height: 100vh;
  padding: 20px;
  width: 100%;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between; /* Space between elements */
  gap: 20px;
  width: 100%;
  margin-bottom: 20px;
  color: #A2E3AD;
`;

const AvatarNameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const AvatarUpload = styled.label`
  width: 56px;
  height: 56px;
  border-radius: 32px;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 32px;
`;

const AvatarInput = styled.input`
  display: none;
`;

const Nickname = styled.span`
  font-size: 14px;
  color: #FFFFFF;
  font-weight: bold;
`;

const Name = styled.span`
  font-size: 13px;
  color: #3E8B4D;
  font-weight: bold;
`;

const Description = styled.p`
  max-width: 600px;
  width: 100%;
  text-align: left;
  color: #ffffff;
`;

const Separator = styled.hr`
  width: 100%;
  max-width: 600px;
  border: none;
  border-top: 0.5px solid #808080;
  margin: 10px 0;
`;

const GolfInfo = styled.div`
  width: 100%;
  max-width: 600px;
  border-radius: 10px;
  margin-bottom: 20px;
`;

const GolfInfoHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const GolfScoresHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const GolfInfoTitle = styled.h4`
  font-size: 14px;
  margin-top: 10px;
  color: #A2E3AD;
`;

const GolfInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;

const GolfInfoItem = styled.div`
  font-size: 12px;
  color: #ffffff;
  background-color: #0f3e22;
  padding: 12px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  
  span {
    &:first-child {
      font-weight: bold;
      color: #A2E3AD;
    }
    &:last-child {
      font-size: 14px;
      color: #ffffff;
    }
  }
`;

const GolfInfoItemLabel = styled.div`
  color: #357040;
  font-size: 12px;
`;

const GolfInfoItemContent = styled.div`
  color: #A2E3AD;
  font-size: 16px;
`;

/* Updated GolfScores and related components */
const GolfScores = styled.div`
  display: flex;
  overflow-x: auto;
  padding: 10px 0;
  background-color: #0f3e22;
  border-radius: 14px;
  gap: 20px;
`;

const ScoreItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
`;

const ScoreValue = styled.div`
  font-size: 14px;
  color: #A2E3AD;
  margin-bottom: 5px;
`;

const ScoreLine = styled.div`
  position: relative;
  width: 2px;
  height: 100px;
  background-color: #A2E3AD;
  margin-bottom: 5px;
`;

const Dot = styled.div`
  position: absolute;
  left: -4px;
  width: 10px;
  height: 10px;
  background-color: #A2E3AD;
  border-radius: 50%;
`;

const ScoreDate = styled.div`
  font-size: 12px;
  color: #FFFFFF;
`;

const ChatButton = styled.button`
  padding: 10px 20px;
  background-color: #1d9bf0;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  align-self: flex-start;
  &:hover {
    background-color: #0d8ae0;
  }
`;

const EditButton = styled.button`
  padding: 6px 12px;
  background-color: #05280B;
  color: #A2E3AD;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    background-color: #45a049;
  }
`;

const Tweets = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
  max-width: 600px;
`;

interface GolfScore {
  date: string;
  score: number;
}

interface UserGolfInfo {
  name: string;
  nickname: string;
  email: string;
  downToPlayGolf: boolean | null;
  bestScore: number | null;
  averageScore: number | null;
  description: string;
  numberOfEagles: number | null;
  holeInOneExperience: boolean | null;
  scores  : GolfScore[];
  favoriteGolfer: string;
  golfEquipment: string;
}

interface UserProfile {
  displayName: string;
  photoURL: string | null;
  golfInfo: UserGolfInfo | null;
}

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const currentUser = auth.currentUser;
  const [tweets, setTweets] = useState<ITweet[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [currentProfileUserId, setCurrentProfileUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [minScore, setMinScore] = useState<number | null>(null);
  const [maxScore, setMaxScore] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleChatButtonClick = async () => {
    if (!currentUser || !currentProfileUserId) return;

    const members = [currentUser.uid, currentProfileUserId].sort();
    const channelId = `chat_${members.join('_')}`;

    navigate(`/chatrooms/${channelId}`);
  };

  const handleEditProfileClick = () => {
    navigate('/edit-profile');
  };

  const handleEditGolfInfoClick = () => {
    navigate('/edit-golf-info');
  };

  const handleAddScoreClick = () => {
    navigate('/manage-golf-scores');
  };

  useEffect(() => {
    if (userId) {
      setCurrentProfileUserId(userId);
    } else if (currentUser) {
      setCurrentProfileUserId(currentUser.uid);
    }
  }, [userId, currentUser]);

  useEffect(() => {
    if (currentProfileUserId) {
      const userIsCurrent = currentUser?.uid === currentProfileUserId;
      setIsCurrentUser(userIsCurrent);
      fetchProfile();
      fetchTweets(userIsCurrent);
    }
  }, [currentProfileUserId, currentUser]);

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isCurrentUser) return;
    const { files } = e.target;
    if (!currentUser) return;
    if (files && files.length === 1) {
      const file = files[0];
      const locationRef = ref(storage, `avatars/${currentUser.uid}`);
      try {
        const result = await uploadBytes(locationRef, file);
        const avatarUrl = await getDownloadURL(result.ref);
        await updateProfile(currentUser, {
          photoURL: avatarUrl,
        });
        await updateDoc(doc(db, "users", currentUser.uid), {
          photoURL: avatarUrl,
        });
        setProfile(prev => prev ? { ...prev, photoURL: avatarUrl } : null);
      } catch (error) {
        console.error("Error updating avatar:", error);
      }
    }
  };

  const fetchProfile = async () => {
    if (!currentProfileUserId) return;
    setIsLoading(true);
    try {
      const userDoc = await getDoc(doc(db, "users", currentProfileUserId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserGolfInfo & { displayName: string, photoURL: string };

        const recentGolfScores = userData.scores || [];
        const parsedGolfScores = recentGolfScores.map(score => ({
          date: score.date,
          score: Number(score.score),
        }));
        console.log("scores ",userData,  recentGolfScores, parsedGolfScores);
        if (parsedGolfScores.length > 0) {
          const scoresValues = parsedGolfScores.map(score => score.score);
          const minScoreValue = Math.min(...scoresValues);
          const maxScoreValue = Math.max(...scoresValues);
          setMinScore(minScoreValue);
          setMaxScore(maxScoreValue);
        }

        setProfile({
          displayName: userData.name,
          photoURL: userData?.photoURL || null,
          golfInfo: {
            nickname: userData.nickname,
            name: userData.name,
            email: userData.email,
            downToPlayGolf: userData.downToPlayGolf,
            bestScore: userData.bestScore,
            averageScore: userData.averageScore,
            description: userData.description,
            numberOfEagles: userData.numberOfEagles,
            holeInOneExperience: userData.holeInOneExperience,
            scores: parsedGolfScores,
            favoriteGolfer: userData.favoriteGolfer,
            golfEquipment: userData.golfEquipment,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTweets = async (canDelete: boolean) => {
    if (!currentProfileUserId) return;
    setIsLoading(true);
    try {
      const tweetQuery = query(
        collection(db, `${ACTIVITY_FEEDS_USER_DB_PATH}/${currentProfileUserId}`),
        orderBy("createdAt", "desc"),
        limit(25)
      );
      const snapshot = await getDocs(tweetQuery);
      const fetchedTweets: ITweet[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          tweet: data.tweet,
          createdAt: data.createdAt,
          userId: data.userId,
          username: data.username,
          photo: data.photo || null,
          video: data.video || null,
          userPhoto: data.userPhoto || null,
          aggregateFeedDocId: data.aggregateFeedDocId || null,
          canDelete: canDelete,
          likesCount: data.likesCount || 0,
          dislikesCount: data.dislikesCount || 0
        };
      });
      setTweets(fetchedTweets);
    } catch (error) {
      console.error("Error fetching tweets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>No profile data found.</div>;
  }

  return (
    <Wrapper>
      <ProfileHeader>
        <AvatarNameContainer>
          <AvatarUpload htmlFor="avatar">
            {profile?.photoURL ? (
              <AvatarImg src={profile?.photoURL} alt={`${profile.displayName}'s profile`} />
            ) : (
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
              </svg>
            )}
            {isCurrentUser && (
              <AvatarInput
                onChange={onAvatarChange}
                id="avatar"
                type="file"
                accept="image/*"
              />
            )}
          </AvatarUpload>
          <div>
            <Nickname>{profile?.golfInfo?.nickname ?? "Anonymous"}</Nickname>
            <Name>{profile?.displayName ?? "Anonymous"}</Name>
          </div>
        </AvatarNameContainer>
        {isCurrentUser && (
          <EditButton onClick={handleEditProfileClick}>계정</EditButton>
        )}
      </ProfileHeader>

      {profile?.golfInfo?.description && (
        <Description>{profile.golfInfo.description}</Description>
      )}

      {!isCurrentUser && (
        <ChatButton onClick={handleChatButtonClick}>Start Chat</ChatButton>
      )}

      {profile?.golfInfo?.scores && profile.golfInfo.scores.length > 0 && (
        <>
          <Separator />
          <GolfScoresHeader>
            <GolfInfoTitle>스코어 기록</GolfInfoTitle>
            {isCurrentUser && (
              <EditButton onClick={handleAddScoreClick}>기록</EditButton>
            )}
          </GolfScoresHeader>
          <GolfScores>
            {profile.golfInfo.scores
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((score, index) => {
                const minS = minScore ?? score.score;
                const maxS = maxScore ?? score.score;
                const scoreRange = maxS - minS || 1; // Avoid division by zero

                const positionPercentage =
                  ((maxS - score.score) / scoreRange) * 100;

                const formattedDate = new Date(score.date).toISOString().slice(2, 10); // yy-mm-dd

                return (
                  <ScoreItem key={index}>
                    <ScoreValue>{score.score}</ScoreValue>
                    <ScoreLine>
                      <Dot style={{ bottom: `${positionPercentage}%` }} />
                    </ScoreLine>
                    <ScoreDate>{formattedDate}</ScoreDate>
                  </ScoreItem>
                );
              })}
          </GolfScores>
        </>
      )}

      {profile?.golfInfo && (
        <>
          <Separator />
          <GolfInfo>
            <GolfInfoHeader>
              <GolfInfoTitle>골퍼 정보</GolfInfoTitle>
              {isCurrentUser && (
                <EditButton onClick={handleEditGolfInfoClick}>편집</EditButton>
              )}
            </GolfInfoHeader>
            <GolfInfoGrid>
              <GolfInfoItem>
                <GolfInfoItemLabel>버디 파트너를 찾고있나요?</GolfInfoItemLabel>
                <GolfInfoItemContent>{profile.golfInfo.downToPlayGolf ? "네" : "아니오"}</GolfInfoItemContent>
              </GolfInfoItem>
              <GolfInfoItem>
                <GolfInfoItemLabel>베스트 스코어</GolfInfoItemLabel>
                <GolfInfoItemContent>{profile.golfInfo.bestScore || "N/A"}</GolfInfoItemContent>
              </GolfInfoItem>
              <GolfInfoItem>
                <GolfInfoItemLabel>평균 스코어</GolfInfoItemLabel>
                <GolfInfoItemContent>{profile.golfInfo.averageScore || "N/A"}</GolfInfoItemContent>
              </GolfInfoItem>
              <GolfInfoItem>
                <GolfInfoItemLabel>이글</GolfInfoItemLabel>
                <GolfInfoItemContent>{profile.golfInfo.numberOfEagles || "N/A"}</GolfInfoItemContent>
              </GolfInfoItem>
              <GolfInfoItem>
                <GolfInfoItemLabel>홀인원</GolfInfoItemLabel>
                <GolfInfoItemContent>{profile.golfInfo.holeInOneExperience ? "Yes" : "No"}</GolfInfoItemContent>
              </GolfInfoItem>
              <GolfInfoItem>
                <GolfInfoItemLabel>최애 골프선수</GolfInfoItemLabel>
                <GolfInfoItemContent>{profile.golfInfo.favoriteGolfer || "N/A"}</GolfInfoItemContent>
              </GolfInfoItem>
              <GolfInfoItem>
                <GolfInfoItemLabel>골프 장비</GolfInfoItemLabel>
                <GolfInfoItemContent>{profile.golfInfo.golfEquipment || "N/A"}</GolfInfoItemContent>
              </GolfInfoItem>
            </GolfInfoGrid>
          </GolfInfo>
        </>
      )}

      <Tweets>
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </Tweets>
    </Wrapper>
  );
}
