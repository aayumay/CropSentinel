"""
API router for farmer mobile-based authentication.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.auth_service import get_or_create_user, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    phone_number: str = Field(..., description="Farmer's mobile phone number")

class UserResponse(BaseModel):
    id: int
    phone_number: str

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Passwordless mobile authentication. Resolves or creates a user account
    and returns a JWT bearer access token.
    """
    phone = request.phone_number.strip()
    if not phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number cannot be empty."
        )
    
    user = get_or_create_user(db, phone)
    
    # Generate token containing user metadata
    token_data = {"sub": str(user.id), "phone_number": user.phone_number}
    token = create_access_token(token_data)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }
