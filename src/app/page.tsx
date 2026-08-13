import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TodoList from "@/components/TodoList";
import AuthForm from "@/components/AuthForm";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="container">
        <div className="card" style={{ marginTop: "4rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Todo App
          </h1>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
            Sign in or create an account to manage your todos.
          </p>
          <AuthForm />
        </div>
      </div>
    );
  }

  const { data: todos } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container">
      <div className="header">
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>My Todos</h1>
        <form action="/auth/signout" method="post">
          <button type="submit" className="btn btn-ghost">
            Sign out ({user.email})
          </button>
        </form>
      </div>
      <div className="card">
        <TodoList initialTodos={todos || []} userId={user.id} />
      </div>
    </div>
  );
}
