import { Outlet } from "react-router-dom";
import styled from "styled-components";

const Wrapper = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;
export default function NoMenuLayout() {
  return (
    <Wrapper>
      <Outlet />
    </Wrapper>
  );
}
