import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #3A6B35 0%, #6B3F1A 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <SignUp appearance={{
                variables: {
                    colorPrimary: '#3A6B35',
                    colorBackground: '#FDF6E3',
                    fontFamily: 'Nunito, sans-serif',
                    borderRadius: '12px',
                }
            }} />
        </div>
    )
}