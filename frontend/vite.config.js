import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
    define: {
      // Explicitly define the API URL for production builds
      "import.meta.env.VITE_API_URL": JSON.stringify(
        env.VITE_API_URL || "https://rushigo-backend.onrender.com/api"
      ),
    },
  };
});
