from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, status, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
import os

from db.database import get_db
from models.deadline import Deadline
from models.user import User
from models.team import Team
from models.membership import Membership
from schemas.deadline import DeadlineCreate, DeadlineResponse, DeadlineUpdate
from auth.oauth2 import get_current_user
from services.document_processor import DocumentProcessor
from core.config import settings

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
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all deadlines for the current user with pagination
    """
    deadlines = db.query(Deadline)\
        .filter(Deadline.user_id == current_user.id)\
        .offset(skip)\
        .limit(limit)\
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
    for field, value in request.dict(exclude_unset=True).items():
        setattr(deadline, field, value)
    
    try:
        db.commit()
        db.refresh(deadline)
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
        db.delete(deadline)
        db.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete deadline"
        )

@router.post("/scan-document", response_model=List[DeadlineResponse])
async def scan_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Scan a document for deadlines and create them automatically using LLM
    """
    try:
        # Validate file type
        allowed_types = ["application/pdf", "text/plain", "text/csv", "application/msword", 
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
        
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {file.content_type}. Supported types: PDF, TXT, CSV, DOC, DOCX"
            )
        
        content = await file.read()
        
        # Extract text based on file type
        if file.content_type == "application/pdf":
            text_content = document_processor.extract_text_from_pdf(content)
        elif file.content_type in ["text/plain", "text/csv"]:
            try:
                text_content = content.decode('utf-8')
            except UnicodeDecodeError:
                try:
                    text_content = content.decode('latin-1')
                except UnicodeDecodeError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Cannot decode text file. Please ensure it's in UTF-8 or Latin-1 encoding."
                    )
        else:
            # For other document types, try to decode as text (basic fallback)
            try:
                text_content = content.decode('utf-8')
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot process {file.content_type} files yet. Please convert to PDF or TXT format."
                )
        
        if not text_content.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No text content found in the document"
            )
        
        # Extract deadlines using LLM
        extracted_deadlines = await document_processor.extract_deadlines(text_content)
        
        if not extracted_deadlines:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No deadlines found in document"
            )
        
        # Create deadlines in database
        created_deadlines = []
        for extracted in extracted_deadlines:
            deadline = Deadline(
                title=extracted.title,
                description=extracted.description,
                course=extracted.course,
                date=extracted.date,
                priority=extracted.priority,
                user_id=current_user.id
            )
            db.add(deadline)
            created_deadlines.append(deadline)
        
        try:
            db.commit()
            for deadline in created_deadlines:
                db.refresh(deadline)
            return created_deadlines
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create deadlines from document"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error processing document: {str(e)}"
        )

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
    
    # Assign deadline to team
    deadline.team_id = team_id
    
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
    skip: int = 0,
    limit: int = 10,
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
    ).offset(skip).limit(limit).all()
    
    return deadlines
