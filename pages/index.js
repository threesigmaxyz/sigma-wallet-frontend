import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useAuth } from '../context/AuthUserContext';

import styles from 'styles/Home.module.css';

import { Container, Row, Col, Button, Form, FormGroup, Label, Input, Alert } from 'reactstrap';

import { FcGoogle } from 'react-icons/fc';


export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();
  const { signInWithEmailAndPassword, signInWithCustomToken, signInWithGoogle, getRedirectResult } = useAuth();

  // Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    const attemptSignIn = async () => {
      try {
        const result = await getRedirectResult();
        if (result && result.user) {
          await authenticate(result);
        } else {
          // Everything is fine
        }
      } catch (error) {
        console.log(error) // Debug errors from redirect response
      }

      try {
        await signInWithCustomToken();
        router.push('/logged_in');
      } catch (error) {
        console.log(error);
      }
    }
    attemptSignIn();
  }, [])

  const authenticate = async (user) => {
    try {
      console.log("Success. The user is created in firebase");
      const uid = user.user.uid;
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
    } catch (error) {
      setError(error.message)
    }
  }

  const onSubmit = async (event) => {
    setError(null);
    try {
      const user = await signInWithEmailAndPassword(email, password);
      await authenticate(user);
    } catch (error) {
      setError(error.message)
    }
    event.preventDefault();
  };

  const onGoogleSignIn = async (event) => {
    setError(null);
    try {
      const user = await signInWithGoogle();
      await authenticate(user);
    } catch (error) {
      setError(error.message)
    }
    event.preventDefault();
  }

  return (
    <Container className={styles.container}>
      <Row>
        <Col className={styles.centerLabel}>
          <h2 style={{ marginBottom: "20px" }}>Login</h2>
        </Col>
      </Row>
      <Form>
        {error && <Alert color="danger">{error}</Alert>}
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
      <div className={styles.googleButtonContainer}>
          <div className={styles.googleButton} onClick={onGoogleSignIn}>
            <Row>
              <Col className={styles.centerLabel}>
                <FcGoogle style={{ marginRight: "5px" }}></FcGoogle>
                Continue with Google
              </Col>
            </Row>
          </div>
        </div>
    </Container>
  )
}
