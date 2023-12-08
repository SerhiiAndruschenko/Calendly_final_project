import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Paper from "@mui/material/Paper";
import { Alert, TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { UserActions } from "../../store/UserSlice";
import { LOCAL_STORAGE_NAME } from "../../common/constants";
import { fetchUsers } from "../../store/UserSlice";
import { usersList } from "../../store/selectors";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Email is not valid")
    .required("This field is required"),
  password: Yup.string().required("This field is required"),
});

const SignIn = ({ setVisibility }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState("");
  const users = useSelector(usersList);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: () => {
      const { email, password } = formik.values;
      const foundUser = users.find(
        (user) => user.email === email && user.password === password
      );
      if (foundUser) {
        formik.resetForm();
        dispatch(UserActions.logIn({ ...foundUser }));
        navigate("/");
        localStorage.removeItem(LOCAL_STORAGE_NAME.TEMP_EMAIL);
      } else {
        setAlertMessage("User not found. Please sign up.");
        localStorage.setItem(LOCAL_STORAGE_NAME.TEMP_EMAIL, email);
      }
    },
  });

  return (
    <>
      <Paper
        sx={{
          maxWidth: 350,
          marginLeft: "auto",
          marginRight: "auto",
          padding: "20px",
        }}
        elevation={3}
      >
        <form onSubmit={formik.handleSubmit}>
          <h2>Sign In</h2>

          <div>
            <TextField
              id="email"
              name="email"
              label="Email"
              variant="outlined"
              fullWidth
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </div>
          <div>
            <TextField
              id="password"
              name="password"
              label="Password"
              variant="outlined"
              fullWidth
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
          </div>

          {alertMessage && (
            <>
              <Alert severity="error">{alertMessage}</Alert>
            </>
          )}

          <div>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              size="large"
            >
              Sign In
            </Button>
          </div>

          <div>
            <Button variant="text" onClick={setVisibility}>
              Sign Up
            </Button>
          </div>
        </form>
      </Paper>
    </>
  );
};

export default SignIn;
