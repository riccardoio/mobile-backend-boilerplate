import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@/services/supabase'
import { Database } from '@/config/database'
import { User } from '@/entities/User'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    supabaseId: string
    dbUserId: string
  }
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    // Verify JWT with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return res.status(403).json({ error: 'Invalid token' })
    }

    // Ensure we have a DB user and organization
    const userRepo = Database.getRepository(User)

    let dbUser = await userRepo.findOne({ where: { supabaseId: user.id } })

    if (!dbUser) {

      // Create user belonging to org
      dbUser = userRepo.create({
        supabaseId: user.id,
        email: user.email!,
        isPaid: false,
        plan: 'free',
      })
      await userRepo.save(dbUser)
    } 

    // Add enriched user info to request
    req.user = {
      id: user.id,
      email: user.email!,
      supabaseId: user.id,
      dbUserId: dbUser.id,
    }
    
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Token verification failed' })
  }
}
