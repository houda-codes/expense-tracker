from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from database import get_db
import models
import schemas
import auth

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "https://expense-tracker-houda4.vercel.app",
    "https://expense-tracker-psi-one-93.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello, expense tracker!"}


@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = auth.hash_password(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_pw)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


@app.post("/expenses", response_model=schemas.ExpenseOut)
def create_expense(
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    new_expense = models.Expense(
        amount=expense.amount,
        category=expense.category,
        description=expense.description,
        date=expense.date,
        owner_id=current_user.id
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense
@app.get("/expenses", response_model=list[schemas.ExpenseOut])
def list_expenses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Expense).filter(models.Expense.owner_id == current_user.id).all()


@app.get("/expenses/{expense_id}", response_model=schemas.ExpenseOut)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.owner_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@app.put("/expenses/{expense_id}", response_model=schemas.ExpenseOut)
def update_expense(
    expense_id: int,
    updated: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.owner_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    expense.amount = updated.amount
    expense.category = updated.category
    expense.description = updated.description
    expense.date = updated.date

    db.commit()
    db.refresh(expense)
    return expense


@app.delete("/expenses/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.owner_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()
    return {"detail": "Expense deleted"}