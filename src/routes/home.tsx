import { styled } from "styled-components";
import Timeline from "../components/timeline";

const Wrapper = styled.div`
  display: grid;
  gap: 50px;
  // grid-template-rows: 1fr 5fr;
  /* Removed overflow-y: scroll */
`;

export default function Home() {
  return (
    <Wrapper>
      {/* <PostTweetForm /> */}
      <Timeline />
    </Wrapper>
  );
}
