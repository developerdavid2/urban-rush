"use client";
import { Button } from "@heroui/button";
import toast from "react-hot-toast";

const notify = () => toast.success("Here is your toast.");

export default function AdminOrderPage() {
  return (
    <div>
      <Button onPress={notify}>Make me a toast</Button>
    </div>
  );
}
