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
  const [time, setTime] = useState(new Date());


  const chainData = {
    "Sepolia" : { factory: process.env.NEXT_PUBLIC_SEPOLIA_FACTORY, rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL, factoryAddress: process.env.NEXT_PUBLIC_SEPOLIA_FACTORY, native: "SepoliaETH"},
    "ZkSync" : { factory: process.env.NEXT_PUBLIC_ZKSYNC_FACTORY, rpcUrl: process.env.NEXT_PUBLIC_ZKSYNC_RPC_URL, factoryAddress: process.env.NEXT_PUBLIC_ZKSYNC_FACTORY, native: "ETH"},
  };

  const onRequestJwtToken = async () => {
    try {
      const abiCoder = new ethers.utils.AbiCoder();

      const txData = chain != 'Sepolia' ? "0x" : "b61d27f6" + abiCoder.encode(["address", "uint256", "bytes"], [transferTarget, transferAmount, "0x"]).slice(2);
      setTxData(txData);

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
      const signatureComputed = abiCoder.encode(
        ["string", "string", "string", "string"],
        ["Google", JSON.stringify(header), JSON.stringify(payload), signatureRead]
      );
      setSignature(signatureComputed);
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
    const endpoint = chain != "Sepolia" ? "/zksync/tx" : "/sendTxERC4337";
    
    let body = { uid, txData, signature };
    if (chain == "Sepolia") {
      body["chain"] = chain;
    } else {
      body["recipient"] = transferTarget;
      body["value"] = transferAmount;
    }
    
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
      try {
        if (chain != "Sepolia") {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/zksync/${uid}`, {
            method: "GET",
          });
          const data = await response.json();
          setWalletAddress(data.address);
        
        } else {
          const provider = new ethers.providers.JsonRpcProvider(chainData[chain].rpcUrl);
          const factory = new ethers.Contract(chainData[chain].factoryAddress, walletFactoryAbi, provider);
          const walletAddressRead = await factory.getAddress(authUser.uid, 0);
          setWalletAddress(walletAddressRead);
        }

      } catch (error) {
        setWalletAddress("0x0");
        console.error("Error while fetching:", error);
      }
    }

    if (!loading && !authUser)
      router.push('/')
    else {
      init();
    }
  }, [authUser, loading, chain])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await setBalanceHandler();
      } catch (error) {
        setBalance(0.0000);
        console.error("Error while fetching:", error);
      }
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [chain, walletAddress]);

  const setBalanceHandler = async () => {
    if (walletAddress == "0x0") return;
    const provider = new ethers.providers.JsonRpcProvider(chainData[chain].rpcUrl);
    const walletBalance = await provider.getBalance(walletAddress);
    setBalance((Number(walletBalance)/1e18).toFixed(4));
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
              {chain != "ZkSync" && <DropdownItem onClick={event => setChain("ZkSync")}>
                ZkSync
              </DropdownItem>}
              {chain != "Sepolia" && <DropdownItem onClick={event => setChain("Sepolia")}>
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
