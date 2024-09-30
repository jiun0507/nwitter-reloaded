// src/pages/BackgroundPhotoEdit.tsx

import { styled, createGlobalStyle } from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState, ChangeEvent, useRef } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

// Global Style for box-sizing
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }
`;

const EditWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: #ffffff;
  background-color: #0a2e14; /* Darker green */
  min-height: 100vh;
  width: 100%;
`;

const HeaderRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const BackButton = styled.button`
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  color: #A2E3AD;
`;

const AddPhotoButton = styled.label`
  background: none;
  border: none;
  color: #A2E3AD;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #FFFFFF;
  }
`;

// Hidden file input
const HiddenFileInput = styled.input`
  display: none;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 115px);
  gap: 15px;
  width: 100%;
  max-width: 600px;
  justify-content: center;

  @media (max-width: 500px) {
    grid-template-columns: repeat(2, 115px);
  }

  @media (max-width: 350px) {
    grid-template-columns: repeat(1, 115px);
  }
`;


const PhotoCard = styled.div`
  position: relative;
  width: 115px;
  height: 115px;
  background-color: #1a2d23;
  border-radius: 10px;
  overflow: hidden;
  
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
  background: rgba(217, 76, 76, 0.8); /* Semi-transparent red */
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
  
  &:hover {
    background: rgba(217, 76, 76, 1);
  }
`;


const Message = styled.p<{ type: 'success' | 'error' | 'info' }>`
  color: ${(props) =>
    props.type === 'success' ? '#4CAF50' :
    props.type === 'error' ? '#F44336' :
    '#2196F3'};
  font-size: 14px;
`;

const EditBackgroundPhotos: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const [backgroundPhotos, setBackgroundPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (!currentUser) {
      // Redirect to login if not authenticated
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
        const userData = userDoc.data() as any; // Replace with proper typing if available
        setBackgroundPhotos(userData.backgroundPhotoUrlList || []);
      }
    } catch (error) {
      console.error("Error fetching background photos:", error);
      setMessage({ text: "Failed to fetch background photos.", type: "error" });
    }
  };

  const handleBackClick = () => {
    navigate("/profile"); // Adjust the path if necessary
  };

  const handleAddPhotoClick = () => {
    // Trigger the hidden file input
    fileInputRef.current?.click();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Optionally, validate file type and size here
      uploadPhoto(file);
    }
  };

  const uploadPhoto = async (file: File) => {
    if (backgroundPhotos.length >= 5) {
      setMessage({ text: "You can only have a maximum of 5 background photos.", type: "error" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      // Create a unique file name
      const timestamp = Date.now();
      const fileName = `background_photos/${currentUser!.uid}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore
      const userDocRef = doc(db, "users", currentUser!.uid);
      const updatedPhotos = [...backgroundPhotos, downloadURL];
      await updateDoc(userDocRef, {
        backgroundPhotoUrlList: updatedPhotos,
      });

      // Update state
      setBackgroundPhotos(updatedPhotos);
      setMessage({ text: "Photo uploaded successfully!", type: "success" });
    } catch (error) {
      console.error("Error uploading photo:", error);
      setMessage({ text: "Failed to upload photo.", type: "error" });
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
      // Optionally, delete the file from Firebase Storage
      // Extract the storage path from the URL
      const storagePath = getStoragePathFromURL(photoUrl);
      if (storagePath) {
        const fileRef = ref(storage, storagePath);
        await deleteFile(fileRef);
      }

      // Update Firestore
      const userDocRef = doc(db, "users", currentUser!.uid);
      await updateDoc(userDocRef, {
        backgroundPhotoUrlList: updatedPhotos,
      });

      setMessage({ text: "Photo removed successfully!", type: "success" });
    } catch (error) {
      console.error("Error removing photo:", error);
      setMessage({ text: "Failed to remove photo.", type: "error" });
    }
  };

  // Utility function to extract storage path from download URL
  const getStoragePathFromURL = (url: string): string | null => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const storagePathStart = decodedUrl.indexOf('/o/') + 3;
      const storagePathEnd = decodedUrl.indexOf('?');
      const storagePath = decodedUrl.substring(storagePathStart, storagePathEnd);
      return storagePath;
    } catch (error) {
      console.error("Error extracting storage path from URL:", error);
      return null;
    }
  };

  // Utility function to delete a file from Firebase Storage
  const deleteFile = async (fileRef: any) => {
    try {
      await import("firebase/storage").then(({ deleteObject }) => {
        return deleteObject(fileRef);
      });
    } catch (error) {
      console.error("Error deleting file from storage:", error);
      // Optionally, handle the error (e.g., inform the user)
    }
  };

  return (
    <EditWrapper>
      <GlobalStyle />
      <HeaderRow>
        <BackButton onClick={handleBackClick} aria-label="Go Back">←</BackButton>
        <Title>스윙 갤러리</Title>
        <AddPhotoButton onClick={handleAddPhotoClick} aria-label="Add Photo">+</AddPhotoButton>
        <HiddenFileInput
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </HeaderRow>
      
      {message && <Message type={message.type}>{message.text}</Message>}
      
      <PhotoGrid>
        {backgroundPhotos.map((photoUrl, index) => (
          <PhotoCard key={index}>
            <PhotoImg src={photoUrl} alt={`Background ${index + 1}`} />
            <RemoveButton onClick={() => handleRemovePhoto(index)} aria-label={`Remove photo ${index + 1}`}>−</RemoveButton>
          </PhotoCard>
        ))}
      </PhotoGrid>

      {uploading && <Message type="info">Uploading photo...</Message>}
    </EditWrapper>
  );
};

export default EditBackgroundPhotos;
