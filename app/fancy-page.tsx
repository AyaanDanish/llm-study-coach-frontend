import FancyDashboard from "@/components/fancy-dashboard"

// Mock user data
const mockUser = {
  id: "user123",
  nickname: "Demo User",
  studentId: "STUD12345",
  studyHours: 2,
  flashcardTarget: 20,
  completedOnboarding: true,
}

export default function FancyPage() {
  return <FancyDashboard user={mockUser} />
}
