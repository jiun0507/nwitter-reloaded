// src/components/tweet.tsx

import styled from "styled-components";
import { ITweet } from "./timeline"; // Ensure ITweet is correctly imported
import {
  ACTIVITY_FEEDS_AGGREGATE_DB_PATH,
  ACTIVITY_FEEDS_USER_DB_PATH,
  auth,
  db,
  storage,
} from "../firebase";
import {
  deleteDoc,
  doc,
  updateDoc,
  increment,
  collection,
  addDoc,
  Timestamp,
  onSnapshot,
  query,
  orderBy,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { deleteObject, ref as storageRef } from "firebase/storage";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import '../style/style.css';

// Define Styled Components

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-bottom: 1px solid #F2F2F2;
  background-color: #ffffff; 
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Photo = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer; /* Indicates clickability */
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05); /* Slight zoom effect on hover */
  }
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: #28a745; /* Changed to green */
`;

const Payload = styled.p`
  margin:0;
  font-size: 16px; /* Increased font size */
  word-wrap: break-word;
  color: #333333; /* Dark gray for better readability */
`;

const Media = styled.div`
  margin: 10px 0px;
  img,
  video {
    width: 100%;
    max-width: 500px;
    border-radius: 15px;
    object-fit: cover;
  }
`;

const DeleteButton = styled.button`
  color: #FF5656;
  display: flex;
  align-items: center;
  gap: 5px; /* Space between icon and text */
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    // text-decoration: underline;
  }

  /* Remove default button styles */
  padding: 0;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
  /* Align actions to the left */
  justify-content: flex-start;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px; /* Space between icon and text */
  background-color: transparent;
  border: none;
  color: #28a745; /* Green text */
  cursor: pointer;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }

  /* Remove default button styles */
  padding: 0;
`;

const LikeButton = styled(ActionButton)<{ liked: boolean }>`
  color: ${({ liked }) => (liked ? "#1d9bf0" : "#28a745")}; /* Blue if liked, green if not */
  font-weight: ${({ liked }) => (liked ? "bold" : "normal")};
`;

const CommentButton = styled(ActionButton)`
  /* Additional styles if needed */
`;

// Optional: Styled Components for Icons to avoid inline styles
const Icon = styled.img`
  width: 16px; /* Adjust as needed */
  height: 16px; /* Adjust as needed */
`;

const LikeIcon = styled(Icon)`
  /* Additional styles for Like icon if needed */
  width:26px;
  height:26px;
`;

const CommentIcon = styled(Icon)`
  /* Additional styles for Comment icon if needed */
  width:26px;
  height:26px;
`;

// Correctly Typed Styled Component
const CommentsSection = styled.div<{ visible: string }>`
  margin-top: 15px;
  display: ${({ visible }) => (visible === "true" ? "block" : "none")};
`;

const CommentList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
`;

const Comment = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
  background-color: #f9f9f9; /* Light gray background for readability */
  padding: 10px;
  border-radius: 10px;
`;

const CommentPhoto = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
`;

const CommentContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const CommentUsername = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: #1d9bf0; /* Blue or your preferred color */
`;

const CommentText = styled.p`
  margin: 5px 0;
  font-size: 14px;
  word-wrap: break-word;
  color: #333333; /* Dark gray for readability */
`;

const CommentTimestamp = styled.small`
  color: #666666; /* Darker gray for timestamp */
  font-size: 12px;
`;

const CommentInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const CommentInput = styled.textarea`
  width: 100%;
  padding: 8px;
  border-radius: 10px;
  border: 1px solid #ccc;
  resize: vertical;
  color: #333333; /* Ensure text inside textarea is visible */
`;

const SubmitButton = styled.button`
  align-self: flex-end;
  padding: 5px 10px;
  background-color: #1d9bf0;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:disabled {
    background-color: #a0cfff;
    cursor: not-allowed;
  }
`;

export interface IComment {
  id: string;
  userId: string;
  username: string;
  profilePhotoURL?: string;
  content: string;
  timestamp: Timestamp; // or Date
}

export default function Tweet({
  username,
  photo,
  video,
  tweet,
  userId,
  id,
  canDelete,
  userPhoto,
  aggregateFeedDocId,
  likesCount = 0,
  likes = [],
}: ITweet) {
  const user = auth.currentUser;
  const [currentLikes, setCurrentLikes] = useState<number>(likesCount);
  const [commentText, setCommentText] = useState<string>("");
  const [likesArray, setLikesArray] = useState<string[]>(likes);
  const [tweetComments, setTweetComments] = useState<IComment[]>([]);
  const [commentsVisible, setCommentsVisible] = useState<string>("false");

  useEffect(() => {
    // Set up real-time listener for comments
    const commentsCollectionRef = collection(
      db,
      `${ACTIVITY_FEEDS_USER_DB_PATH}/${userId}`,
      id,
      "comments"
    );
    const commentsQueryObj = query(commentsCollectionRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(
      commentsQueryObj,
      (snapshot) => {
        const fetchedComments: IComment[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            username: data.username,
            profilePhotoURL: data.profilePhotoURL || "",
            content: data.content,
            timestamp: data.timestamp,
          };
        });
        setTweetComments(fetchedComments);
      },
      (error) => {
        console.error("Error fetching comments:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId, id]);

  const onDelete = async () => {
    const ok = confirm("Are you sure you want to delete this tweet?");
    if (!ok || user?.uid !== userId) return;
    try {
      // Delete from user-specific feed
      await deleteDoc(doc(db, `${ACTIVITY_FEEDS_USER_DB_PATH}/${user.uid}`, id));
      // Delete from aggregate feed
      if (aggregateFeedDocId) {
        await deleteDoc(doc(db, ACTIVITY_FEEDS_AGGREGATE_DB_PATH, aggregateFeedDocId));
      }
      // Delete associated media
      if (photo) {
        const photoRef = storageRef(storage, `${ACTIVITY_FEEDS_USER_DB_PATH}/${user.uid}/${id}/photo`);
        await deleteObject(photoRef);
      }
      if (video) {
        const videoRef = storageRef(storage, `${ACTIVITY_FEEDS_USER_DB_PATH}/${user.uid}/${id}/video`);
        await deleteObject(videoRef);
      }
    } catch (e) {
      console.error("Error deleting tweet:", e);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      const tweetDocRef = doc(db, ACTIVITY_FEEDS_AGGREGATE_DB_PATH, id);

      if (likesArray.includes(user.uid)) {
        // User has already liked the tweet, so unlike it
        await updateDoc(tweetDocRef, {
          likesCount: increment(-1),
          likes: arrayRemove(user.uid),
        });
        setCurrentLikes((prev) => prev - 1);
        setLikesArray((prev) => prev.filter((uid) => uid !== user.uid));
      } else {
        // User has not liked the tweet yet
        await updateDoc(tweetDocRef, {
          likesCount: increment(1),
          likes: arrayUnion(user.uid),
        });
        setCurrentLikes((prev) => prev + 1);
        setLikesArray((prev) => [...prev, user.uid]);
      }
    } catch (error) {
      console.error("Error liking/unliking tweet:", error);
    }
  };

  const handleAddComment = async () => {
    if (!user || commentText.trim() === "") return;
    try {
      const commentsCollectionRef = collection(
        db,
        `${ACTIVITY_FEEDS_USER_DB_PATH}/${userId}`,
        id,
        "comments"
      );
      const newComment = {
        userId: user.uid,
        username: user.displayName || "Anonymous",
        profilePhotoURL: user.photoURL || "/default-profile.svg", // Ensure default avatar exists
        content: commentText.trim(),
        timestamp: Timestamp.now(),
      };
      await addDoc(commentsCollectionRef, newComment);
      setCommentText("");
      // Automatically show comments after adding
      setCommentsVisible("true");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const toggleComments = () => {
    if (commentsVisible === "true") {
      setCommentsVisible("false");
    } else {
      setCommentsVisible("true");
    }
  };

  return (
    <Wrapper>
      <Header>
        <Link to={`/profile/${userId}`}>
          {userPhoto ? (
            <Photo src={userPhoto} alt={`${username}'s profile`} />
          ) : (
            <Photo src="/default_profile.svg" alt="Default profile" /> // Corrected path
          )}
        </Link>
        <Username>{username}</Username>
      </Header>
      <Payload>{tweet}</Payload>
      <Media>
        {photo && <img src={photo} alt="Tweet media" />}
        {video && (
          <video controls>
            <source src={video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </Media>
      {user?.uid === userId && canDelete && (
        <DeleteButton  onClick={onDelete}>
          <LikeIcon src="/icon_trash_red.svg" alt="Like" />
          Delete
          </DeleteButton>
      )}
      {canDelete ? (<></>) : (
        <>
        <Actions>
          <LikeButton
            onClick={handleLike}
            aria-label="Like"
            liked={likesArray.includes(user?.uid || "")}
          >
            <LikeIcon src="/icon_trophy_deepgreen.svg" alt="Like" />
            {currentLikes}
          </LikeButton>
        <CommentButton onClick={toggleComments} aria-label="Comments">
          <CommentIcon src="/icon_comment_deepgreen.svg" alt="Comment"/>
          {tweetComments.length}
        </CommentButton>
      </Actions>
        </>)}
      <CommentsSection visible={commentsVisible}>
        <CommentList>
          {tweetComments.map((comment) => (
            <Comment key={comment.id}>
              <CommentPhoto
                src={comment.profilePhotoURL || "/default-profile.png"} // Ensure this image exists
                alt={`${comment.username}'s avatar`}
              />
              <CommentContent>
                <CommentHeader>
                  <CommentUsername>{comment.username}</CommentUsername>
                  <CommentTimestamp>
                    {comment.timestamp.toDate().toLocaleString()}
                  </CommentTimestamp>
                </CommentHeader>
                <CommentText>{comment.content}</CommentText>
              </CommentContent>
            </Comment>
          ))}
        </CommentList>
        {user && (
          <CommentInputContainer>
            <CommentInput
              rows={2}
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <SubmitButton
              onClick={handleAddComment}
              disabled={commentText.trim() === ""}
            >
              Submit
            </SubmitButton>
          </CommentInputContainer>
        )}
      </CommentsSection>
    </Wrapper>
  );
}
