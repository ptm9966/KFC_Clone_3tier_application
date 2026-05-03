import React, { useEffect, useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../Redux/Auth/auth.action";
import { Box } from "@chakra-ui/react";
import { API_BASE_URL } from "../../config/api";


const Login = () => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const Auth = useSelector((store) => store.auth.isAuth);
  const adminAuth = useSelector((store) => store.auth.adminAuth);
  const dispatch = useDispatch()
  let navigate = useNavigate();

  async function loginUser(event) {
    event.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
       mobile,
       password,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.message || "Please check mobile number or password")
      return;
    }
    console.log(data)
    if (data?.token) {
      const cred= {"id":data.token}
      dispatch(login(cred));
    }else {
      alert("Please check mobile number or password")
    }
    } catch (error) {
      console.log(error)
      alert("Please Signup first")
      navigate("/signup")
    }
    
    // if(Auth&&adminAuth){
    //   navigate("/menu")
    // }
    // else if(Auth){
    //   navigate("/menu")
    // }
    // console.log("data:", data.token);
  }

  

  useEffect(()=>{
   if(Auth&&adminAuth){
    navigate("/admin")
  }
  else if(Auth){
    navigate("/menu")
  }
  },[Auth,adminAuth])

  console.log(Auth,adminAuth);

  if(Auth&&adminAuth){
    navigate("/menu")
  }
  else if(Auth){
    navigate("/menu")
  }

  // const handleLogin=()=>{
  //   if(Auth&&adminAuth){
  //     navigate("/menu")
  //   }
  //   else if(Auth){
  //     navigate("/menu")
  //   }
  // }

  return (
    <>
       <div className="outerSection">
      <Box w={["95%","70%","50%","30%"]} className="loginSection">  
        <div className="loginmainbox">
          <h1 id="loginTitle">LOG IN TO KFC</h1>
          <div className="loginFormdiv">
            <form onSubmit={loginUser} id="loginForm">
              <div className="input-data">
                <input
                  type="tel"
                  name="mobile"
                  id="mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
                {/* <div className="underline"></div> */}
                <label>Mobile</label>
              </div>
              <div id="loginerrorBox"></div>
              <div className="input-data">
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {/* <div className="underline"></div> */}
                <label>Password</label>
              </div>
              <div id="loginerrorBox"></div>
              <div className="loginterms">
                <p className="logintermtext">
                  By logging into the application or proceeding as a guest, you
                  agree to our{" "}
                  <span className="logintermlink">Privacy Policy</span> and{" "}
                  <span className="logintermlink">Terms of Use</span>.
                </p>
              </div>
              <div className="loginBtndiv">
                <input type="submit" value="Log In" 
                // onClick={handleLogin}
                />
              </div>
              <div className="redirecttosignup" style={{marginBottom:"5%"}}>
                <p className="redirectsignuptext">
                  Don't have an account?
                  <Link to={"/signup"}>
                    <span className="redirectsignuplink">Join Now</span>
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </Box>
      </div>
    </>
  );
};

export default Login;
