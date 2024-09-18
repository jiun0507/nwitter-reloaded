import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { doc, setDoc } from "firebase/firestore";

import {
  Form,
  Error,
  Input,
  Switcher,
  Title,
  Wrapper,
} from "../components/auth-components";
import GithubButton from "../components/github-btn";

interface GolfScore {
  date: string;
  score: number;
}

export default function CreateAccount() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // New golf-related state variables
  const [downToPlayGolf, setDownToPlayGolf] = useState<boolean | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [numberOfEagles, setNumberOfEagles] = useState<number | null>(null);
  const [holeInOneExperience, setHoleInOneExperience] = useState<boolean | null>(null);
  const [recentGolfScores, setRecentGolfScores] = useState<GolfScore[]>([]);
  const [favoriteGolfer, setFavoriteGolfer] = useState("");
  const [golfEquipment, setGolfEquipment] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "name": setName(value); break;
      case "email": setEmail(value); break;
      case "password": setPassword(value); break;
      case "downToPlayGolf": setDownToPlayGolf(value === "true"); break;
      case "bestScore": setBestScore(value ? parseInt(value) : null); break;
      case "averageScore": setAverageScore(value ? parseInt(value) : null); break;
      case "description": setDescription(value); break;
      case "numberOfEagles": setNumberOfEagles(value ? parseInt(value) : null); break;
      case "holeInOneExperience": setHoleInOneExperience(value === "true"); break;
      case "favoriteGolfer": setFavoriteGolfer(value); break;
      case "golfEquipment": setGolfEquipment(value); break;
    }
  };

  const onAddScore = () => {
    setRecentGolfScores([...recentGolfScores, { date: "", score: 0 }]);
  };

  const onScoreChange = (index: number, field: keyof GolfScore, value: string) => {
    const newScores = [...recentGolfScores];
    newScores[index] = { ...newScores[index], [field]: field === "score" ? parseInt(value) : value };
    setRecentGolfScores(newScores);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (isLoading || name === "" || email === "" || password === "") return;
    try {
      setLoading(true);
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(credentials.user, {
        displayName: name,
      });
      // Store user data in Firestore
      // Store user data in Firestore
      await setDoc(doc(db, "users", credentials.user.uid), {
        name,
        email,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        downToPlayGolf,
        bestScore,
        averageScore,
        description,
        numberOfEagles,
        holeInOneExperience,
        recentGolfScores,
        favoriteGolfer,
        golfEquipment
      });
      navigate("/");
    } catch (e) {
      if (e instanceof FirebaseError) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Wrapper>
      <Title>Join 𝕏</Title>
      <Form onSubmit={onSubmit}>
        <Input
          onChange={onChange}
          name="name"
          value={name}
          placeholder="Name"
          type="text"
          required
        />
        <Input
          onChange={onChange}
          name="email"
          value={email}
          placeholder="Email"
          type="email"
          required
        />
        <Input
          onChange={onChange}
          value={password}
          name="password"
          placeholder="Password"
          type="password"
          required
        />
        {/* New golf-related inputs */}
        <select name="downToPlayGolf" onChange={onChange} value={downToPlayGolf === null ? "" : downToPlayGolf.toString()}>
          <option value="">Are you down to play golf together?</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
        
        <Input
          onChange={onChange}
          name="bestScore"
          value={bestScore?.toString() || ""}
          placeholder="What is your best score?"
          type="number"
        />
        
        <Input
          onChange={onChange}
          name="averageScore"
          value={averageScore?.toString() || ""}
          placeholder="What is your average score?"
          type="number"
        />
        
        <textarea
          name="description"
          onChange={onChange}
          value={description}
          placeholder="Description"
        />
        
        <Input
          onChange={onChange}
          name="numberOfEagles"
          value={numberOfEagles?.toString() || ""}
          placeholder="Number of eagles so far"
          type="number"
        />
        
        <select name="holeInOneExperience" onChange={onChange} value={holeInOneExperience === null ? "" : holeInOneExperience.toString()}>
          <option value="">Hole in one experience?</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
        
        {recentGolfScores.map((score, index) => (
          <div key={index}>
            <Input
              type="date"
              value={score.date}
              onChange={(e) => onScoreChange(index, "date", e.target.value)}
            />
            <Input
              type="number"
              value={score.score}
              onChange={(e) => onScoreChange(index, "score", e.target.value)}
              placeholder="Score"
            />
          </div>
        ))}
        <button type="button" onClick={onAddScore}>Add Recent Score</button>
        
        <Input
          onChange={onChange}
          name="favoriteGolfer"
          value={favoriteGolfer}
          placeholder="Favorite golfer"
          type="text"
        />
        
        <Input
          onChange={onChange}
          name="golfEquipment"
          value={golfEquipment}
          placeholder="What golf equipment do you use?"
          type="text"
        />
        <Input
          type="submit"
          value={isLoading ? "Loading..." : "Create Account"}
        />
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
      <Switcher>
        Already have an account? <Link to="/login">Log in &rarr;</Link>
      </Switcher>
      <GithubButton />
    </Wrapper>
  );
}
