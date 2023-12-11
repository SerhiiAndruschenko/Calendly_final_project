import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Email is not valid")
    .required("This field is required"),
});

const InviteForm = () => {
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      formik.resetForm();
    },
  });

  return (
    <form id="inviteForm" onSubmit={formik.handleSubmit}>
      <TextField
        fullWidth
        size="small"
        id="email"
        name="email"
        label="Email"
        type="email"
        variant="outlined"
        margin="normal"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.email}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
      />
      <IconButton type="submit" variant="contained" color="primary">
        <SendIcon />
      </IconButton>
    </form>
  );
};

export default InviteForm;
