import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthUserContext';

import { Container, Row, Col, Button, Input, FormGroup } from 'reactstrap';
import jwt_decode from "jwt-decode";

const LoggedIn = () => {
  const { authUser, loading, signOut, requestJwtToken } = useAuth();
  const router = useRouter();
  const [jwtToken, setJwtToken] = useState("");
  const [claimData, setClaimData] = useState("");


  const onRequestJwtToken = async () => {
    const rawToken = await requestJwtToken();
    const decodedToken = jwt_decode(rawToken);
    setJwtToken(JSON.stringify(decodedToken));
  }

  const onSubmitClaim = async (event) => {
    event.preventDefault();

    const txData = claimData;
    
    const { uid } = authUser;
    try {
      const response = await fetch("/api/custom-claims/route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid, txData }),
      });

      const data = await response.json();
      console.log(data, response);
    } catch (error) {
      console.error("Error while fetching:", error);
    };
  }

  // Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser)
      router.push('/')
  }, [authUser, loading])

  return (
    <Container>

      {
        loading ?
          <Row>
            <Col>Loading....</Col>
          </Row> :
          <>
            <Row>
              <Col>
                {authUser && <div>Congratulations {authUser?.email}! You are logged in.</div>}
              </Col>
            </Row>
            <Row>
              <Col>
                <Button onClick={signOut}>Sign out</Button>
              </Col>
            </Row>
          </>
      }

      <Button onClick={onRequestJwtToken}>Get JWT Token</Button>
      <FormGroup>
        <Input
          type="textarea"
          value={jwtToken || ''}
          readOnly
          style={{ width: "100%", wordBreak: "break-all" }}
          rows={5}
        />
      </FormGroup>
      <FormGroup>
        <Input
          type="text"
          placeholder="Claim Data"
          onChange={(event) => setClaimData(event.target.value)}
        />
        <Button onClick={onSubmitClaim}>Set Claim</Button>
      </FormGroup>
    </Container>
  )
}

export default LoggedIn;
