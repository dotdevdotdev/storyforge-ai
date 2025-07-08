import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";

/**
 * Middleware to ensure user is authenticated and add userId to request
 */
export async function withAuth(req, res, handler) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Add userId to request for easy access
  req.userId = session.user.id;
  req.userEmail = session.user.email;
  
  return handler(req, res);
}

/**
 * Middleware that allows anonymous access but adds userId if authenticated
 */
export async function withOptionalAuth(req, res, handler) {
  const session = await getServerSession(req, res, authOptions);
  
  if (session) {
    req.userId = session.user.id;
    req.userEmail = session.user.email;
  }
  
  return handler(req, res);
}