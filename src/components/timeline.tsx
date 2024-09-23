import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { ACTIVITY_FEEDS_AGGREGATE_DB_PATH, auth, db } from "../firebase";
import Tweet from "./tweet";
import { Unsubscribe } from "firebase/auth";

export interface ITweet {
  id: string;
  photo?: string;
  video?: string;
  aggregateFeedDocId?: string;
  userPhoto?: string;
  tweet: string;
  userId: string;
  username: string;
  createdAt: Timestamp; // Converted from Timestamp to Date
  canDelete: boolean;
  likesCount?: number;
  likes?: string[];
}

const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
  overflow-y: scroll;
`;

export default function Timeline() {
  const [tweets, setTweets] = useState<ITweet[]>([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;

    const fetchTweets = () => {
      const tweetsQuery = query(
        collection(db, ACTIVITY_FEEDS_AGGREGATE_DB_PATH),
        orderBy("createdAt", "desc"),
        limit(25)
      );

      unsubscribe = onSnapshot(
        tweetsQuery,
        (snapshot) => {
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
              canDelete: false,
              likesCount: data.likesCount || 0,
              dislikesCount: data.dislikesCount || 0,
              likes: data.likes || [],
            };
          });
          setTweets(fetchedTweets);
          console.log("snapshot", snapshot.docs);
        },
        (error) => {
          console.error("Error fetching tweets:", error);
        }
      );
    };

    fetchTweets();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  return (
    <Wrapper>
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} {...tweet} />
      ))}
    </Wrapper>
  );
}
