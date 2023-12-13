import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Define the API endpoint for events
const apiUrlEvents = "http://localhost:3001/events";

// Async thunk to fetch events for a specific user
export const fetchEvents = createAsyncThunk("events/fetchEvents", (userId) => {
  return axios.get(apiUrlEvents).then((response) => {
    // Filter events based on user participation
    const filteredEvents = response.data.filter((event) =>
      event.participants.some((participant) => participant.id === userId)
    );
    return filteredEvents;
  });
});

// Async thunk to add a new event
export const addNewEvent = createAsyncThunk("events/addEvent", (newEvent) =>
  axios.post(apiUrlEvents, newEvent).then((response) => response.data)
);

// Async thunk to remove a user from an event
export const removeUserFromEvent = createAsyncThunk(
  "events/removeUserFromEvent",
  ({ eventId, userId }) => {
    return axios.get(`${apiUrlEvents}/${eventId}`).then((response) => {
      const updatedEvent = {
        ...response.data,
        participants: response.data.participants.filter(
          (participant) => participant.id !== userId
        ),
      };
      return axios
        .put(`${apiUrlEvents}/${eventId}`, updatedEvent)
        .then(() => ({ eventId, userId }));
    });
  }
);

// Async thunk to edit an event
export const editEvent = createAsyncThunk(
  "events/editEvent",
  ({ eventId, updatedEvent }) =>
    axios
      .put(`${apiUrlEvents}/${eventId}`, updatedEvent)
      .then(() => ({ eventId, updatedEvent }))
);

// Async thunk to change the status of a user in an event
export const changeEventStatus = createAsyncThunk(
  "events/changeEventStatus",
  ({ eventId, userId, status }) => {
    return axios.get(`${apiUrlEvents}/${eventId}`).then((response) => {
      const updatedEvent = {
        ...response.data,
        participants: response.data.participants.map((participant) => {
          if (participant.id === userId) {
            return {
              ...participant,
              status: status,
            };
          }
          return participant;
        }),
      };
      return axios
        .put(`${apiUrlEvents}/${eventId}`, updatedEvent)
        .then(() => ({ eventId, userId, status }));
    });
  }
);

// Helper function to update event in state
const updateEventInState = (state, eventId, updatedEvent) => {
  const updatedEvents = state.events.map((event) =>
    event.id === eventId ? { ...event, ...updatedEvent } : event
  );
  return updatedEvents;
};

// Initial state for the events slice
export const initialState = {
  events: [],
  isLoading: false,
};

// Create the EventSlice using createSlice from Redux Toolkit
const EventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    // Reducer to add an event to state
    addEvent: (state, action) => {
      state.events = [action.payload, ...state.events];
    },
  },
  // Define extra reducers for handling async actions
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.events = action.payload;
        state.isLoading = false;
      })
      .addCase(addNewEvent.fulfilled, (state, action) => {
        state.events = [action.payload, ...state.events];
      })
      .addCase(changeEventStatus.fulfilled, (state, action) => {
        const { eventId, userId, status } = action.payload;
        const updatedEvents = state.events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                participants: event.participants.map((participant) =>
                  participant.id === userId
                    ? { ...participant, status: status }
                    : participant
                ),
              }
            : event
        );
        state.events = updatedEvents;
      })
      .addCase(removeUserFromEvent.fulfilled, (state, action) => {
        const eventInfo = action.payload;
        state.events = state.events.filter(
          (event) => event.id !== eventInfo.eventId
        );
      })
      .addCase(editEvent.fulfilled, (state, action) => {
        const { eventId, updatedEvent } = action.payload;
        const updatedEvents = updateEventInState(state, eventId, updatedEvent);
        state.events = updatedEvents;
      });
  },
});

// Export actions and reducer from the EventSlice
export const EventActions = EventSlice.actions;
export default EventSlice.reducer;
