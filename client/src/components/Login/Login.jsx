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
    dispatch(UserActions.getToken());
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const [signUpVisibility, setSignUpVisibility] = useState(false);

  const handleSignUpVisibility = () => {
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
