import {
  collection,
  limit,
  orderBy,
  query,
  Timestamp,
  startAfter,
  getDocs,
  Query,
  DocumentData,
} from "firebase/firestore";
import { useEffect, useState, useCallback, useRef } from "react";
import { styled } from "styled-components";
import { ACTIVITY_FEEDS_AGGREGATE_DB_PATH, db } from "../firebase";
import Tweet from "./tweet";
import birdieLogo from '/public/birdie-logo.png';  // Make sure this path is correct

export interface ITweet {
  id: string;
  photo?: string;
  video?: string;
  aggregateFeedDocId?: string;
  userPhoto?: string;
  tweet: string;
  userId: string;
  username: string;
  createdAt: Timestamp;
  canDelete: boolean;
  likesCount?: number;
  likes?: string[];
}

const Wrapper = styled.div`
  display: flex;
  margin-bottom:80px;
  gap: 0px;
  flex-direction: column;
  overflow:hidden
`;

const LoadingMore = styled.div`
  text-align: center;
  padding: 10px;
`;

const NoTweets = styled.div`
  text-align: center;
  margin-top: 50px;
  color: black;
  p {
    margin-top: 20px;
    font-size: 18px;
  }
  img {
    width: 100px;
    height: auto;
  }
`;

export default function Timeline() {
  const [tweets, setTweets] = useState<ITweet[]>([]);
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const TWEETS_PER_PAGE = 5;
  const initialFetchDone = useRef(false); // Add this line

  const fetchTweets = useCallback(async (lastDoc: DocumentData | null = null) => {
    setLoading(true);
    let tweetsQuery: Query<DocumentData> = query(
      collection(db, ACTIVITY_FEEDS_AGGREGATE_DB_PATH),
      orderBy("createdAt", "desc"),
      limit(TWEETS_PER_PAGE)
    );

    if (lastDoc) {
      tweetsQuery = query(tweetsQuery, startAfter(lastDoc));
    }

    const snapshot = await getDocs(tweetsQuery);
    
    if (snapshot.empty) {
      setAllLoaded(true);
      setLoading(false);
      return;
    }

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
    setTweets((prevTweets) => {
      const existingIds = new Set(prevTweets.map((tweet) => tweet.id));
      const newTweets = fetchedTweets.filter((tweet) => !existingIds.has(tweet.id));
      return [...prevTweets, ...newTweets];
    });
    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    setLoading(false);
  }, []);

  useEffect(()=>{
    console.log(tweets.length)
  }, [tweets])

  useEffect(() => {
    const initialFetch = async () => {
      await fetchTweets();
      initialFetchDone.current = true; // Set to true after initial fetch
    };

    initialFetch();

    console.log("tweets called")
  }, [fetchTweets]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!initialFetchDone.current) return; // Skip if initial fetch isn't done

      const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        if (!loading && !allLoaded) {
          console.log("Handle scroll triggered");
          fetchTweets(lastVisible);
        }
      }
    },
    [fetchTweets, loading, allLoaded, lastVisible]
  );
  return (
    <Wrapper onScroll={handleScroll}>
      {tweets.length === 0 && !loading ? (
        <NoTweets>
          <img src={birdieLogo} alt="Birdie Logo" />
          <p>아직 버디에 포스트가 없습니다.</p> 
          <p> 첫번째로 포스트를 올려보세요</p>
        </NoTweets>
      ) : (
        tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))
      )}
      {loading && <LoadingMore>Loading more tweets...</LoadingMore>}
      {allLoaded && tweets.length > 0 && <LoadingMore>No more tweets to load</LoadingMore>}
    </Wrapper>
  );
}
