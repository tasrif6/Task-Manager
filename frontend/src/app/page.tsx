"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  AlertCircle 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: "To Do" | "In Progress" | "Done";
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for Create
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStatus, setNewStatus] = useState<"To Do" | "In Progress" | "Done">("To Do");

  // Form states for Edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<"To Do" | "In Progress" | "Done">("To Do");

  // Fetch tasks on load
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      if (!res.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await res.json();
      setTasks(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Unable to load tasks. Please ensure the backend is running and connected.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription || null,
          status: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create task");
      }

      await fetchTasks();
      setIsCreateOpen(false);
      // Reset fields
      setNewTitle("");
      setNewDescription("");
      setNewStatus("To Do");
    } catch (err) {
      console.error(err);
      alert("Error creating task. Please try again.");
    }
  };

  // Update status
  const handleStatusChange = async (taskId: number, newStatusVal: "To Do" | "In Progress" | "Done") => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatusVal }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      // Optimistic updates
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, status: newStatusVal } : task
        )
      );
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  // Open Edit Modal
  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditStatus(task.status);
    setIsEditOpen(true);
  };

  // Save Edit task
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    try {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription || null,
          status: editStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update task");
      }

      await fetchTasks();
      setIsEditOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error(err);
      alert("Error updating task. Please try again.");
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete task");
      }

      // Optimistic update
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  // Filter tasks by column
  const getTasksByStatus = (statusVal: "To Do" | "In Progress" | "Done") => {
    return tasks.filter(task => task.status === statusVal);
  };

  // Format date nicely
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-blue-200">
      
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/10">
              T
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">TaskFlow</h1>
              <p className="text-xs text-zinc-400 -mt-0.5">Simple Task Manager</p>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="text-md bg-blue-600 hover:bg-blue-500 cursor-pointer text-white font-medium shadow-lg shadow-blue-600/10 gap-1.5 transition-all hover:scale-[1.15] active:scale-[0.98] "
          >
            <Plus className="size-6" /> Add Task
          </Button>
        </div>
      </header>

      {/* Main Board */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {error && (
          <div className="rounded-lg bg-red-950/30 border border-red-800/40 p-4 text-sm text-red-200 flex items-start gap-3 shadow-inner">
            <AlertCircle className="size-5 shrink-0 text-red-400" />
            <div>
              <p className="font-semibold">Connection Status</p>
              <p className="text-red-300/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 text-zinc-400">
            <div className="size-8 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin" />
            <p className="text-sm font-medium">Loading tasks...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Columns */}
            {[
              {
                id: "To Do",
                title: "To Do",
                color: "border-amber-500/20 bg-amber-500/5 text-amber-400",
                icon: <ListTodo className="size-6 text-amber-400" />,
                accentColor: "bg-amber-400"
              },
              {
                id: "In Progress",
                title: "In Progress",
                color: "border-blue-500/20 bg-blue-500/5 text-blue-400",
                icon: <Clock className="size-6 text-blue-400" />,
                accentColor: "bg-blue-400"
              },
              {
                id: "Done",
                title: "Done",
                color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
                icon: <CheckCircle2 className="size-6 text-emerald-400" />,
                accentColor: "bg-emerald-400"
              }
            ].map(col => {
              const colTasks = getTasksByStatus(col.id as any);
              return (
                <div key={col.id} className="flex flex-col gap-4 bg-zinc-950/30 border border-zinc-800/50 rounded-xl p-4 min-h-[500px]">
                  
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-md ${col.color.split(" ")[0]} ${col.color.split(" ")[1]}`}>
                        {col.icon}
                      </span>
                      <h2 className="font-semibold text-zinc-100 text-sm tracking-wide text-md cursor-pointer">{col.title}</h2>
                    </div>
                    <span className="text-xs bg-zinc-800/50 text-zinc-400 px-2.5 py-1 rounded-full font-semibold">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Cards container */}
                  <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1">
                    {colTasks.length === 0 ? (
                      <div className="border border-dashed border-zinc-800 rounded-lg p-8 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
                        No tasks in this list
                      </div>
                    ) : (
                      colTasks.map(task => (
                        <Card 
                          key={task.id} 
                          className="bg-zinc-900/40 border-zinc-800 hover:border-zinc-700/80 hover:bg-zinc-900/60 transition-all duration-200 shadow-md group/card overflow-visible"
                        >
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-start justify-between gap-3">
                              <CardTitle className="text-zinc-100 font-medium text-sm leading-tight break-words flex-1 group-hover/card:text-white transition-colors">
                                {task.title}
                              </CardTitle>
                              
                              <div className="flex items-center gap-1 opacity-60 group-hover/card:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => openEditModal(task)}
                                  className="p-1 rounded-md text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 transition-colors"
                                  title="Edit Task"
                                >
                                  <Edit className="size-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1 rounded-md text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                                  title="Delete Task"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="px-4 py-0">
                            {task.description ? (
                              <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed break-words">
                                {task.description}
                              </p>
                            ) : (
                              <p className="text-xs text-zinc-600 italic">No description provided</p>
                            )}
                          </CardContent>

                          <CardFooter className="p-4 pt-3 flex items-center justify-between border-t border-zinc-800/40 mt-3 gap-2 bg-zinc-950/20">
                            <span className="text-[10px] text-zinc-500 font-medium">
                              {formatDate(task.created_at)}
                            </span>
                            
                            <Select 
                              value={task.status} 
                              onValueChange={(val) => handleStatusChange(task.id, val as any)}
                            >
                              <SelectTrigger className="h-6 text-[10px] py-0 px-2 rounded-md bg-zinc-950/40 border-zinc-800 text-zinc-300 font-medium hover:bg-zinc-950/80 focus:ring-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                <SelectItem value="To Do" className="text-xs focus:bg-zinc-800">To Do</SelectItem>
                                <SelectItem value="In Progress" className="text-xs focus:bg-zinc-800">In Progress</SelectItem>
                                <SelectItem value="Done" className="text-xs focus:bg-zinc-800">Done</SelectItem>
                              </SelectContent>
                            </Select>
                          </CardFooter>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        )}
      </main>

      {/* Dialog for Creating Task */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-sm rounded-xl animate-in fade-in-50 duration-200">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 font-semibold text-lg">New Task</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Add details for the new task.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Title</label>
              <Input 
                required 
                maxLength={100}
                value={newTitle} 
                onChange={(e) => setNewTitle(e.target.value)} 
                placeholder="Write a task title..." 
                className="bg-zinc-950/60 border-zinc-800 text-zinc-100 text-sm placeholder-zinc-600 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Description</label>
              <Textarea 
                value={newDescription} 
                onChange={(e) => setNewDescription(e.target.value)} 
                placeholder="Optional task description..." 
                className="bg-zinc-950/60 border-zinc-800 text-zinc-100 text-sm placeholder-zinc-600 min-h-[80px] focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 resize-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Status</label>
              <Select 
                value={newStatus} 
                onValueChange={(val) => setNewStatus(val as any)}
              >
                <SelectTrigger className="w-full bg-zinc-950/60 border-zinc-800 text-zinc-100 text-sm focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                  <SelectItem value="To Do" className="text-sm focus:bg-zinc-800">To Do</SelectItem>
                  <SelectItem value="In Progress" className="text-sm focus:bg-zinc-800">In Progress</SelectItem>
                  <SelectItem value="Done" className="text-sm focus:bg-zinc-800">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2 flex flex-row justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateOpen(false)}
                className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                Add Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for Editing Task */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-sm rounded-xl animate-in fade-in-50 duration-200">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 font-semibold text-lg">Edit Task</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Modify your task details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Title</label>
              <Input 
                required 
                maxLength={100}
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)} 
                placeholder="Task title" 
                className="bg-zinc-950/60 border-zinc-800 text-zinc-100 text-sm focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Description</label>
              <Textarea 
                value={editDescription} 
                onChange={(e) => setEditDescription(e.target.value)} 
                placeholder="Optional task description..." 
                className="bg-zinc-950/60 border-zinc-800 text-zinc-100 text-sm min-h-[80px] focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 resize-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Status</label>
              <Select 
                value={editStatus} 
                onValueChange={(val) => setEditStatus(val as any)}
              >
                <SelectTrigger className="w-full bg-zinc-950/60 border-zinc-800 text-zinc-100 text-sm focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                  <SelectItem value="To Do" className="text-sm focus:bg-zinc-800">To Do</SelectItem>
                  <SelectItem value="In Progress" className="text-sm focus:bg-zinc-800">In Progress</SelectItem>
                  <SelectItem value="Done" className="text-sm focus:bg-zinc-800">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2 flex flex-row justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setIsEditOpen(false); setEditingTask(null); }}
                className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
