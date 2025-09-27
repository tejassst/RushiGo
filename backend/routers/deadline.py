from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, status, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
import os

from db.database import get_db
from models.deadline import Deadline
from models.user import User
from schemas.deadline import DeadlineCreate, DeadlineResponse, DeadlineUpdate
from auth.oauth2 import get_current_user
from services.document_processor import DocumentProcessor

# Initialize document processor with API key
document_processor = DocumentProcessor(os.getenv("OPENAI_API_KEY", ""))

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
    new_deadline = Deadline(
        title=request.title,
        description=request.description,
        date=request.date,
        priority=request.priority,
        user_id=current_user.id  # Associate deadline with current user
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create deadline"
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
        content = await file.read()
        text_content = content.decode()
        
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
