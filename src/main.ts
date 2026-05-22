import { bootstrapApplication } from "./core/app/bootstrap";

const mountElement = document.getElementById("app");

if (!mountElement) {
  throw new Error("Missing #app mount element.");
}

bootstrapApplication(mountElement).catch((error: unknown) => {
  console.error("Failed to bootstrap app:", error);
});
