from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.event_log import event_logger
from app.models import User
from app.schemas import EmailNotificationRequest, Message

router = APIRouter()


def require_role(user: User, role: str) -> None:
    if user.role != role:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")


@router.post("/notifications/email", response_model=Message)
def send_email_notifications(
    payload: EmailNotificationRequest,
    user: User = Depends(get_current_user),
) -> Message:
    require_role(user, "admin")

    event_logger.append("notifications.email_dispatched", user.id, payload.model_dump())

    return Message(message="Notification campaign queued.")