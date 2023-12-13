import { useState } from "react";
import SignIn from "../SignIn/SignIn";
import SignUp from "../SignUp/SignUp";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserActions } from "../../store/UserSlice";
import { useDispatch, useSelector } from "react-redux";
import { currentToken } from "../../store/selectors";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector(currentToken);

  useEffect(() => {
    // Dispatch an action to get the token from local storage
    dispatch(UserActions.getToken());
  }, [dispatch]);

  useEffect(() => {
    // If a token exists, navigate to the root path
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const [signUpVisibility, setSignUpVisibility] = useState(false);

  const handleSignUpVisibility = () => {
    // Toggle the visibility of the SignUp component
    return setSignUpVisibility(!signUpVisibility);
  };

  return (
    <>
      {signUpVisibility ? (
        <SignUp setVisibility={() => handleSignUpVisibility()} />
      ) : (
        <SignIn setVisibility={() => handleSignUpVisibility()} />
      )}
    </>
  );
};

export default Login;
