import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import Login from "./components/Login/Login";
import Account from "./components/Account/Account";
import { useEffect, useState } from "react";
import { UserActions } from "./store/UserSlice";
import { useDispatch, useSelector } from "react-redux";
import { currentToken, isLoading } from "./store/selectors";
import CircularProgress from "@mui/material/CircularProgress";

function App() {
  const dispatch = useDispatch();
  const token = useSelector(currentToken);
  const loading = useSelector(isLoading);
  const navigate = useNavigate();
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    dispatch(UserActions.getToken());
  }, [dispatch]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    let preloaderTimeout;

    if (!loading) {
      preloaderTimeout = setTimeout(() => {
        setShowPreloader(false);
      }, 1000);
    }

    return () => {
      clearTimeout(preloaderTimeout);
    };
  }, [loading]);

  return (
    <div className="App">
      {showPreloader && (
        <div className="preloaderWrap">
          <CircularProgress />
        </div>
      )}

      <Routes>
        <Route path="/">
          <Route index element={<Account />} />
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
