import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserActions } from "../../store/UserSlice";
import {
  Button,
  AppBar,
  Toolbar,
  Stack,
  Modal,
  Box,
  List,
  Snackbar,
  Typography,
  IconButton,
  Alert,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import { fetchUsers } from "../../store/UserSlice";
import {
  fetchEvents,
  removeUserFromEvent,
  changeEventStatus,
} from "../../store/EventSlice";
import EditUserForm from "./EditUserForm";
import CreateEventForm from "../CreateEventForm/CreateEventForm";
import InviteForm from "../InviteForm/InviteForm";
import { usersList, eventsList, currentUser } from "../../store/selectors";
import EventItem from "./EventItem";

const Account = () => {
  const dispatch = useDispatch();
  const users = useSelector(usersList);
  const loggedInUser = useSelector(currentUser);
  const events = useSelector(eventsList);
  const [userEvents, setUserEvents] = useState([]);
  const [openUserSettingsModal, setOpenUserSettingsModal] = useState(false);
  const [openSuccessAlert, setOpenSuccessAlert] = useState(false);
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [cancelledEvents, setCancelledEvents] = useState([]);

  const handleEditEvent = (eventID) => {
    const eventToEdit = userEvents.find((event) => event.id === eventID);
    setSelectedEvent(eventToEdit);
    handleOpenModal();
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleCloseModalSuccess = () => {
    setOpenModal(false);
    setOpenSuccessAlert(true);
  };

  const handleCloseAlert = () => {
    setOpenSuccessAlert(false);
  };

  useEffect(() => {
    dispatch(fetchUsers());
  }, []);

  useEffect(() => {
    dispatch(UserActions.getUserId());
    dispatch(fetchEvents(loggedInUser.id));
    console.log(events);
  }, [loggedInUser.id]);

  const handleEventDelete = (eventID) => {
    dispatch(
      removeUserFromEvent({ eventId: eventID, userId: loggedInUser.id })
    );
  };

  const handleStatusChange = (eventID, status) => {
    dispatch(
      changeEventStatus({
        eventId: eventID,
        userId: loggedInUser.id,
        status: status,
      })
    );
  };

  const handleLogOut = (event) => {
    event.preventDefault();
    dispatch(UserActions.logOut());
    navigate("/login");
  };

  const isFirstUser = () => {
    return users.length === 1;
  };

  useEffect(() => {
    const filteredEvents = events.filter((event) => {
      const currentUserParticipant = event.participants.find(
        (participant) => participant.id === loggedInUser.id
      );
      return currentUserParticipant
        ? currentUserParticipant.status !== "cancelled"
        : true;
    });
    setUserEvents(filteredEvents);
  }, [events, loggedInUser]);

  useEffect(() => {
    const filteredEvents = events.filter((event) => {
      const currentUserParticipant = event.participants.find(
        (participant) => participant.id === loggedInUser.id
      );
      return currentUserParticipant
        ? currentUserParticipant.status === "cancelled"
        : false;
    });

    setCancelledEvents(filteredEvents);
  }, [events, loggedInUser.id]);

  const getStatusForCurrentUser = (event) => {
    const currentUserParticipant = event.participants.find(
      (participant) => participant.id === loggedInUser.id
    );
    return currentUserParticipant
      ? currentUserParticipant.status
      : "no status find";
  };

  const getRoleOfUser = (event) => {
    const currentUserParticipant = event.participants.find(
      (participant) => participant.id === loggedInUser.id
    );
    return currentUserParticipant
      ? currentUserParticipant.role
      : "no status find";
  };

  const handleOpenUserSettingsModal = () => {
    setOpenUserSettingsModal(true);
  };

  const handleCloseUserSettingsModalSuccess = () => {
    setOpenUserSettingsModal(false);
    setOpenSuccessAlert(true);
  };
  const handleCloseUserSettingsModal = () => {
    setOpenUserSettingsModal(false);
  };

  return (
    <>
      <div className="user-inner">
        <AppBar>
          <Toolbar>
            <h2>Hello, {loggedInUser.name}</h2>
            <Stack spacing={2} direction="row">
              <Button
                variant="text"
                type="submit"
                size="large"
                onClick={handleOpenModal}
                disabled={isFirstUser()}
              >
                Create event
              </Button>
              <IconButton
                variant="text"
                type="submit"
                size="large"
                onClick={handleOpenUserSettingsModal}
              >
                <AccountCircleIcon />
              </IconButton>
              <IconButton
                variant="text"
                type="submit"
                size="large"
                onClick={handleLogOut}
              >
                <LogoutIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        {isFirstUser() && (
          <>
            <Alert severity="info">
              Congratulations, you are the first client. Please invite your
              friends (colleagues).
              <InviteForm />
            </Alert>
          </>
        )}

        {userEvents.length === 0 ? (
          <Typography variant="h6" align="center" mt={6}>
            No events available.
          </Typography>
        ) : (
          <>
            <List>
              {userEvents.map((event) => (
                <EventItem
                  key={event.id}
                  event={event}
                  handleEditEvent={handleEditEvent}
                  handleEventDelete={handleEventDelete}
                  handleStatusChange={handleStatusChange}
                  getStatusForCurrentUser={getStatusForCurrentUser}
                  getRoleOfUser={getRoleOfUser}
                />
              ))}
            </List>
          </>
        )}

        {cancelledEvents.length === 0 ? (
          <></>
        ) : (
          <>
            <List className="cancelledEvents">
              {cancelledEvents.map((event) => (
                <EventItem
                  key={event.id}
                  event={event}
                  handleEditEvent={handleEditEvent}
                  handleEventDelete={handleEventDelete}
                  handleStatusChange={handleStatusChange}
                  getStatusForCurrentUser={getStatusForCurrentUser}
                  getRoleOfUser={getRoleOfUser}
                />
              ))}
            </List>
          </>
        )}

        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="child-modal-title"
        >
          <Box className="modal">
            <h2 id="child-modal-title">
              {selectedEvent ? "Edit Event" : "Create new event"}
            </h2>
            <CreateEventForm
              onCloseModalSuccess={() => {
                handleCloseModalSuccess();
                setSelectedEvent(null);
              }}
              selectedEvent={selectedEvent}
            />
            <IconButton
              onClick={() => {
                handleCloseModal();
                setSelectedEvent(null);
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Modal>

        <Modal
          open={openUserSettingsModal}
          onClose={handleCloseUserSettingsModal}
          aria-labelledby="user-settings-modal-title"
        >
          <Box className="modal">
            <h2 id="user-settings-modal-title">Edit User Settings</h2>
            <EditUserForm onCloseModal={handleCloseUserSettingsModalSuccess} />
            <IconButton onClick={handleCloseUserSettingsModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Modal>

        <Snackbar
          open={openSuccessAlert}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
        >
          <Alert
            onClose={handleCloseAlert}
            severity="success"
            sx={{ width: "100%" }}
          >
            Success!
          </Alert>
        </Snackbar>
      </div>
    </>
  );
};

export default Account;
