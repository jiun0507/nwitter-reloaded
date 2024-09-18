// src/pages/EditProfile.tsx

import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 300px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 10px;
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

export default function EditProfile() {
  const currentUser = auth.currentUser;
  const [displayName, setDisplayName] = useState<string>("");
  const [description, setDescription] = useState<string>(""); // Example additional field
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setDisplayName(userData.displayName || "");
          setDescription(userData.description || "");
          setPhotoURL(userData.photoURL || null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName,
        photoURL: photoURL || undefined,
      });

      // Update Firestore 'users' document
      await updateDoc(doc(db, "users", currentUser.uid), {
        displayName,
        description,
        photoURL,
      });

      alert("Profile updated successfully!");
      navigate(`/profile/${currentUser.uid}`);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1 && currentUser) {
      const file = files[0];
      const photoRef = ref(storage, `avatars/${currentUser.uid}`);
      try {
        const snapshot = await uploadBytes(photoRef, file);
        const uploadedPhotoURL = await getDownloadURL(snapshot.ref);
        setPhotoURL(uploadedPhotoURL);
      } catch (error) {
        console.error("Error uploading photo:", error);
        alert("Failed to upload photo. Please try again.");
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Wrapper>
      <h2>Edit Profile</h2>
      <Form onSubmit={handleSubmit}>
        <label htmlFor="displayName">Display Name:</label>
        <Input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />

        <label htmlFor="description">Description:</label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label htmlFor="photo">Profile Photo:</label>
        <Input
          id="photo"
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
        />
        {photoURL && <img src={photoURL} alt="Profile Preview" width={80} height={80} />}

        <Button type="submit">Save Changes</Button>
      </Form>
    </Wrapper>
  );
}
