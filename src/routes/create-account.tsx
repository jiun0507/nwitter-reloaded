import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { doc, setDoc } from "firebase/firestore";
import Button from "@mui/material/Button";
import styled from 'styled-components';


const Wrapper = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 0;
`;

const Form = styled.form`
  margin-top: 32px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding:20px 16px 16px 16px;
`;

const Title = styled.h1`
  color: black;
  font-size: 24px;
  weight: 500;
`;

const InputLabel = styled.label`
  position:absolute;
  left:24px;
  top:6px;
  font-size: 14px;
  text-align: left; 
  color: #2D2D2D; 
`;

const InputField = styled.input`
  width: 100%;  
  padding: 32px 24px 10px 24px;
  border: none;
  border-radius: 0;
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

}
`;


const Separator = styled.hr`
  border: none;
  border-bottom: 1px solid #e0e0e0;
`;

const Error = styled.div`
  color: red;
  margin-top: 16px;
`;

const Switcher = styled.div`
  margin-top: 16px;
  text-align: center;
`;

const FormField = styled.div`
  margin-top:16px;
  display: flex;
  position:relative;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  align-self: stretch;
`;

const FinalPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px;
`;

const Logo = styled.img`
  width: 150px;
  margin-bottom: 16px;
  margin-top: 200px;
`;

const WelcomeText = styled.h2`
  font-size: 20px;
  color: #013F03;
  margin-bottom: 16px;
  weight: 600;
`;

const SubtitleText = styled.p`
  font-size: 16px;
  color: #013F03;
  line-height: 25.6px;
`;

export default function CreateAccount() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // First page state variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVerification, setPasswordVerification] = useState("");
  const [nickname, setNickname] = useState("");
  const [name, setName] = useState("");

  // Second page state variables (optional fields)
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [driverDistance, setDriverDistance] = useState<number | null>(null);
  const [yearsOfExperience, setYearsOfExperience] = useState<number | null>(null);
  const [favoriteGolfer, setFavoriteGolfer] = useState("");
  const [numberOfEagles, setNumberOfEagles] = useState<number | null>(null);
  const [holeInOneExperience, setHoleInOneExperience] = useState<boolean | null>(null);

  const [error, setError] = useState("");

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    switch (name) {
      // First page fields
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "passwordVerification":
        setPasswordVerification(value);
        break;
      case "nickname":
        setNickname(value);
        break;
      case "name":
        setName(value);
        break;

      // Second page fields
      case "bestScore":
        setBestScore(value ? parseInt(value) : null);
        break;
      case "averageScore":
        setAverageScore(value ? parseInt(value) : null);
        break;
      case "driverDistance":
        setDriverDistance(value ? parseInt(value) : null);
        break;
      case "yearsOfExperience":
        setYearsOfExperience(value ? parseInt(value) : null);
        break;
      case "favoriteGolfer":
        setFavoriteGolfer(value);
        break;
      case "numberOfEagles":
        setNumberOfEagles(value ? parseInt(value) : null);
        break;
      case "holeInOneExperience":
        setHoleInOneExperience(value === "true");
        break;
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Prevent multiple submissions
    if (isLoading) return;

    if (step === 1) {
      // Validate first page inputs
      if (
        email === "" ||
        password === "" ||
        passwordVerification === "" ||
        nickname === "" ||
        name === ""
      ) {
        setError("모든 필드를 입력해 주세요."); // Please fill out all fields.
        return;
      }

      if (password !== passwordVerification) {
        setError("비밀번호가 일치하지 않습니다."); // Passwords do not match.
        return;
      }

      // Proceed to next step
      setStep(2);
    } else if (step === 2) {
      // Create account with all collected data
      try {
        setLoading(true);
        const credentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(credentials.user, {
          displayName: nickname,
        });
        // Store user data in Firestore
        await setDoc(doc(db, "users", credentials.user.uid), {
          displayName: nickname,
          name,
          email,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          bestScore,
          averageScore,
          driverDistance,
          yearsOfExperience,
          favoriteGolfer,
          numberOfEagles,
          holeInOneExperience,
        });
        setStep(3); // Move to the final step
      } catch (e) {
        if (e instanceof FirebaseError) {
          setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStart = () => {
    navigate("/");
  };

  return (
    <Wrapper>
      {step === 3 ? (
        // Final step view
        <FinalPageWrapper>
          <Logo src="/public/birdie-logo.png" alt="Birdie Logo" />
          <WelcomeText>WELCOME TO BIRDIE</WelcomeText>
          <SubtitleText>
            이제부터 골프 관련 소식, 친구들과의 소통, 다양한 커뮤니티 활동을 즐기실 수 있습니다.
          </SubtitleText>
          <Button
            type="button"
            variant="contained"
            onClick={handleStart}
            className="primary"
            style={{
              width:'100%',
            }}
          >
            시작하기
          </Button>
        </FinalPageWrapper>
      ) : (
        <Form onSubmit={onSubmit}>
          <Header>
            <Title>{step === 1 ? "회원가입" : "골퍼 정보"}</Title>
            {step === 1 ? (
              <Button
                type="submit"
                variant="contained"
                className="primary"
              >
                다음
              </Button>
            ) : (

              <Button
                type="submit"
                variant="contained"
                className="primary"
                disabled={isLoading}
              >
                {isLoading ? "로딩 중..." : "다음"}
              </Button>
            )}
          </Header>

          {step === 1 && (
            <>
              <FormField>
                <InputLabel>이메일</InputLabel>
                <InputField
                  onChange={onChange}
                  name="email"
                  value={email}
                  placeholder="메일 주소를 입력하세요"
                  type="email"
                  required
                />
              </FormField>

              <FormField>
                <InputLabel>비밀번호</InputLabel>
                <InputField
                  onChange={onChange}
                  name="password"
                  value={password}
                  placeholder="비밀번호를 입력하세요"
                  type="password"
                  required
                />
              </FormField>

              <FormField>
                <InputLabel>비밀번호 확인</InputLabel>
                <InputField
                  onChange={onChange}
                  name="passwordVerification"
                  value={passwordVerification}
                  placeholder="비밀번호를 한번 더 입력하세요"
                  type="password"
                  required
                />
              </FormField>

              <FormField>
                <InputLabel>닉네임</InputLabel>
                <InputField
                  onChange={onChange}
                  name="nickname"
                  value={nickname}
                  placeholder="닉네임을 입력하세요"
                  type="text"
                  required
                />
              </FormField>

              <FormField>
                <InputLabel>이름</InputLabel>
                <InputField
                  onChange={onChange}
                  name="name"
                  value={name}
                  placeholder="이름을 입력하세요"
                  type="text"
                  required
                />
              </FormField>
            </>
          )}

          {step === 2 && (
            <>
              <FormField>
                <InputLabel>베스트 스코어</InputLabel>
                <InputField
                  onChange={onChange}
                  name="bestScore"
                  value={bestScore?.toString() || ""}
                  placeholder="베스트 스코어 입력"
                  type="number"
                />
              </FormField>

              <FormField>
                <InputLabel>평균 스코어</InputLabel>
                <InputField
                  onChange={onChange}
                  name="averageScore"
                  value={averageScore?.toString() || ""}
                  placeholder="평균 스코어를 입력하세요"
                  type="number"
                />
              </FormField>

              <FormField>
                <InputLabel>드라이버 비거리 (미터)</InputLabel>
                <InputField
                  onChange={onChange}
                  name="driverDistance"
                  value={driverDistance?.toString() || ""}
                  placeholder="드라이버 비거리를 입력하세요"
                  type="number"
                />
              </FormField>

              <FormField>
                <InputLabel>골프 경력 (년)</InputLabel>
                <InputField
                  onChange={onChange}
                  name="yearsOfExperience"
                  value={yearsOfExperience?.toString() || ""}
                  placeholder="골프 경력은 어떻게 되나요?"
                  type="number"
                />
              </FormField>

              <FormField>
                <InputLabel>최애 골프선수</InputLabel>
                <InputField
                  onChange={onChange}
                  name="favoriteGolfer"
                  value={favoriteGolfer}
                  placeholder="평소 좋아하는 골프선수가 있나요?"
                  type="text"
                />
              </FormField>

              <FormField>
                <InputLabel>이글 수</InputLabel>
                <InputField
                  onChange={onChange}
                  name="numberOfEagles"
                  value={numberOfEagles?.toString() || ""}
                  placeholder="이글을 몇 번 경험했나요?"
                  type="number"
                />
              </FormField>

              <FormField>
                <InputLabel>홀인원 경험</InputLabel>
                <select
                  name="holeInOneExperience"
                  onChange={onChange}
                  value={
                    holeInOneExperience === null
                      ? ""
                      : holeInOneExperience.toString()
                  }
                  style={{
                    fontSize: '16px',
                    color: '#A6A6A6',
                    width: '100%',
                    border: 'none',
                    padding: '8px 0',
                  }}
                >
                  <option value="">홀인원을 경험한 적이 있나요?</option>
                  <option value="true">예</option>
                  <option value="false">아니오</option>
                </select>
              </FormField>
              {/* <Button
                type="button"
                variant="text"
                onClick={handleSkip}
                style={{
                  color: '#000', // black color
                }}
              >
                건너뛰기
              </Button> */}
            </>
          )}
        </Form>
      )}

      {error !== "" && <Error>{error}</Error>}

      {step < 3 && (
        <Switcher>
          이미 계정이 있으신가요? <Link to="/login">로그인 &rarr;</Link>
        </Switcher>
      )}
    </Wrapper>
  );
}
