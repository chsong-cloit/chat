import { AuthForm } from "@/components/auth-form"

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 via-background to-primary/10">
      <AuthForm />
    </main>
  )
}
