from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
import crud
from database import engine, get_db

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Simple Task Manager API", version="1.0.0")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def backend_root():
    return {"status": "Backend Server is Running Perfectly"}
    
@app.get("/api/tasks", response_model=List[schemas.Task])
def read_tasks(db: Session = Depends(get_db)):
    return crud.get_tasks(db)

@app.get("/api/tasks/{task_id}", response_model=schemas.Task)
def read_task(task_id: int, db: Session = Depends(get_db)):
    db_task = crud.get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@app.post("/api/tasks", response_model=schemas.Task, status_code=status.HTTP_201_CREATED)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    # Validate status
    if task.status not in ["To Do", "In Progress", "Done"]:
        raise HTTPException(status_code=400, detail="Invalid status value. Must be 'To Do', 'In Progress', or 'Done'")
    return crud.create_task(db=db, task=task)

@app.put("/api/tasks/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db)):
    db_task = crud.get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Validate status if provided
    if task_update.status is not None and task_update.status not in ["To Do", "In Progress", "Done"]:
        raise HTTPException(status_code=400, detail="Invalid status value. Must be 'To Do', 'In Progress', or 'Done'")
        
    return crud.update_task(db=db, db_task=db_task, task_update=task_update)

@app.patch("/api/tasks/{task_id}/status", response_model=schemas.Task)
def update_task_status(task_id: int, status_update: schemas.TaskStatusUpdate, db: Session = Depends(get_db)):
    db_task = crud.get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Create an update schema for just the status
    task_update = schemas.TaskUpdate(status=status_update.status)
    return crud.update_task(db=db, db_task=db_task, task_update=task_update)

@app.delete("/api/tasks/{task_id}", response_model=schemas.Task)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = crud.get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return crud.delete_task(db=db, db_task=db_task)
