import { useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import styled from "styled-components";

// Styled Components

const Wrapper = styled.div`
  padding: 0; /* Keeps 20px padding on left and right */
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


const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0; 
  margin-top: 0;  
`;

const FormItem = styled.div`
  margin-top:16px;
  display: flex;
  position:relative;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  align-self: stretch;
`;

const StyledLabel = styled.label`
  position:absolute;
  left:24px;
  top:6px;
  font-size: 14px;
  text-align: left; 
  color: #2D2D2D; /* Label color */
`;

const StyledInput = styled.input`
  width: 100%;  
   
  padding: 32px 24px 10px 24px;
  border: none;

  font-size: 16px;
  outline: none;
  color: #A6A6A6;

  border-bottom: 1px solid #E8E8E8;

  &:focus {
    border-bottom: 1px solid #013F03;
  }

  &::placeholder {
    color: #aaa;
  }
`;

const SubmitButton = styled.button`
  background-color: black;
  color: white;
  padding: 12px 0;
  margin-top: 32px;
  width: calc(100vw - 48px);
  height: 56px;
  border: none;
  border-radius: 16px;
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
  margin-top: 32px; 
  text-align: center;
  font-size: 16px;

  a {
    color: #6C6C6C;
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
      <Form onSubmit={onSubmit}>
        <FormItem>
          <StyledLabel>이메일</StyledLabel>
          <StyledInput
            onChange={onChange}
            name="email"
            value={email}
            placeholder="메일주소를 입력하세요"
            type="email"
            required
          />
        </FormItem>

        <FormItem>
          <StyledLabel>비밀번호</StyledLabel>
          <StyledInput
            onChange={onChange}
            value={password}
            name="password"
            placeholder="비밀번호를 입력하세요"
            type="password"
            required
          />
        </FormItem>

        
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? "로딩중..." : "로그인"}
        </SubmitButton>
      </Form>
      {error !== "" && <Error>{error}</Error>}
      <Switcher>
        <Link to="/create-account">회원가입</Link>
      </Switcher>
    </Wrapper>
  );
}