from pydantic import BaseModel, EmailStr
from datetime import date

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    

class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: str | None = None
    date: date

class ExpenseOut(BaseModel):
    id: int
    amount: float
    category: str
    description: str | None = None
    date: date

    class Config:
        from_attributes = True