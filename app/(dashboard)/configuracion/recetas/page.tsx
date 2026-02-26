import { Metadata } from "next";
import { RecipeEditorPage } from "@/components/mto/recipe-editor-page";

export const metadata: Metadata = {
  title: "Editor de Recetas | ERP Vidriería",
  description: "Gestión de recetas de ingeniería para ventanas y puertas",
};

export default function RecetasPage() {
  return <RecipeEditorPage />;
}
