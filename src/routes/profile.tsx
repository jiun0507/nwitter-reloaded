import { styled, createGlobalStyle } from "styled-components";
import { ACTIVITY_FEEDS_USER_DB_PATH, auth, db, storage } from "../firebase";
import { useEffect, useState, useRef } from "react";
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

// Define the prop type for BackgroundPhotoContainer
interface BackgroundPhotoProps {
  bgUrl: string;
}

// Global Style for box-sizing
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }
`;

const Wrapper = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 0px;
  color: #ffffff;
  background-color: #05330D; 
  min-height: 100vh;
  width: 100%;
`;

const BackgroundPhotoContainer = styled.div<BackgroundPhotoProps>`
  position: relative;
  width: 100%;
  height: 400px;
  background-image: url(${props => props.bgUrl});
  background-size: cover;
  background-position: center;
`;

const BackButton = styled.button`
  position: absolute;
  top: 10px;
  left: 10px;
  border: none;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background:none;
  filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.75));

  &:hover {
    background: none;
  }
`;

const CameraButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background:none;
  filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.75));

  &:hover {
    background: none;
  }
`;

const DotsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
`;

const BackgroundDot = styled.div<{ isActive: boolean }>`
  width: 10px;
  height: 10px;
  background-color: ${props => (props.isActive ? "#FFFFFF" : "#3E8B4D")};
  border-radius: 50%;
  cursor: pointer;
`;

const BackgroundNavButton = styled.button<{ direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${(props) => (props.direction === 'left' ? 'left: 10px;' : 'right: 10px;')}
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  color: #ffffff;
  cursor: pointer;
  z-index: 10;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }

  pointer-events: auto;
`;

const ProfileHeader = styled.div`
  display: flex;
  padding:16px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
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
  padding:16px;
  text-align: left;
  color: #ffffff;
`;

const Separator = styled.hr`
  width: 100%;
  max-width: 600px;
  border: none;
  border-top: 1px solid #113B18;
  margin: 10px 0;
`;

const GolfInfo = styled.div`
  width: 100%;
  max-width: 600px;
  border-radius: 10px;
  padding:16px;
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
  padding:0 16px;
  height:40px;
  width:100%;
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
  background-color: #012007;
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

const GolfScoresContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
`;

const GolfScores = styled.div`
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 16px 0;
  border-radius: 14px;

  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  scroll-behavior: smooth;
  max-width: 100%;


`;

const ScoreItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 auto;
  width: 20vw;
  height: 150px;
`;

const ScoreValue = styled.div`
  font-size: 14px;
  color: #fff;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ScoreLine = styled.div`
  position: relative;
  width: 1px;
  height: 100px;
  background-color: #244E2C;
  margin-bottom: 5px;
`;

const Dot = styled.div`
  position: absolute;
  left: -4px;
  width: 10px;
  height: 10px;
  background-color: #fff;
  border-radius: 50%;
`;

const ScoreDate = styled.div`
  font-size: 12px;
  color: #A2E3AD;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

const ChatButton = styled.button`
  padding: 0 16px;
  height:40px;
  background-color: #009733;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #0d8ae0;
  }
`;

const EditButton = styled.button`
  padding: 0px 16px;
  height:40px;
  background-color: #012007;
  color: #A2E3AD;
  border: none;
  border-radius: 20px;
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
  max-width: 600px;
`;

const NavigationButton = styled.button<{ direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${(props) => (props.direction === 'left' ? 'left: 10px;' : 'right: 10px;')}
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  color: #ffffff;
  cursor: pointer;
  z-index: 10;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }

  pointer-events: auto;
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
  scores: GolfScore[];
  favoriteGolfer: string;
  golfEquipment: string;
  backgroundPhotoUrlList: string[];
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
  const golfScoresRef = useRef<HTMLDivElement>(null);
  const [backgroundPhotos, setBackgroundPhotos] = useState<string[]>([]);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState<number>(0);

  const handleBackClick = () => {
    navigate("/");
  };

  const handleCameraClick = () => {
    navigate("/edit-background-photos");
  };

  const handleDotClick = (index: number) => {
    setCurrentBackgroundIndex(index);
  };

  const handleBackgroundPrev = () => {
    setCurrentBackgroundIndex(prevIndex =>
      prevIndex === 0 ? backgroundPhotos.length - 1 : prevIndex - 1
    );
  };

  const handleBackgroundNext = () => {
    setCurrentBackgroundIndex(prevIndex =>
      prevIndex === backgroundPhotos.length - 1 ? 0 : prevIndex + 1
    );
  };

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

  const handleScrollLeft = () => {
    if (golfScoresRef.current) {
      golfScoresRef.current.scrollBy({
        left: -100,
        behavior: 'smooth',
      });
    }
  };

  const handleScrollRight = () => {
    if (golfScoresRef.current) {
      golfScoresRef.current.scrollBy({
        left: 100,
        behavior: 'smooth',
      });
    }
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
        if (parsedGolfScores.length > 0) {
          const scoresValues = parsedGolfScores.map(score => score.score);
          const minScoreValue = Math.min(...scoresValues);
          const maxScoreValue = Math.max(...scoresValues);
          setMinScore(minScoreValue);
          setMaxScore(maxScoreValue);
        }

        // Initialize background photos from user data
        const fetchedBackgroundPhotos = userData.backgroundPhotoUrlList || [];
        setBackgroundPhotos(fetchedBackgroundPhotos);
        setCurrentBackgroundIndex(0);

        setProfile({
          displayName: userData.displayName,
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
            backgroundPhotoUrlList: fetchedBackgroundPhotos,
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
          likes: data.likes || [],
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
      <GlobalStyle />

      {/* Background Photo Section */}
      <BackgroundPhotoContainer bgUrl={backgroundPhotos[currentBackgroundIndex]}>
        {/* Back Button */}
        <BackButton onClick={handleBackClick} aria-label="Go Back">
          <img src="/icon_arrow_left_white.svg" />
        </BackButton>

        {/* Show Camera Icon only for current user */}
        {isCurrentUser && (
          <CameraButton onClick={handleCameraClick} aria-label="Edit Background Photos">
            <img src="/camera.png" alt="Edit Background Photos" />
          </CameraButton>
        )}

        {/* Navigation Buttons for sliding background photos */}
        {backgroundPhotos.length > 1 && (
          <>
            <BackgroundNavButton direction="left" onClick={handleBackgroundPrev} aria-label="Previous Background Photo">◀</BackgroundNavButton>
            <BackgroundNavButton direction="right" onClick={handleBackgroundNext} aria-label="Next Background Photo">▶</BackgroundNavButton>
          </>
        )}
      </BackgroundPhotoContainer>

      {/* Dots Container moved below the background photo and above the avatar */}
      {backgroundPhotos.length > 1 && (
        <DotsContainer>
          {backgroundPhotos.slice(0, 5).map((_, index) => (
            <BackgroundDot
              key={index}
              isActive={index === currentBackgroundIndex}
              onClick={() => handleDotClick(index)}
              aria-label={`Select background photo ${index + 1}`}
            />
          ))}
        </DotsContainer>
      )}

      {/* Profile Header */}
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
          <NameContainer>
            <Nickname>{profile?.displayName ?? ""}</Nickname>
            <Name>{profile?.golfInfo?.name ?? ""}</Name>
          </NameContainer>
        </AvatarNameContainer>
        {isCurrentUser ? (
          <EditButton onClick={handleEditProfileClick}>계정</EditButton>
        ) : (
          <ChatButton onClick={handleChatButtonClick}>메시지</ChatButton>
        )}
      </ProfileHeader>

      {/* Profile Description */}
      {profile?.golfInfo?.description && (
        <Description>{profile.golfInfo.description}</Description>
      )}

      {/* Chat Button for non-current users */}


      {/* Golf Scores Section */}
      {profile?.golfInfo?.scores && profile.golfInfo.scores.length > 0 && (
        <>

          <GolfScoresHeader>
            <GolfInfoTitle>스코어 기록</GolfInfoTitle>
            {isCurrentUser && (
              <EditButton onClick={handleAddScoreClick}>기록</EditButton>
            )}
          </GolfScoresHeader>
          <GolfScoresContainer>
            <NavigationButton direction="left" onClick={handleScrollLeft} aria-label="Scroll Left">
              ◀
            </NavigationButton>
            <NavigationButton direction="right" onClick={handleScrollRight} aria-label="Scroll Right">
              ▶
            </NavigationButton>
            <GolfScores ref={golfScoresRef}>
              {profile.golfInfo.scores
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((score, index) => {
                  const minS = minScore ?? score.score;
                  const maxS = maxScore ?? score.score;
                  const scoreRange = maxS - minS || 1;

                  const positionPercentage =
                    ((maxS - score.score) / scoreRange) * 100;

                  const formattedDate = new Date(score.date).toISOString().slice(2, 10);

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
          </GolfScoresContainer>
        </>
      )}

      {/* Golf Info Section */}
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

      {/* Tweets Section */}
      <Tweets>
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </Tweets>
    </Wrapper>
  );
}
