// app/api/admin/messages/[id]/route.js
import { connectDB } from "@/lib/mongodb";
import { withAuth } from "@/lib/auth";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";
import Contact from "@/models/Contact";
import mongoose from "mongoose";

export const PATCH = withAuth(
  withErrorHandler(async (request, { params }) => {
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return apiError("Invalid message ID.", 400);
    }

    const { status } = await request.json();

    if (!["new", "read", "replied"].includes(status)) {
      return apiError("Invalid status. Must be: new, read, or replied.", 400);
    }

    await connectDB();

    const message = await Contact.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!message) return apiError("Message not found.", 404);

    return apiSuccess({ message }, "Message status updated.");
  }),
  { adminOnly: true }
);

export const DELETE = withAuth(
  withErrorHandler(async (request, { params }) => {
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return apiError("Invalid message ID.", 400);
    }

    await connectDB();
    const message = await Contact.findByIdAndDelete(params.id);
    if (!message) return apiError("Message not found.", 404);

    return apiSuccess({}, "Message deleted.");
  }),
  { adminOnly: true }
);
