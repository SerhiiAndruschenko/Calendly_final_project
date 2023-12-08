import { ListItem, ListItemText, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";

const EventItem = ({
  event,
  handleEditEvent,
  handleEventDelete,
  handleStatusChange,
  getStatusForCurrentUser,
  getRoleOfUser,
}) => {
  const status = getStatusForCurrentUser(event);
  const role = getRoleOfUser(event);
  const isOwner = role === "owner";

  return (
    <ListItem
      key={event.id}
      className={status}
      secondaryAction={
        <>
          {isOwner && (
            <IconButton
              edge="end"
              aria-label="edit"
              onClick={() => handleEditEvent(event.id)}
            >
              <EditIcon />
            </IconButton>
          )}
          {status === "pending" ? (
            <>
              <IconButton
                edge="end"
                aria-label="accept"
                onClick={() => handleStatusChange(event.id, "accepted")}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="cancel"
                onClick={() => handleStatusChange(event.id, "cancelled")}
              >
                <CancelIcon />
              </IconButton>
            </>
          ) : status === "cancelled" ? (
            <>
              <IconButton
                edge="end"
                aria-label="accept"
                onClick={() => handleStatusChange(event.id, "accepted")}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleEventDelete(event.id)}
              >
                <DeleteIcon />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton
                edge="end"
                aria-label="cancel"
                onClick={() => handleStatusChange(event.id, "cancelled")}
              >
                <CancelIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleEventDelete(event.id)}
              >
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </>
      }
    >
      <ListItemText
        primary={event.eventName}
        secondary={
          <>
            {
              <>
                <span>Description: {event.description}</span>
                <br />
                <span>Date: {event.date}</span>
                <br />
                <span>Time: {event.time}</span>
                <span className="users">
                  <span>Users:</span>
                  {event.participants.map((participant) => (
                    <span key={participant.id} className={participant.status}>
                      {participant.name}
                    </span>
                  ))}
                </span>
              </>
            }
          </>
        }
      />
    </ListItem>
  );
};

export default EventItem;
