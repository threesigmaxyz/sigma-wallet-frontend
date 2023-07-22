import { useState } from 'react';
import { useRouter } from 'next/router';

import { useAuth } from '../context/AuthUserContext';

import {Container, Row, Col, Button, Form, FormGroup, Label, Input, Alert} from 'reactstrap';

import { TiArrowBackOutline } from "react-icons/ti";

import styles from 'styles/Home.module.css';

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [passwordOne, setPasswordOne] = useState("");
  const [passwordTwo, setPasswordTwo] = useState("");
  const router = useRouter();
  //Optional error handling
  const [error, setError] = useState(null);

  const { createUserWithEmailAndPassword } = useAuth();

  const onSubmit = event => {
    setError(null)
    if(passwordOne === passwordTwo)
      createUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {
        console.log("Success. The user is created in firebase");

        router.push("/logged_in");
      })
      .catch(error => {
        setError(error.message)
      });
    else
      setError("Password do not match")
    event.preventDefault();
  };

  const backToLogin = () => {
    router.push("/");
  }

  return (
    <Container className={styles.container}>
      <TiArrowBackOutline onClick={backToLogin} style={{position: "absolute", top: "10px", left: "15px", fontSize: "2em"}}> Back</TiArrowBackOutline>
      <Row style ={{marginBottom: "20px"}}>
        <Col className={styles.centerLabel}>
          <h2>Sign Up</h2>
        </Col>
      </Row>
          <Form onSubmit={onSubmit}>
          { error && <Alert color="danger">{error}</Alert>}
            <FormGroup row>
              <Col>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  name="email"
                  id="signUpEmail"
                  placeholder="Email" />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col>
                <Input
                  type="password"
                  name="passwordOne"
                  value={passwordOne}
                  onChange={(event) => setPasswordOne(event.target.value)}
                  id="signUpPassword"
                  placeholder="Password" />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col>
                <Input
                  type="password"
                  name="password"
                  value={passwordTwo}
                  onChange={(event) => setPasswordTwo(event.target.value)}
                  id="signUpPassword2"
                  placeholder="Confirm Password" />
              </Col>
            </FormGroup>
            <FormGroup row>
             <Col className={styles.centerLabel}>
               <Button>Sign Up</Button>
             </Col>
           </FormGroup>
          </Form>
    </Container>
  )
}

export default SignUp;
