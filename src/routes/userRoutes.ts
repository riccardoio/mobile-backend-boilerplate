import { Router } from 'express'
import { User } from '@/entities/User'
import { Database } from '@/config/database'
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth'

const router = Router()
const userRepository = Database.getRepository(User)

// Get current user
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await userRepository.findOne({
      where: { supabaseId: req.user!.supabaseId }
    })
    
    if (!user) {
      res.status(404).json({ error: 'User not found' })
    }

    res.json({
      ...user,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create/Update user from Supabase
router.post('/sync', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { email, plan = 'free' } = req.body
    
    let user = await userRepository.findOne({
      where: { supabaseId: req.user!.supabaseId }
    })
    
    if (!user) {
      // Org and user are already lazily provisioned in auth middleware.
      user = await userRepository.findOne({ where: { supabaseId: req.user!.supabaseId } })
    } else {
      // Update existing user
      user.email = req.user!.email
      user.plan = plan
    }
    
    await userRepository.save(user)
    res.json({
      ...user,
    })
  } catch (error) {
    console.error('Error syncing user:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
