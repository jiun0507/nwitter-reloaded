// src/pages/PostTweet.tsx

import { styled } from "styled-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage, ACTIVITY_FEEDS_USER_DB_PATH, ACTIVITY_FEEDS_AGGREGATE_DB_PATH } from "../firebase";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import Button from "@mui/material/Button";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  padding:8px 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding:0px 16px;
  max-width: 600px;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 10px;
  font-size: 18px;
  resize: none;
  border: none;
  border-radius: 10px;
  margin-bottom: 20px;
  caret-color: #018F05; 
  &:focus {
    outline: none;
    border: none; /* Focus 상태에서도 보더 없애기 */
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const IslandButton = styled.label`

`;

const HiddenInput = styled.input`
  display: none;
`;

const SubmitButton = styled.button`

`;


export default function PostTweet() {
  const [tweetContent, setTweetContent] = useState<string>("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const navigate = useNavigate();
  const user = auth.currentUser;
  const handleGoBack = () => {
    navigate(-1); // 한 단계 뒤로 가기
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedPhoto(e.target.files[0]);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedVideo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to post a tweet.");
      return;
    }
    if (tweetContent.trim() === "" && !selectedPhoto && !selectedVideo) {
      alert("Please enter some content or attach media.");
      return;
    }

    try {
      // Upload photo if selected
      let photoURL: string | null = null;
      if (selectedPhoto) {
        const photoRefPath = `tweets/${user.uid}/${Date.now()}_${selectedPhoto.name}`;
        const photoRef = storageRef(storage, photoRefPath);
        await uploadBytes(photoRef, selectedPhoto);
        photoURL = await getDownloadURL(photoRef);
      }

      // Upload video if selected
      let videoURL: string | null = null;
      if (selectedVideo) {
        const videoRefPath = `tweets/${user.uid}/${Date.now()}_${selectedVideo.name}`;
        const videoRef = storageRef(storage, videoRefPath);
        await uploadBytes(videoRef, selectedVideo);
        videoURL = await getDownloadURL(videoRef);
      }

      // Create tweet document in aggregate feed
      const aggregateTweetRef = await addDoc(collection(db, ACTIVITY_FEEDS_AGGREGATE_DB_PATH), {
        tweet: tweetContent,
        userId: user.uid,
        userPhoto: user.photoURL || null,
        username: user.displayName || "Anonymous",
        createdAt: serverTimestamp(),
        likesCount: 0,
        dislikesCount: 0,
        likes: [],
        photo: photoURL,
        video: videoURL,
      });

      console.log("This is aggregated tweet ref id", aggregateTweetRef.id);

      // Create tweet document in user-specific feed
      const userTweetRef = await addDoc(collection(db, `${ACTIVITY_FEEDS_USER_DB_PATH}/${user.uid}`), {
        tweet: tweetContent,
        userId: user.uid,
        userPhoto: user.photoURL || null,
        username: user.displayName || "Anonymous",
        createdAt: serverTimestamp(),
        likesCount: 0,
        dislikesCount: 0,
        likes: [],
        photo: photoURL,
        video: videoURL,
        aggregateFeedDocId: aggregateTweetRef.id,
      });

      // After creating both user-specific and aggregate feed documents
      await updateDoc(doc(db, ACTIVITY_FEEDS_USER_DB_PATH, user.uid, userTweetRef.id), {
        aggregateFeedDocId: aggregateTweetRef.id,
      });

      alert("Tweet posted successfully!");
      navigate("/"); // Navigate back to timeline
    } catch (error) {
      console.error("Error posting tweet:", error);
      alert("There was an error posting your tweet. Please try again.");
    }
  };

  return (
    <Wrapper>
      
      <Form onSubmit={handleSubmit}>
        <Header>
          <img src="/icon_arrow_left.svg" alt="Post" onClick={handleGoBack} />
          <SubmitButton type="submit" className="primary">올리기</SubmitButton>
        </Header>
        <TextArea
          placeholder="골프에 관한건 뭐든지 공유해주세요."
          value={tweetContent}
          onChange={(e) => setTweetContent(e.target.value)}
        />

        {/* Optional: Display selected media previews */}
        {selectedPhoto && (
          <img
            src={URL.createObjectURL(selectedPhoto)}
            alt="Selected"
            style={{ width: "100px", height: "100px", borderRadius: "10px", marginBottom: "10px" }}
          />
        )}

        {selectedVideo && (
          <video
            width="200"
            height="150"
            controls
            style={{ borderRadius: "10px", marginBottom: "10px" }}
          >
            <source src={URL.createObjectURL(selectedVideo)} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        <ButtonsContainer>
          <IslandButton htmlFor="photo-upload">
            <img src="/icon_post_photo.svg" alt="Photo"/>
            <HiddenInput
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </IslandButton>
          <IslandButton htmlFor="video-upload">
          <img src="/icon_post_video.svg" alt="Video"/>
            <HiddenInput
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
            />
          </IslandButton>
        </ButtonsContainer>
        
      </Form>
    </Wrapper>
  );
}
