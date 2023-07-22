import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthUserContext';
const { ethers } = require("ethers");
const walletFactoryAbi = require('abi/SigmaWalletFactory.json').abi;

import { Container, Row, Col, Button, Input, FormGroup, UncontrolledDropdown, DropdownMenu, DropdownItem, DropdownToggle } from 'reactstrap';

import styles from 'styles/Home.module.css';

function parseJwtHeader(token) {
  return JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString());
}

function parseJwtPayload(token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

function parseJwtSignature(token) {
  return Buffer.from(token.split('.')[2], 'base64').toString();
}

const LoggedIn = () => {
  const { authUser, loading, signOut, requestJwtToken } = useAuth();
  const router = useRouter();
  const [txData, setTxData] = useState("");
  const [transferTarget, setTransferTarget] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isTransferClicked, setIsTransferClicked] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [signature, setSignature] = useState("");
  const [chain, setChain] = useState("Sepolia");

  const chainData = {
    "Sepolia" : { factory: process.env.NEXT_PUBLIC_SEPOLIA_FACTORY, rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL, native: "SepoliaETH"},
    "ZkSync" : { factory: process.env.NEXT_PUBLIC_ZKSYNC_FACTORY, rpcUrl: process.env.NEXT_PUBLIC_ZKSYNC_RPC_URL, native: "ETH"},
  };

  const onRequestJwtToken = async () => {
    try {
      const abiCoder = new ethers.utils.AbiCoder();
      const txData = "b61d27f6" + abiCoder.encode(["address", "uint256", "bytes"], [transferTarget, transferAmount, "0x"]).slice(2);
      const { uid } = authUser;
      await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/setTxData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid, txData }),
      });
      const rawToken = await requestJwtToken();
      const header = parseJwtHeader(rawToken);
      const payload = parseJwtPayload(rawToken);
      const signatureRead = parseJwtSignature(rawToken);
      const signatureComputed = abiCoder.encode(["string", "string", "string", "string"], ["Google", JSON.stringify(header), JSON.stringify(payload), signatureRead]);
      setSignature(signatureComputed);
      setTxData(payload.txData);
      setIsTransferClicked(false);
    }
      catch (error) {
        console.error("Error while fetching:", error);
      };
  }

  const sendTransfer = async () => {
    setTxData("");
    setIsTransferClicked(true);
  }

  const sendTx = async () => {
    const { uid } = authUser;
    const endpoint = chain == "ZKSync" ? "/sendTxZKSync" : "/sendTxERC4337";
    let body = { uid, txData, signature };
    if (chain != "ZKSync") body["chain"] = chain;
    try {
      await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error("Error while fetching:", error);
    };
  }

  const reject = async () => {
    setTxData("");
    setIsTransferClicked(false);
  }


  // Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    const init = async () => {
      if (!authUser) return;
      try {
        const factoryAddress = chainData[chain].factory;
        const rpcUrl = chainData[chain].rpcUrl;
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const factory = new ethers.Contract(factoryAddress, walletFactoryAbi, provider);
        const walletAddressRead = await factory.getAddress(authUser.uid, 0);
        setWalletAddress(walletAddressRead);
      } catch (error) {
        setWalletAddress("0xff07F25C4753BE90D919A908F54Eb64adA79DD3d");
        console.error("Error while fetching:", error);
      }
    }

    if (!loading && !authUser)
      router.push('/')
    else {
      init();
    }
  }, [authUser, loading])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!walletAddress) return;
      try {
        await setBalanceHandler(chain);
      } catch (error) {
        console.error("Error while fetching:", error);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [walletAddress, chain]);

  const setBalanceHandler = async (newChain) => {
    const rpcUrl = chainData[newChain].rpcUrl;
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const walletBalance = await provider.getBalance(walletAddress);
    setBalance((Number(walletBalance)/1e18).toFixed(4));
  }

  const changeChain = async (newChain) => {
      setChain(newChain);
      await setBalanceHandler(newChain);
    }

  return (
    <Container className={styles.container}>
      {
        loading ? 
          <Row>
            <Col>Loading....</Col>
          </Row> : (

          <>
          <Row className={styles.topRow}>
          <UncontrolledDropdown group>
            <Button readOnly>
              {chain}
            </Button>
            <DropdownToggle
              caret
            />
            <DropdownMenu>
              {chain != "ZkSync" && <DropdownItem onClick={event => changeChain("ZkSync")}>
                ZkSync
              </DropdownItem>}
              {chain != "Sepolia" && <DropdownItem onClick={event => changeChain("Sepolia")}>
                Sepolia
              </DropdownItem>}
            </DropdownMenu>
          </UncontrolledDropdown>
              <Button onClick={signOut}>Sign out</Button>
          </Row>
          <Row className={styles.labelRow}>
          <div className={styles.centerLabel}>
            <Input readOnly value={walletAddress} size="5">  </Input>
          </div>
        </Row>
        <Row className={styles.nativeRow}>
          <div className={styles.centerLabel} style={{fontSize: "1.7em", marginTop: "10px", marginBottom: "5px"}}>
            {balance + " " + chainData[chain].native}
          </div>
        </Row>
        </>
      )}
      
      <FormGroup  style={{display: "flex", justifyContent: "center"}}>
      {!isTransferClicked && <Button className="rounded-circle"  onClick={sendTransfer}>Transfer</Button> }
      </FormGroup>

      {!isTransferClicked && <FormGroup>
        <Input
          type="textarea"
          placeholder='TX Data'
          value={txData || ''}
          readOnly
          style={{ width: "100%", wordBreak: "break-all" }}
          rows={5}
        />
      </FormGroup>
      }
      {isTransferClicked && <FormGroup>
        <Input
          placeholder='Destination'
          style = {{marginBottom: "10px"}}
          onChange = {(event) => setTransferTarget(event.target.value)}
          />
        <Input
          placeholder='Amount'
          onChange = {(event) => setTransferAmount(event.target.value)}
        />
      </FormGroup>
      }
      
      <FormGroup  style={{ display: 'flex', justifyContent: 'space-between'}}>
        <Button onClick={isTransferClicked ? onRequestJwtToken : sendTx} style={{ marginLeft: '40px', fontSize: '1.2em' }}>{isTransferClicked ? "Accept" : "Send"}</Button>
        <Button onClick={reject} style={{ marginRight:'40px', fontSize: '1.2em' }}>{isTransferClicked ? "Reject" : "Undo"}</Button>
      </FormGroup>
    </Container>
  )
}

export default LoggedIn;
