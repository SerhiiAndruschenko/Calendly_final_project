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

// Validation schema for formik
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
  // Redux hooks
  const users = useSelector(usersList);
  const dispatch = useDispatch();
  const currentUserInfo = useSelector(currentUser) || {};
  const events = useSelector(eventsList);
  
  // Local state
  const [individual, setIndividual] = useState(false);
  const [minTime, setMinTime] = useState(null);
  const [maxTime, setMaxTime] = useState(null);
  const [userEvents, setUserEvents] = useState([]);

  // Function to handle toggling between individual and group event
  const handleMultiply = () => {
    setIndividual(!individual);
  };

  // Filter out the current user from the list of users
  const filteredUsers = users.filter((user) => user.id !== currentUserInfo.id);

  // Filter out the current user from the list of participants in the selected event
  const filteredParticipants = selectedEvent
    ? selectedEvent.participants.filter(
        (participant) => participant.id !== currentUserInfo.id
      )
    : null;

  // Function to get selected users based on individual/group selection
  const getSelectedUsers = () => {
    const filtered = filteredUsers.filter((user) =>
      filteredParticipants.some((participant) => participant.id === user.id)
    );
    return individual ? filtered[0] : filtered;
  };

  // Formik hook for form handling
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
      // Generate a unique ID for the new event
      const maxId = Math.max(...events.map((event) => parseInt(event.id))) || 0;
      const id = (maxId + 1).toString();
      const formattedDate = values.date.format("MM/DD/YYYY");
      const formattedTime = values.time.format("HH:mm");
      const selectedUsers = Array.isArray(values.selectedUsers)
        ? values.selectedUsers
        : [values.selectedUsers];

      // Prepare participants for the event
      const participants = selectedUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: "pending",
        role: "member",
        workingHoursStart: user.workingHoursStart,
        workingHoursEnd: user.workingHoursEnd,
      }));

      // Add the current user as the owner if not already in the participants list
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

      // Prepare event data
      const eventData = {
        id: id,
        eventName: values.eventName,
        description: values.description,
        date: formattedDate,
        time: formattedTime,
        individualCall: values.individualCall,
        participants,
      };

      // Dispatch action to add or edit the event
      selectedEvent
        ? dispatch(
            editEvent({ eventId: selectedEvent.id, updatedEvent: eventData })
          )
        : dispatch(addNewEvent(eventData));
      onCloseModalSuccess();
    },
  });

  // Effect to update state when individual/group selection changes
  useEffect(() => {
    formik.setFieldValue("individualCall", individual);
    if (individual && formik.values.selectedUsers.length > 0) {
      setMinTime(formik.values.selectedUsers[0]?.workingHoursStart || null);
      setMaxTime(formik.values.selectedUsers[0]?.workingHoursEnd || null);
    }
  }, [individual]);

  // Effect to set individual/group based on selected event
  useEffect(() => {
    setIndividual(selectedEvent?.individualCall || false);
  }, [selectedEvent]);

  // Handle change in selected users for the event
  const handleSelectChange = (event) => {
    const selectedUsers = !individual
      ? event.target.value
      : [event.target.value];
    formik.setFieldValue("selectedUsers", selectedUsers);

    // Update user events and min/max time based on selected users
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

  // Generate disabled times based on existing user events
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

  // Check if a time should be disabled
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
            {/* Event Name */}
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
            {/* Event Description */}
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
            {/* Individual/Group Call Checkbox and User Selection */}
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
            {/* Date Picker */}
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
            {/* Time Picker */}
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
        {/* Submit Button */}
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
