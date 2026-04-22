// scripts/seed-admin.ts
// Run with: bun run scripts/seed-admin.ts

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { config } from 'dotenv'

// Load .env before anything else
config()

import { UserModel } from '../models/User.ts'

const ADMIN_EMAIL    = 'admin@aipromptmanager.com'
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'ChangeMe123!'

async function seedAdmin(): Promise<void> {
  console.log('🌱 Connecting to MongoDB...')

  await mongoose.connect(process.env.DATABASE_URL!)

  console.log('✅ Connected')

  // Hash password manually — pre-save hook doesn't run on findOneAndUpdate
  const salt           = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt)

  const admin = await UserModel.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      $set: {
        email:    ADMIN_EMAIL,
        username: ADMIN_USERNAME,
        password: hashedPassword,
        role:     'admin',
      }
    },
    { upsert: true, returnDocument: 'after' }
  )

  console.log(`
✅ Admin user ready:
   ID:       ${admin._id}
   Email:    ${admin.email}
   Username: ${admin.username}
   Role:     ${admin.role}

⚠️  Change the password after first login!
  `)

  await mongoose.disconnect()
  process.exit(0)
}

seedAdmin().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})