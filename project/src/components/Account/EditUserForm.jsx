import { useFormik } from "formik";
import * as Yup from "yup";
import { TextField, Button } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../store/UserSlice";
import { currentUser } from "../../store/selectors";
import { updateUser } from "../../store/UserSlice";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";

const EditUserForm = ({ onCloseModal }) => {
  const dispatch = useDispatch();
  const loggedInUser = useSelector(currentUser);
  useEffect(() => {
    dispatch(fetchUsers());
  }, []);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Email is not valid")
      .required("This field is required"),
    password: Yup.string()
      .required("This field is required")
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{12,}$/,
        "Password must contain: at least 1 lowercase letter, at least 1 uppercase letter, at least one digit. minimum length 12 characters"
      ),
    workingHoursStart: Yup.string().required("This field is required"),
    workingHoursEnd: Yup.string().required("This field is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: loggedInUser.email,
      password: loggedInUser.password,
      workingHoursStart: loggedInUser.workingHoursStart
        ? dayjs(loggedInUser.workingHoursStart, "HH:mm")
        : dayjs(),
      workingHoursEnd: loggedInUser.workingHoursEnd
        ? dayjs(loggedInUser.workingHoursEnd, "HH:mm")
        : dayjs(),
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      const updatedUser = { ...loggedInUser, ...values };
      console.log(values);
      console.log(updatedUser);
      dispatch(updateUser(updatedUser));
      onCloseModal();
    },
  });

  useEffect(() => {
    formik.setFieldValue("workingHoursStart", loggedInUser.workingHoursStart);
    formik.setFieldValue("workingHoursEnd", loggedInUser.workingHoursEnd);
  }, [loggedInUser]);

  return (
    <form onSubmit={formik.handleSubmit}>
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
      <div className="hours-row">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DemoContainer components={["TimePicker"]}>
            <TimePicker
              id="workingHoursStart"
              name="workingHoursStart"
              label="Working Hours Start"
              ampm={false}
              value={dayjs(formik.values.workingHoursStart, "HH:mm")}
              onChange={(newValue) =>
                formik.setFieldValue(
                  "workingHoursStart",
                  newValue.format("HH:mm")
                )
              }
              onBlur={formik.handleBlur}
              error={
                formik.touched.workingHoursStart &&
                Boolean(formik.errors.workingHoursStart)
              }
              helperText={
                formik.touched.workingHoursStart &&
                formik.errors.workingHoursStart
              }
            />
          </DemoContainer>
          <DemoContainer components={["TimePicker"]}>
            <TimePicker
              id="workingHoursEnd"
              name="workingHoursEnd"
              label="Working Hours End"
              ampm={false}
              value={dayjs(formik.values.workingHoursEnd, "HH:mm")}
              onChange={(newValue) =>
                formik.setFieldValue(
                  "workingHoursEnd",
                  newValue.format("HH:mm")
                )
              }
              onBlur={formik.handleBlur}
              error={
                formik.touched.workingHoursEnd &&
                Boolean(formik.errors.workingHoursEnd)
              }
              helperText={
                formik.touched.workingHoursEnd && formik.errors.workingHoursEnd
              }
            />
          </DemoContainer>
        </LocalizationProvider>
      </div>
      <br />
      <br />
      <div>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          size="large"
        >
          Submit
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm;
