import { useEffect, useState } from "react"

export default function useCurrentHour() {
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours())

  useEffect(() => {
    const interval = setInterval(() => {
      const hour = new Date().getHours()
      setCurrentHour(hour)
    }, 60 * 1000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  return currentHour
}
