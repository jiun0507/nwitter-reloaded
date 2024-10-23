import { styled, createGlobalStyle } from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState, ChangeEvent, useRef } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import '../style/style.css';

// Global Style for box-sizing
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }
`;

const EditWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 64px 0px 80px 0px ;
  background-color: #05330D; 
  color: #ffffff; 
  min-height: 100vh;
`;

const HeaderRow = styled.div`
  width: 100%;
  padding:0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  color: #ffffff;
`;



// Hidden file input
const HiddenFileInput = styled.input`
  display: none;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, calc(100% / 3 - 6px));
  gap: 8px;
  width: 100%;
  padding:16px;
  justify-content: start;
`;

const PhotoCard = styled.div`
  position: relative;
  background-color: none;
  border-radius: 10px;
  overflow: hidden;
  width: 100%;
  
  &:hover img {
    opacity: 0.8;
  }
`;

const PhotoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background:none;
  border: none;
  color: #ffffff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 16px;
  cursor: pointer;
  
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Message = styled.p<{ type: 'success' | 'error' | 'info'; visible: boolean }>`
  color: ${(props) =>
    props.type === 'success' ? '#ffffff' :
    props.type === 'error' ? '#ffffff' :
    '#ffffff'};
  font-size: 14px;

  display: flex;
  height: 48px;
  line-height: 48px;
  padding: 0px 24px;
  justify-content: center;
  align-items: center;
  bottom: 24px;
  background: #000000;
  border-radius: 16px;
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translate(-50%, -20px);
  white-space: nowrap;

  /* 애니메이션 추가 */
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 0.5s ease-in-out;
`;
const EditBackgroundPhotos: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const [backgroundPhotos, setBackgroundPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info', visible: boolean } | null>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchBackgroundPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchBackgroundPhotos = async () => {
    try {
      const userDocRef = doc(db, "users", currentUser!.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data() as any;
        setBackgroundPhotos(userData.backgroundPhotoUrlList || []);
      }
    } catch (error) {
      console.error("Error fetching background photos:", error);
      setMessageWithTimeout({ text: "Failed to fetch background photos.", type: "error" });
    }
  };

  const setMessageWithTimeout = (msg: { text: string, type: 'success' | 'error' | 'info' }) => {
    setMessage({ ...msg, visible: true });
    setTimeout(() => {
      setMessage((prev) => prev ? { ...prev, visible: false } : null);
      // 메시지가 사라진 후, 500ms 후에 완전히 제거
      setTimeout(() => {
        setMessage(null);
      }, 500); // 애니메이션 시간과 동일하게 설정
    }, 3000); // 3초 동안 표시
  };

  const handleBackClick = () => {
    navigate("/profile");
  };

  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadPhoto(file);
    }
  };

  const uploadPhoto = async (file: File) => {
    if (backgroundPhotos.length >= 6) {
      setMessageWithTimeout({ text: "You can upload up to 6 Photos.", type: "error" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const timestamp = Date.now();
      const fileName = `background_photos/${currentUser!.uid}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, file);

      const downloadURL = await getDownloadURL(storageRef);

      const userDocRef = doc(db, "users", currentUser!.uid);
      const updatedPhotos = [...backgroundPhotos, downloadURL];
      await updateDoc(userDocRef, {
        backgroundPhotoUrlList: updatedPhotos,
      });

      setBackgroundPhotos(updatedPhotos);
      setMessageWithTimeout({ text: "Photo uploaded successfully!", type: "success" });
    } catch (error) {
      console.error("Error uploading photo:", error);
      setMessageWithTimeout({ text: "Failed to upload photo.", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async (index: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this photo?");
    if (!confirmDelete) return;

    const photoUrl = backgroundPhotos[index];
    const updatedPhotos = backgroundPhotos.filter((_, idx) => idx !== index);
    setBackgroundPhotos(updatedPhotos);
    setMessage(null);

    try {
      const storagePath = getStoragePathFromURL(photoUrl);
      if (storagePath) {
        const fileRef = ref(storage, storagePath);
        await deleteFile(fileRef);
      }

      const userDocRef = doc(db, "users", currentUser!.uid);
      await updateDoc(userDocRef, {
        backgroundPhotoUrlList: updatedPhotos,
      });

      setMessageWithTimeout({ text: "Photo removed successfully!", type: "success" });
    } catch (error) {
      console.error("Error removing photo:", error);
      setMessageWithTimeout({ text: "Failed to remove photo.", type: "error" });
    }
  };

  const getStoragePathFromURL = (url: string): string | null => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const storagePathStart = decodedUrl.indexOf('/o/') + 3;
      const storagePathEnd = decodedUrl.indexOf('?');
      return decodedUrl.substring(storagePathStart, storagePathEnd);
    } catch (error) {
      console.error("Error extracting storage path from URL:", error);
      return null;
    }
  };

  const deleteFile = async (fileRef: any) => {
    try {
      await import("firebase/storage").then(({ deleteObject }) => {
        return deleteObject(fileRef);
      });
    } catch (error) {
      console.error("Error deleting file from storage:", error);
    }
  };

  return (
    <EditWrapper>
      <GlobalStyle />

      <header className='header_sub'>
        <Button
          type="button"
          variant="contained"
          onClick={handleBackClick}
          className="back_button"
        >
        </Button>
      </header>

      <HeaderRow>
        <Title>스윙 갤러리</Title>
        <Button className="add_button" onClick={handleAddPhotoClick} aria-label="Add Photo" />
        <HiddenFileInput
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </HeaderRow>

      <PhotoGrid>
        {backgroundPhotos.map((photoUrl, index) => (
          <PhotoCard key={index}>
            <PhotoImg src={photoUrl} alt={`Background ${index + 1}`} />
            <RemoveButton onClick={() => handleRemovePhoto(index)} aria-label={`Remove photo ${index + 1}`}>
              <img src="/icon_minus_lime_stroke.svg" />
            </RemoveButton>
          </PhotoCard>
        ))}
      </PhotoGrid>

      {uploading && (
        <Message type="info" visible={true}>
          <img src="/icon_flag_lime.svg" />&nbsp; Uploading photo...
        </Message>
      )}
      {message && <Message type={message.type} visible={message.visible}><img src="/icon_flag_lime.svg" />&nbsp;{message.text}</Message>}
    </EditWrapper>
  );
};

export default EditBackgroundPhotos;