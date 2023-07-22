import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthUserContext';

import { Container, Row, Col, Button, Input, FormGroup } from 'reactstrap';

import styles from 'styles/Home.module.css';

function parseJwt(token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

const LoggedIn = () => {
  const { authUser, loading, signOut, requestJwtToken } = useAuth();
  const router = useRouter();
  const [jwtToken, setJwtToken] = useState("");
  const [claimData, setClaimData] = useState("");


  const onRequestJwtToken = async () => {
    const rawToken = await requestJwtToken();
    const decodedToken = parseJwt(rawToken);
    setJwtToken(JSON.stringify(decodedToken));
  }

  const onSubmitClaim = async (event) => {
    event.preventDefault();

    const txData = claimData;

    const { uid } = authUser;
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/setTxData", {
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

  const sendTx = async () => {
    
  }

  const reject = async () => {

  }


  // Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser)
      router.push('/')
  }, [authUser, loading])

  return (
    <Container className={styles.container}>
      {
        loading ? 
          <Row>
            <Col>Loading....</Col>
          </Row> : (

          <>
          <Row className={styles.topRow}>
              <Button>Network</Button>
              <Button onClick={signOut}>Sign out</Button>
          </Row>
          <Row className={styles.labelRow}>
          <div className={styles.centerLabel}>
            <Input readOnly value="0x19999" size="5">  </Input>
          </div>
        </Row>
        <Row className={styles.nativeRow}>
          <div className={styles.centerLabel} style={{fontSize: "2.5em"}}>
            0.5 ETH
          </div>
        </Row>
        </>
      )}

      <FormGroup>
        <Input
          type="textarea"
          placeholder='TX Data'
          value={jwtToken || ''}
          readOnly
          style={{ width: "100%", wordBreak: "break-all" }}
          rows={5}
        />
      </FormGroup>
      <FormGroup  style={{ display: 'flex', justifyContent: 'space-between'}}>
        <Button onClick={sendTx} style={{ marginLeft: '40px', fontSize: '1.2em' }} >Accept</Button>
        <Button onClick={reject} style={{ marginRight:'40px', fontSize: '1.2em' }}>Reject</Button>
      </FormGroup>
    </Container>
  )
}

export default LoggedIn;
