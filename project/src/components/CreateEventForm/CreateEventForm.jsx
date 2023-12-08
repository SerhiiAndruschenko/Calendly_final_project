import { useFormik } from "formik";
import * as Yup from "yup";
import {
  TextField,
  Button,
  MenuItem,
  Container,
  FormControl,
  FormControlLabel,
  Checkbox,
  InputLabel,
  Select,
  Grid,
  Box,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { usersList, currentUser, eventsList } from "../../store/selectors";
import { addNewEvent } from "../../store/EventSlice";
import dayjs from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { useState, useEffect } from "react";
import { editEvent } from "../../store/EventSlice";

const validationSchema = Yup.object({
  eventName: Yup.string()
    .required("This field is required")
    .min(3, "Minimum 3 characters"),
  description: Yup.string()
    .required("This field is required")
    .min(10, "Minimum 10 characters"),
  selectedUsers: Yup.array().required("This field is required"),
  date: Yup.date().required("Date is required"),
  time: Yup.date().required("Time is required"),
});

const CreateEventForm = ({ onCloseModalSuccess, selectedEvent }) => {
  const users = useSelector(usersList);
  const dispatch = useDispatch();
  const currentUserInfo = useSelector(currentUser) || {};
  const [individual, setIndividual] = useState(false);
  const [minTime, setMinTime] = useState(null);
  const [maxTime, setMaxTime] = useState(null);
  const events = useSelector(eventsList);
  const [userEvents, setUserEvents] = useState([]);

  const handleMultiply = () => {
    setIndividual(!individual);
  };
  const filteredUsers = users.filter((user) => user.id !== currentUserInfo.id);

  const filteredParticipants = selectedEvent
    ? selectedEvent.participants.filter(
        (participant) => participant.id !== currentUserInfo.id
      )
    : null;

  const getSelectedUsers = () => {
    const filtered = filteredUsers.filter((user) =>
      filteredParticipants.some((participant) => participant.id === user.id)
    );
    return individual ? filtered[0] : filtered;
  };

  const formik = useFormik({
    initialValues: {
      eventName: selectedEvent?.eventName || "",
      description: selectedEvent?.description || "",
      selectedUsers: selectedEvent ? getSelectedUsers() : [],
      individualCall: selectedEvent?.individualCall || false,
      date: selectedEvent ? dayjs(selectedEvent.date) : dayjs(new Date()),
      time: selectedEvent
        ? dayjs(selectedEvent.time, "HH:mm")
        : dayjs(new Date()),
    },
    validationSchema,
    onSubmit: async (values) => {
      const maxId = Math.max(...events.map((event) => parseInt(event.id))) || 0;
      const id = (maxId + 1).toString();
      const formattedDate = values.date.format("MM/DD/YYYY");
      const formattedTime = values.time.format("HH:mm");
      const selectedUsers = Array.isArray(values.selectedUsers)
        ? values.selectedUsers
        : [values.selectedUsers];

      const participants = selectedUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: "pending",
        role: "member",
        workingHoursStart: user.workingHoursStart,
        workingHoursEnd: user.workingHoursEnd,
      }));

      if (!participants.some((user) => user.id === currentUserInfo.id)) {
        participants.unshift({
          id: currentUserInfo.id,
          name: currentUserInfo.name,
          email: currentUserInfo.email,
          status: "accepted",
          role: "owner",
          workingHoursStart: currentUserInfo.workingHoursStart,
          workingHoursEnd: currentUserInfo.workingHoursEnd,
        });
      }

      const eventData = {
        id: id,
        eventName: values.eventName,
        description: values.description,
        date: formattedDate,
        time: formattedTime,
        individualCall: values.individualCall,
        participants,
      };

      selectedEvent
        ? dispatch(
            editEvent({ eventId: selectedEvent.id, updatedEvent: eventData })
          )
        : dispatch(addNewEvent(eventData));
      onCloseModalSuccess();
    },
  });

  useEffect(() => {
    formik.setFieldValue("individualCall", individual);
    if (individual && formik.values.selectedUsers.length > 0) {
      setMinTime(formik.values.selectedUsers[0]?.workingHoursStart || null);
      setMaxTime(formik.values.selectedUsers[0]?.workingHoursEnd || null);
    }
  }, [individual]);

  useEffect(() => {
    setIndividual(selectedEvent?.individualCall || false);
  }, [selectedEvent]);

  const handleSelectChange = (event) => {
    const selectedUsers = !individual
      ? event.target.value
      : [event.target.value];
    formik.setFieldValue("selectedUsers", selectedUsers);

    if (individual && selectedUsers.length > 0) {
      const selectedUserEvents = events.filter((event) =>
        event.participants.some(
          (participant) => participant.id === selectedUsers[0].id
        )
      );

      setUserEvents(selectedUserEvents);
    } else {
      setUserEvents([]);
    }

    individual && selectedUsers.length > 0
      ? setMinTime(selectedUsers[0]?.workingHoursStart || null)
      : setMinTime(null);
    individual && selectedUsers.length > 0
      ? setMaxTime(selectedUsers[0]?.workingHoursEnd || null)
      : setMaxTime(null);
  };

  const generateDisabledTimes = () => {
    const disabledTimes = [];

    userEvents.forEach((event) => {
      const formikDate = formik.values.date.format("MM/DD/YYYY");
      if (formikDate === event.date) {
        const eventTime = dayjs(event.time, "HH:mm");

        const disabledTimeStart = eventTime;
        const disabledTimeEnd = eventTime.add(1, "hour");

        disabledTimes.push({
          start: disabledTimeStart,
          end: disabledTimeEnd,
        });
      }
    });
    return disabledTimes;
  };

  const shouldDisableTime = (value, view) => {
    return generateDisabledTimes().some((disabledTime) =>
      value.isBetween(disabledTime.start, disabledTime.end, null, "[]")
    );
  };

  return (
    <Container component="main" maxWidth="xs">
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="eventName"
              name="eventName"
              label="Event Name"
              value={formik.values.eventName}
              onChange={formik.handleChange}
              error={
                formik.touched.eventName && Boolean(formik.errors.eventName)
              }
              helperText={formik.touched.eventName && formik.errors.eventName}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={
                formik.touched.description && Boolean(formik.errors.description)
              }
              helperText={
                formik.touched.description && formik.errors.description
              }
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="individualCall"
                  checked={individual}
                  onChange={handleMultiply}
                />
              }
              label="Individual Call"
            />
            <FormControl fullWidth>
              <InputLabel id="selectedUsers-label">Select User</InputLabel>
              <Select
                labelId="selectedUsers-label"
                id="selectedUsers"
                name="selectedUsers"
                label="Select Users"
                multiple={!individual}
                value={
                  !individual
                    ? formik.values.selectedUsers
                    : formik.values.selectedUsers[0]
                }
                onChange={handleSelectChange}
                error={
                  formik.touched.selectedUsers &&
                  Boolean(formik.errors.selectedUsers)
                }
              >
                {filteredUsers.map((user) => (
                  <MenuItem key={user.id} value={user}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DatePicker"]}>
                <DatePicker
                  fullWidth
                  name="date"
                  label="Date"
                  value={dayjs(formik.values.date)}
                  onChange={(newValue) =>
                    formik.setFieldValue("date", newValue)
                  }
                />
              </DemoContainer>
            </LocalizationProvider>
          </Grid>
          <Grid item xs={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["TimePicker"]}>
                <TimePicker
                  fullWidth
                  name="time"
                  label="Time"
                  ampm={false}
                  minutesStep={60}
                  skipDisabled
                  minTime={dayjs(minTime, "HH:mm")}
                  maxTime={dayjs(maxTime, "HH:mm")}
                  value={dayjs(formik.values.time, "HH:mm")}
                  shouldDisableTime={shouldDisableTime}
                  onChange={(newValue) =>
                    formik.setFieldValue("time", newValue)
                  }
                />
              </DemoContainer>
            </LocalizationProvider>
          </Grid>
        </Grid>
        <Box mt={2}>
          <Button type="submit" fullWidth variant="contained" color="primary">
            {selectedEvent ? "Update Event" : "Create Event"}
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default CreateEventForm;
