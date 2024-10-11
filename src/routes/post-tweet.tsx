import { styled } from "styled-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage, ACTIVITY_FEEDS_USER_DB_PATH, ACTIVITY_FEEDS_AGGREGATE_DB_PATH } from "../firebase";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import CircularProgress from '@mui/material/CircularProgress'; // 로딩 스피너 추가
import Button from "@mui/material/Button";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0px 80px 0px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0px 16px;
  max-width: 600px;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 50vh;
  padding: 10px;
  font-size: 18px;
  resize: none;
  border: none;
  border-radius: 10px;
  margin-bottom: 20px;
  caret-color: #018F05;
  &:focus {
    outline: none;
    border: none;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  position: fixed;
  bottom: 0px;
`;

const IslandButton = styled.label``;

const HiddenInput = styled.input`
  display: none;
`;

const SubmitButton = styled.button``;

export default function PostTweet() {
  const [tweetContent, setTweetContent] = useState<string>("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리
  const [isSuccess, setIsSuccess] = useState(false); // 성공 상태 관리
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

    setIsLoading(true); // 버튼 클릭 시 로딩 상태로 변경

    try {
      let photoURL: string | null = null;
      if (selectedPhoto) {
        const photoRefPath = `tweets/${user.uid}/${Date.now()}_${selectedPhoto.name}`;
        const photoRef = storageRef(storage, photoRefPath);
        await uploadBytes(photoRef, selectedPhoto);
        photoURL = await getDownloadURL(photoRef);
      }

      let videoURL: string | null = null;
      if (selectedVideo) {
        const videoRefPath = `tweets/${user.uid}/${Date.now()}_${selectedVideo.name}`;
        const videoRef = storageRef(storage, videoRefPath);
        await uploadBytes(videoRef, selectedVideo);
        videoURL = await getDownloadURL(videoRef);
      }

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

      await updateDoc(doc(db, ACTIVITY_FEEDS_USER_DB_PATH, user.uid, userTweetRef.id), {
        aggregateFeedDocId: aggregateTweetRef.id,
      });

      setIsSuccess(true); // 성공 시 상태 변경하여 체크 아이콘 표시

      // 체크 아이콘이 표시된 후 2초 후에 alert 표시
      setTimeout(() => {
        alert("Tweet posted successfully!");
        navigate(-1); // 확인 버튼 누르면 이전 페이지로 이동
      }, 500);

    } catch (error) {
      console.error("Error posting tweet:", error);
      alert("There was an error posting your tweet. Please try again.");
    } finally {
      setIsLoading(false); // 트윗이 완료되면 로딩 중단
    }
  };

  return (
    <Wrapper>
      <Form onSubmit={handleSubmit}>
        <header className="header_white">
          <Button
            type="button"
            variant="contained"
            onClick={handleGoBack}
            className="back_button black"
          >
          </Button>

          {isLoading ? (
            <CircularProgress sx={{ color: '#238F27' }} size={32} /> // 로딩 중일 때 스피너 표시
          ) : isSuccess ? (
            <img src="/icon_check_green.svg" width="40px" height="40px" /> // 성공 시 체크 아이콘 표시
          ) : (
            <SubmitButton type="submit" className="primary">올리기</SubmitButton> // 기본 상태에서는 "올리기" 버튼
          )}
        </header>

        {selectedPhoto && (
          <img
            src={URL.createObjectURL(selectedPhoto)}
            alt="Selected"
            style={{ width: "100%", borderRadius: "10px", marginBottom: "10px" }}
          />
        )}

        {selectedVideo && (
          <video
            controls
            style={{ width: "100%", borderRadius: "10px", marginBottom: "10px" }}
          >
            <source src={URL.createObjectURL(selectedVideo)} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        <TextArea
          placeholder="골프에 관한건 뭐든지 공유해주세요."
          value={tweetContent}
          onChange={(e) => setTweetContent(e.target.value)}
        />

        {!isLoading && (
          <ButtonsContainer>
            <IslandButton htmlFor="photo-upload">
              <img src="/icon_post_photo.svg" alt="Photo" />
              <HiddenInput
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </IslandButton>
            <IslandButton htmlFor="video-upload">
              <img src="/icon_post_video.svg" alt="Video" />
              <HiddenInput
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
              />
            </IslandButton>
          </ButtonsContainer>
        )}
      </Form>
    </Wrapper>
  );
}