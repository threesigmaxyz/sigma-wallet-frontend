import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useAuth } from '../context/AuthUserContext';

import styles from 'styles/Home.module.css';

import {Container, Row, Col, Button, Form, FormGroup, Label, Input, Alert} from 'reactstrap';

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();
  const { signInWithEmailAndPassword, signInWithCustomToken } = useAuth();

  // Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    const attemptSignIn = async () => {
      try {
        console.log("hi");
        await signInWithCustomToken();
        router.push('/logged_in');
      } catch(error) {
        console.log(error);
    }}
    attemptSignIn();
  }, [])

  const onSubmit = async (event) => {
    setError(null)
    try {
      const user = await signInWithEmailAndPassword(email, password);
      console.log("Success. The user is created in firebase");
      const uid  = user.user.uid;
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/getCustomToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });
      const data = await response.json();
      localStorage.setItem("customToken", data.customToken);
      router.push('/logged_in');
    } catch(error) {
      setError(error.message)
    }
    event.preventDefault();
  };

  return (
    <Container className={styles.container}>
      <Row style ={{marginBottom: "20px"}}>
        <Col className={styles.centerLabel}>
          <h2>Login</h2>
        </Col>
      </Row>
          <Form>
          { error && <Alert color="danger">{error}</Alert>}
            <FormGroup row>
              <Col>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  name="email"
                  id="loginEmail"
                  placeholder="Email" />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col>
                <Input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  id="loginPassword"
                  placeholder="Password" />
              </Col>
            </FormGroup>
            <FormGroup row>
             <Col className={styles.centerLabel}>
               <Button onClick={onSubmit}>Login</Button>
             </Col>
           </FormGroup>
           <FormGroup row>
            <Col>
              No account? <Link href="/sign_up">Create one</Link>
            </Col>
          </FormGroup>
          </Form>
    </Container>
  )
}
