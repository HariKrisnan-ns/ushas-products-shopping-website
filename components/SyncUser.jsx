import { getOrCreateUser } from '@/lib/getOrCreateUser'

export default async function SyncUser() {
    // Silently ensure the signed-in user exists in the DB.
    // If user already exists → returns existing (no duplicate).
    // If user is not signed in → returns null (no error).
    await getOrCreateUser()
    return null // renders nothing
}
