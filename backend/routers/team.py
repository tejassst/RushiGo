from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from db.database import get_db
from models.team import Team
from models.user import User
from models.membership import Membership
from auth.oauth2 import get_current_user

router = APIRouter(
    prefix="/teams",
    tags=["teams"]
)

# Schemas
class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None

class TeamResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    
    class Config:
        from_attributes = True

class MemberInvite(BaseModel):
    user_email: str
    role: str = "member"

class MemberResponse(BaseModel):
    id: int
    email: str
    username: str
    role: str

@router.post("/", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(team: TeamCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new team with the current user as admin"""
    new_team = Team(name=team.name, description=team.description)
    db.add(new_team)
    db.commit()
    db.refresh(new_team)

    # Add creator as admin
    membership = Membership(user_id=current_user.id, team_id=new_team.id, role="admin")
    db.add(membership)
    db.commit()

    return new_team

@router.get("/", response_model=List[TeamResponse])
def get_my_teams(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all teams the current user is a member of"""
    memberships = db.query(Membership).filter(Membership.user_id == current_user.id).all()
    
    # Explicitly load teams and filter out None values
    teams = []
    for membership in memberships:
        team_id = getattr(membership, 'team_id', None)
        if team_id is not None:
            team = db.query(Team).filter(Team.id == team_id).first()
            if team:
                teams.append(team)
    
    return teams

@router.get("/{team_id}", response_model=TeamResponse)
def get_team(team_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific team"""
    # Check if user is a member
    membership = db.query(Membership).filter(
        Membership.team_id == team_id,
        Membership.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this team")
    
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    
    return team

@router.post("/{team_id}/invite")
def invite_member(
    team_id: int, 
    invite: MemberInvite, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Invite a user to join the team"""
    # Check if current user is admin of this team
    admin_membership = db.query(Membership).filter(
        Membership.team_id == team_id,
        Membership.user_id == current_user.id,
        Membership.role == "admin"
    ).first()
    
    if not admin_membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only team admins can invite members")

    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    # Find user to invite
    user = db.query(User).filter(User.email == invite.user_email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Check if user is already a member
    existing_membership = db.query(Membership).filter(
        Membership.user_id == user.id,
        Membership.team_id == team_id
    ).first()
    
    if existing_membership:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already a member")

    # Add membership
    membership = Membership(user_id=user.id, team_id=team.id, role=invite.role)
    db.add(membership)
    db.commit()

    return {"message": f"{user.email} added to {team.name} as {invite.role}"}

@router.get("/{team_id}/members", response_model=List[MemberResponse])
def get_team_members(team_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all members of a team"""
    # Check if user is a member
    membership = db.query(Membership).filter(
        Membership.team_id == team_id,
        Membership.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this team")

    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    
    members = []
    for m in team.members:
        members.append({
            "id": m.user.id,
            "email": m.user.email,
            "username": m.user.username,
            "role": m.role
        })
    
    return members

@router.delete("/{team_id}/members/{user_id}")
def remove_member(
    team_id: int, 
    user_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Remove a member from the team"""
    # Check if current user is admin
    admin_membership = db.query(Membership).filter(
        Membership.team_id == team_id,
        Membership.user_id == current_user.id,
        Membership.role == "admin"
    ).first()
    
    if not admin_membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only team admins can remove members")

    # Find the membership to remove
    membership = db.query(Membership).filter(
        Membership.team_id == team_id,
        Membership.user_id == user_id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    db.delete(membership)
    db.commit()
    
    return {"message": "Member removed successfully"}

@router.delete("/{team_id}")
def delete_team(team_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a team"""
    # Check if current user is admin
    admin_membership = db.query(Membership).filter(
        Membership.team_id == team_id,
        Membership.user_id == current_user.id,
        Membership.role == "admin"
    ).first()
    
    if not admin_membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only team admins can delete teams")

    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    db.delete(team)
    db.commit()
    
    return {"message": "Team deleted successfully"}