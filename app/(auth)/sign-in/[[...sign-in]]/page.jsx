// ============================================================
// FILE: app/(auth)/sign-in/page.jsx  (replace your current one)
// After Clerk signs the user in, we check DB for isAdmin
// and redirect accordingly.
// ============================================================
// 'use client'
// import { SignIn, useAuth } from '@clerk/nextjs'
// import { useEffect } from 'react'
// import { useRouter } from 'next/navigation'

// export default function SignInPage() {
//   const { isSignedIn, isLoaded } = useAuth()
//   const router = useRouter()

//   useEffect(() => {
//     // Only runs once Clerk has loaded AND the user is signed in
//     if (!isLoaded || !isSignedIn) return

//     // Ask our API which page this user should go to
//     fetch('/api/auth/redirect')
//       .then(res => res.json())
//       .then(data => {
//         router.replace(data.redirect ?? '/')
//       })
//       .catch(() => {
//         router.replace('/')
//       })
//   }, [isSignedIn, isLoaded, router])

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #3A6B35 0%, #6B3F1A 100%)',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center'
//     }}>
//       <SignIn
//         // Do NOT set afterSignInUrl here — we handle redirect ourselves above
//         redirectUrl="/sign-in"
//         appearance={{
//           variables: {
//             colorPrimary: '#3A6B35',
//             colorBackground: '#FDF6E3',
//             fontFamily: 'Nunito, sans-serif',
//             borderRadius: '12px',
//           }
//         }}
//       />
//     </div>
//   )
// }


// app/(auth)/sign-in/page.jsx — revert to this simple version
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #3A6B35 0%, #6B3F1A 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <SignIn appearance={{ variables: { colorPrimary: '#3A6B35', colorBackground: '#FDF6E3', fontFamily: 'Nunito, sans-serif', borderRadius: '12px' } }} />
    </div>
  )
}