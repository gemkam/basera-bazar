import { supabase } from "@/lib/supabase";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const { data: categories } = await supabase.from("categories").select("*").order("name");
  return <AdminDashboard categories={categories || []} />;
}
