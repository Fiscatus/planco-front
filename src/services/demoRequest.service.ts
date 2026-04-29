import { api } from './api'

export interface DemoRequestPayload {
  fullName: string
  email: string
  phone: string
  organization: string
  role: string
  organizationType: string
}

export async function submitDemoRequest(payload: DemoRequestPayload): Promise<void> {
  if (import.meta.env.VITE_DEMO_REQUEST_STUB === 'true') {
    await new Promise(resolve => setTimeout(resolve, 1200))
    return
  }
  await api.post('/demo-requests', payload)
}
