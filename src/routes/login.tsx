import { useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import styled from "styled-components";

// Styled Components

const Wrapper = styled.div`
  padding: 10px 20px; /* Keeps 20px padding on left and right */
  width: 100%;  /* Adjust as needed */
  min-height: 100vh;
  justify-content: center;
`;

const PhotoContainer = styled.div`
  text-align: center; /* Centers content horizontally */
  margin-bottom: 20px; /* Space between photo and form */
`;

const Photo = styled.img`
  margin: 0 auto; /* Center the image horizontally */
  margin-top: 50px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 15px; /* Reduced from 30px to 15px */
  text-align: center;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 10px; /* Keeps 10px padding on left and right */
  margin-top: 0;    /* Removed any top margin if present */
`;

const StyledLabel = styled.label`
  width: 100%;
  font-size: 14px;
  margin-bottom: 0px; /* Spacing between label and input */
  text-align: left; /* Align the label to the left */
  color: #2D2D2D; /* Label color */
`;

const StyledInput = styled.input`
  width: 100%;          /* Takes full width of the Form */
  padding: 10px 0;
  margin: 10px 0;       /* Adjusted margin for closer spacing */
  border: none;
  border-bottom: 2px solid #ccc;
  font-size: 16px;
  outline: none;
  color: #A6A6A6;

  &:focus {
    border-bottom: 2px solid #555;
  }

  &::placeholder {
    color: #aaa;
  }
`;

const SubmitButton = styled.button`
  background-color: black;
  color: white;
  padding: 12px 0;
  margin: 10px 0;
  width: 100%;          /* Takes full width of the Form */
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  transition: background-color 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #333;
  }
`;

const Error = styled.div`
  color: red;
  margin-top: 10px;
  text-align: center;
`;

const Switcher = styled.div`
  margin-top: 20px; /* Reduced from 40px to 20px */
  text-align: center;
  font-size: 16px;

  a {
    color: #007BFF;
    text-decoration: none;
    margin-left: 5px;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default function CreateAccount() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (isLoading || email === "" || password === "") return;
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (e) {
      if (e instanceof FirebaseError) {
        setError(e.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <PhotoContainer>
        <Photo src="/birdie-logo.png" alt="BIRDIE Logo" />
      </PhotoContainer>
      <Title>BIRDIE</Title>
      <Form onSubmit={onSubmit}>
        <StyledLabel>이메일</StyledLabel>
        <StyledInput
          onChange={onChange}
          name="email"
          value={email}
          placeholder="메일주소를 입력하세요"
          type="email"
          required
        />
        <StyledLabel>비밀번호</StyledLabel>
        <StyledInput
          onChange={onChange}
          value={password}
          name="password"
          placeholder="비밀번호를 입력하세요"
          type="password"
          required
        />
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? "로딩중..." : "로그인"}
        </SubmitButton>
      </Form>
      {error !== "" && <Error>{error}</Error>}
      <Switcher>
        Don't have an account?
        <Link to="/create-account">회원가입 &rarr;</Link>
      </Switcher>
    </Wrapper>
  );
}
