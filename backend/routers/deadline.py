from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, status, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
import os
import logging
import uuid
import json
from pydantic import BaseModel
from typing import List

from db.database import get_db
from models.deadline import Deadline
from models.user import User
from models.team import Team
from models.membership import Membership
from models.temp_scan import TempScan
from schemas.deadline import DeadlineCreate, DeadlineResponse, DeadlineUpdate
from auth.oauth2 import get_current_user
from services.document_processor import DocumentProcessor
from services.calendar_service import get_calendar_service
from core.config import settings


logger = logging.getLogger(__name__)

# Initialize document processor with Gemini API key
document_processor = DocumentProcessor(settings.GEMINI_API_KEY)

router = APIRouter(
    prefix="/deadlines",
    tags=["deadlines"],
    responses={404: {"description": "Not found"}},
)

@router.post("/create", response_model=DeadlineResponse, status_code=status.HTTP_201_CREATED)
async def create_deadline(
    request: DeadlineCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Create new deadline instance
    try:
        new_deadline = Deadline(
            title=request.title,
            description=request.description,
            course=request.course,
            date=request.date,
            priority=request.priority,  # Enum will be converted to string automatically
            estimated_hours=request.estimated_hours,
            user_id=current_user.id  # Associate deadline with current user
        )
    except Exception as e:
        print(f"Error creating deadline instance: {str(e)}")  # For debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating deadline instance: {str(e)}"
        )
    
    try:
        # Add to database session
        db.add(new_deadline)
        # Commit the transaction
        db.commit()
        # Refresh to get the created id and timestamps
        db.refresh(new_deadline)
        
        # Sync to Google Calendar if enabled
        if getattr(current_user, 'calendar_sync_enabled', False):
            try:
                # Import the per-user calendar service function
                from services.calendar_service import get_calendar_service_for_user
                
                # Create calendar service with user's OAuth tokens
                calendar_service = get_calendar_service_for_user(current_user)
                calendar_id = getattr(current_user, 'calendar_id', None) or "primary"
                
                event = calendar_service.create_event(
                    title=str(getattr(new_deadline, 'title')),
                    description=str(getattr(new_deadline, 'description', '') or ''),
                    start_datetime=getattr(new_deadline, 'date'),
                    estimated_hours=getattr(new_deadline, 'estimated_hours', None),
                    course=getattr(new_deadline, 'course', None),
                    priority=str(getattr(new_deadline, 'priority')),
                    calendar_id=calendar_id
                )
                
                # Update deadline with calendar event ID
                setattr(new_deadline, 'calendar_event_id', event.get('id'))
                setattr(new_deadline, 'calendar_synced', True)
                
                # Save refreshed token if it was updated
                db.commit()
                db.refresh(new_deadline)
                
                logger.info(f"Synced deadline {new_deadline.id} to user's calendar")
            except ValueError as e:
                # User hasn't connected calendar yet
                logger.warning(f"Calendar not connected for user {current_user.id}: {e}")
            except Exception as e:
                logger.error(f"Failed to sync to calendar: {e}")
                # Don't fail the deadline creation if calendar sync fails
        
        return new_deadline
    except Exception as e:
        # Rollback on error
        db.rollback()
        print(f"Error creating deadline: {str(e)}")  # For debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create deadline: {str(e)}"
        )

@router.get("/", response_model=List[DeadlineResponse])
async def get_deadlines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all deadlines for the current user
    """
    deadlines = db.query(Deadline)\
        .filter(Deadline.user_id == current_user.id)\
        .all()
    return deadlines

@router.get("/{deadline_id}", response_model=DeadlineResponse)
async def get_deadline(
    deadline_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific deadline by ID
    """
    deadline = db.query(Deadline)\
        .filter(
            Deadline.id == deadline_id,
            Deadline.user_id == current_user.id
        ).first()
    
    if not deadline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deadline with id {deadline_id} not found"
        )
    return deadline

@router.put("/{deadline_id}", response_model=DeadlineResponse)
async def update_deadline(
    deadline_id: int,
    request: DeadlineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a deadline
    """
    # First, get existing deadline
    deadline = db.query(Deadline)\
        .filter(
            Deadline.id == deadline_id,
            Deadline.user_id == current_user.id
        ).first()
    
    if not deadline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deadline with id {deadline_id} not found"
        )
    
    # Update fields if provided in request
    update_data = request.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(deadline, field, value)
    
    try:
        db.commit()
        db.refresh(deadline)
        
        # Sync changes to Google Calendar if enabled and synced
        if (getattr(current_user, 'calendar_sync_enabled', False) and 
            getattr(deadline, 'calendar_synced', False) and 
            getattr(deadline, 'calendar_event_id', None)):
            try:
                from services.calendar_service import get_calendar_service_for_user
                
                calendar_service = get_calendar_service_for_user(current_user)
                calendar_id = getattr(current_user, 'calendar_id', None) or "primary"
                
                calendar_service.update_event(
                    event_id=str(getattr(deadline, 'calendar_event_id')),
                    title=str(getattr(deadline, 'title')) if 'title' in update_data else None,
                    description=str(getattr(deadline, 'description', '')) if 'description' in update_data else None,
                    start_datetime=getattr(deadline, 'date') if 'date' in update_data else None,
                    estimated_hours=getattr(deadline, 'estimated_hours', None) if 'estimated_hours' in update_data else None,
                    course=getattr(deadline, 'course', None) if 'course' in update_data else None,
                    priority=str(getattr(deadline, 'priority')) if 'priority' in update_data else None,
                    completed=getattr(deadline, 'completed', False) if 'completed' in update_data else None,
                    calendar_id=calendar_id
                )
                
                logger.info(f"Updated calendar event for deadline {deadline.id}")
            except ValueError as e:
                logger.warning(f"Calendar not connected for user {current_user.id}: {e}")
            except Exception as e:
                logger.error(f"Failed to update calendar event: {e}")
                # Don't fail the deadline update if calendar sync fails
        
        return deadline
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update deadline"
        )

@router.delete("/{deadline_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_deadline(
    deadline_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a deadline
    """
    deadline = db.query(Deadline)\
        .filter(
            Deadline.id == deadline_id,
            Deadline.user_id == current_user.id
        ).first()
    
    if not deadline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deadline with id {deadline_id} not found"
        )
    
    try:
        # Delete from Google Calendar if synced
        if (getattr(current_user, 'calendar_sync_enabled', False) and 
            getattr(deadline, 'calendar_synced', False) and 
            getattr(deadline, 'calendar_event_id', None)):
            try:
                from services.calendar_service import get_calendar_service_for_user
                
                calendar_service = get_calendar_service_for_user(current_user)
                calendar_id = getattr(current_user, 'calendar_id', None) or "primary"
                calendar_service.delete_event(
                    event_id=str(getattr(deadline, 'calendar_event_id')),
                    calendar_id=calendar_id
                )
                logger.info(f"Deleted calendar event for deadline {deadline.id}")
            except ValueError as e:
                logger.warning(f"Calendar not connected for user {current_user.id}: {e}")
            except Exception as e:
                logger.error(f"Failed to delete calendar event: {e}")
                # Continue with deadline deletion even if calendar delete fails
        
        db.delete(deadline)
        db.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete deadline"
        )


@router.post("/scan-document")
async def scan_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Scan a document for deadlines, store them temporarily in database, and return a temp_id for later saving.
    """
    import logging
    logger = logging.getLogger(__name__)
    try:
        allowed_types = ["application/pdf", "text/plain", "text/csv", "application/msword", 
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
        if file.content_type not in allowed_types:
            logger.error(f"Unsupported file type: {file.content_type}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {file.content_type}. Supported types: PDF, TXT, CSV, DOC, DOCX"
            )
        content = await file.read()
        if file.content_type == "application/pdf":
            text_content = document_processor.extract_text_from_pdf(content)
        elif file.content_type in ["text/plain", "text/csv"]:
            try:
                text_content = content.decode('utf-8')
            except UnicodeDecodeError:
                try:
                    text_content = content.decode('latin-1')
                except UnicodeDecodeError:
                    logger.error("Cannot decode text file. Not UTF-8 or Latin-1.")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Cannot decode text file. Please ensure it's in UTF-8 or Latin-1 encoding."
                    )
        else:
            try:
                text_content = content.decode('utf-8')
            except UnicodeDecodeError:
                logger.error(f"Cannot process {file.content_type} files yet. Not UTF-8.")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot process {file.content_type} files yet. Please convert to PDF or TXT format."
                )
        if not text_content.strip():
            logger.error("No text content found in the document.")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No text content found in the document"
            )
        extracted_deadlines = await document_processor.extract_deadlines(text_content)
        if not extracted_deadlines:
            logger.error(f"No deadlines found in document. Text: {text_content[:200]}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No deadlines found in document"
            )
        deadline_dicts = [
            {
                "title": d.title,
                "description": d.description,
                "course": d.course,
                "date": d.date.isoformat() if hasattr(d.date, 'isoformat') else str(d.date),
                "priority": d.priority,
                "estimated_hours": getattr(d, "estimated_hours", 0),
                "_tempKey": str(uuid.uuid4()),  # Add this line!
            }
            for d in extracted_deadlines
        ]
        logger.info(f"Extracted deadlines with temp keys: {deadline_dicts}")
        # Generate temp_id
        temp_id = str(uuid.uuid4())
        
        # Store in database with temporary session
        temp_scan = TempScan(
            temp_id=temp_id,
            user_id=current_user.id,
            deadlines_json=json.dumps(deadline_dicts),
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1)  # 1 hour expiry
        )
        db.add(temp_scan)
        db.commit()
        
        logger.info(f"Scan successful. temp_id={temp_id}, deadlines_found={len(deadline_dicts)}")
        return {"temp_id": temp_id, "deadlines": deadline_dicts}
    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error processing document: {str(e)}"
        )

class SaveScannedRequest(BaseModel):
    temp_id: str
    selected_keys: List[str]

@router.post("/save-scanned")
async def save_scanned(
    request: SaveScannedRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Save scanned request - temp_id: {request.temp_id}, selected_keys: {request.selected_keys}, user_id: {current_user.id}")
    
    temp_id = request.temp_id
    selected_keys = request.selected_keys

    temp_scan = db.query(TempScan).filter(
        TempScan.temp_id == temp_id,
        TempScan.user_id == current_user.id,
        TempScan.expires_at > datetime.now(timezone.utc)
    ).first()

    if not temp_scan:
        logger.error(f"Temp scan not found or expired - temp_id: {temp_id}, user_id: {current_user.id}")
        raise HTTPException(status_code=404, detail="Session expired or not found")

    all_deadlines = json.loads(temp_scan.deadlines_json)
    logger.info(f"All deadlines from temp_scan: {all_deadlines}")
    
    # Find deadlines by _tempKey
    to_save = [d for d in all_deadlines if d.get("_tempKey") in selected_keys]
    logger.info(f"Deadlines to save: {to_save}")
    
    saved = []

    for d in to_save:
        try:
            new_deadline = Deadline(
                title=d["title"],
                description=d["description"],
                course=d["course"],
                date=datetime.fromisoformat(d["date"]),
                priority=d["priority"],
                estimated_hours=d.get("estimated_hours", 0),
                user_id=current_user.id
            )
            db.add(new_deadline)
            db.commit()
            db.refresh(new_deadline)
            saved.append({"id": new_deadline.id, **d})
            logger.info(f"Successfully saved deadline: {new_deadline.id}")
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to save deadline: {e}", exc_info=True)

    logger.info(f"Save complete - saved {len(saved)} out of {len(to_save)} deadlines")
    return {"status": "saved", "count": len(saved), "deadlines": saved}

@router.post("/{deadline_id}/assign-team/{team_id}", response_model=DeadlineResponse)
async def assign_deadline_to_team(
    deadline_id: int,
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Assign a deadline to a team for sharing
    """
    # Get the deadline and check ownership
    deadline = db.query(Deadline).filter(
        Deadline.id == deadline_id,
        Deadline.user_id == current_user.id
    ).first()
    
    if not deadline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deadline with id {deadline_id} not found"
        )
    
    # Check if user is a member of the team
    membership = db.query(Membership).filter(
        Membership.team_id == team_id,
        Membership.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this team"
        )
    
    # Check if team exists
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Assign deadline to team using setattr for SQLAlchemy Column
    setattr(deadline, 'team_id', team_id)
    
    try:
        db.commit()
        db.refresh(deadline)
        return deadline
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to assign deadline to team"
        )

@router.get("/team/{team_id}", response_model=List[DeadlineResponse])
async def get_team_deadlines(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all deadlines assigned to a team
    """
    # Check if user is a member of the team
    membership = db.query(Membership).filter(
        Membership.team_id == team_id,
        Membership.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this team"
        )
    
    # Get team deadlines
    deadlines = db.query(Deadline).filter(
        Deadline.team_id == team_id
    ).all()
    
    return deadlines
