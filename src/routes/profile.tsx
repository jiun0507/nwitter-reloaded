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
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;

const AvatarUpload = styled.label`
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 50px;
  }
`;

const AvatarImg = styled.img`
  width: 100%;
`;

const AvatarInput = styled.input`
  display: none;
`;

const Name = styled.span`
  font-size: 22px;
`;

const Tweets = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
`;

const GolfInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 500px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
`;

const GolfInfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const GolfScores = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ChatButton = styled.button`
  padding: 10px 20px;
  background-color: #1d9bf0;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  &:hover {
    background-color: #0d8ae0;
  }
`;

const EditButton = styled.button`
  padding: 10px 20px;
  background-color: #4CAF50; /* Green color */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  &:hover {
    background-color: #45a049;
  }
`;

interface GolfScore {
  date: string;
  score: number;
}

interface UserGolfInfo {
  name: string;
  email: string;
  downToPlayGolf: boolean | null;
  bestScore: number | null;
  averageScore: number | null;
  description: string;
  numberOfEagles: number | null;
  holeInOneExperience: boolean | null;
  recentGolfScores: GolfScore[];
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
  const navigate = useNavigate();

  const handleChatButtonClick = async () => {
    if (!currentUser || !currentProfileUserId) return;

    // Generate a unique channel ID for the conversation between the two users
    const members = [currentUser.uid, currentProfileUserId].sort();
    const channelId = `chat_${members.join('_')}`;

    // Navigate to the chat room page with the channel ID
    navigate(`/chatrooms/${channelId}`);
  };

  const handleEditProfileClick = () => {
    navigate('/edit-profile'); // Ensure this route exists
  };

  useEffect(() => {
    console.log("userId", userId, "currentUser", currentUser);
    if (userId) {
      setCurrentProfileUserId(userId);
    } else if (currentUser) {
      setCurrentProfileUserId(currentUser.uid);
    }
  }, [userId, currentUser]);

  useEffect(() => {
    if (currentProfileUserId) {
      // Compute isCurrentUser locally
      const userIsCurrent = currentUser?.uid === currentProfileUserId;
      setIsCurrentUser(userIsCurrent);
      console.log("isCurrentUser", currentUser?.uid, currentProfileUserId, userIsCurrent);
      
      fetchProfile();
      fetchTweets(userIsCurrent); // Pass the computed value
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
        // Update Firestore 'users' document
        await updateDoc(doc(db, "users", currentUser.uid), {
          photoURL: avatarUrl,
        });
        setProfile(prev => prev ? { ...prev, photoURL: avatarUrl } : null);
      } catch (error) {
        console.error("Error updating avatar:", error);
        // Optionally, handle the error (e.g., show a notification)
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
        console.log("This is userData", userData);
        setProfile({
          displayName: userData.name,
          photoURL: userData?.photoURL || null,
          golfInfo: {
            name: userData.name,
            email: userData.email,
            downToPlayGolf: userData.downToPlayGolf,
            bestScore: userData.bestScore,
            averageScore: userData.averageScore,
            description: userData.description,
            numberOfEagles: userData.numberOfEagles,
            holeInOneExperience: userData.holeInOneExperience,
            recentGolfScores: userData.recentGolfScores,
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
      </AvatarUpload>
      {isCurrentUser && (
        <AvatarInput
          onChange={onAvatarChange}
          id="avatar"
          type="file"
          accept="image/*"
        />
      )}
      <Name>{profile?.displayName ?? "Anonymous"}</Name>
      {!isCurrentUser && (
        <ChatButton onClick={handleChatButtonClick}>
          Start Chat
        </ChatButton>
      )}
      {isCurrentUser && (
        <EditButton onClick={handleEditProfileClick}>
          Edit Profile
        </EditButton>
      )}
      {profile?.golfInfo && (
        <GolfInfo>
          <GolfInfoItem>
            <span>Down to play golf:</span>
            <span>{profile?.golfInfo.downToPlayGolf ? "Yes" : "No"}</span>
          </GolfInfoItem>
          <GolfInfoItem>
            <span>Best score:</span>
            <span>{profile?.golfInfo.bestScore || "N/A"}</span>
          </GolfInfoItem>
          <GolfInfoItem>
            <span>Average score:</span>
            <span>{profile?.golfInfo.averageScore || "N/A"}</span>
          </GolfInfoItem>
          <GolfInfoItem>
            <span>Description:</span>
            <span>{profile?.golfInfo.description || "N/A"}</span>
          </GolfInfoItem>
          <GolfInfoItem>
            <span>Number of eagles:</span>
            <span>{profile?.golfInfo.numberOfEagles || "N/A"}</span>
          </GolfInfoItem>
          <GolfInfoItem>
            <span>Hole in one experience:</span>
            <span>{profile?.golfInfo.holeInOneExperience ? "Yes" : "No"}</span>
          </GolfInfoItem>
          <GolfInfoItem>
            <span>Favorite golfer:</span>
            <span>{profile?.golfInfo.favoriteGolfer || "N/A"}</span>
          </GolfInfoItem>
          <GolfInfoItem>
            <span>Golf equipment:</span>
            <span>{profile?.golfInfo.golfEquipment || "N/A"}</span>
          </GolfInfoItem>
          <GolfScores>
            <h4>Recent Golf Scores:</h4>
            {profile?.golfInfo.recentGolfScores.map((score, index) => (
              <GolfInfoItem key={index}>
                <span>{new Date(score.date).toLocaleDateString()}</span>
                <span>{score.score}</span>
              </GolfInfoItem>
            ))}
          </GolfScores>
        </GolfInfo>
      )}
      
      <Tweets>
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </Tweets>
    </Wrapper>
  );
}
