import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Box, Button, CircularProgress, MenuItem, TextField, Alert } from '@mui/material'
import { Link } from 'react-router-dom'
import {
  BLUE_500, BLUE_600, INK_100, INK_500, INK_600, INK_900,
  SHADOW_XL,
} from '@/pages/Landing/constants'
import { LandingNavbar } from '@/pages/Landing/components/LandingNavbar'
import { LandingFooter } from '@/pages/Landing/components/LandingFooter'
import { submitDemoRequest } from '@/services/demoRequest.service'

const schema = z.object({
  fullName:         z.string().min(1, 'Campo obrigatório'),
  email:            z.string().email('E-mail inválido'),
  phone:            z.string().refine(v => v.replace(/\D/g, '').length >= 10, 'Mínimo 10 dígitos'),
  organization:     z.string().min(1, 'Campo obrigatório'),
  role:             z.string().min(1, 'Campo obrigatório'),
  organizationType: z.string().min(1, 'Campo obrigatório'),
})

type FormValues = z.infer<typeof schema>

const ROLE_OPTIONS = [
  'Gestor público',
  'Diretor',
  'Coordenador',
  'Servidor técnico',
  'TI / Tecnologia',
  'Outro',
]

const ORGANIZATION_TYPES = [
  'Prefeitura',
  'Secretaria estadual',
  'Autarquia',
  'Instituto federal',
  'Universidade',
  'Câmara legislativa',
  'Tribunal',
  'Outro',
]

const TRUST_ITEMS = [
  'Demonstração gratuita e sem compromisso',
  'Atendimento especializado para órgãos públicos',
  'Aderente à Lei 14.133 e LGPD',
]

const PAGE_CONTAINER = {
  width: '100%',
  maxWidth: '900px',
  mx: 'auto',
  px: '32px',
} as const

const FIELD_SX = {
  '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '14px' },
  '& .MuiInputLabel-root': { fontSize: '14px' },
} as const

const IconCheck = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M20 6 9 17l-5-5' />
  </svg>
)

const IconCheckCircle = () => (
  <svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='12' cy='12' r='10' /><path d='m9 12 2 2 4-4' />
  </svg>
)

const DemoRequestPage = () => {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    try {
      await submitDemoRequest(data)
      setSubmitted(true)
    } catch {
      setServerError('Ocorreu um erro ao enviar sua solicitação. Tente novamente em alguns instantes.')
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: `radial-gradient(ellipse 80% 300px at 50% 0%, rgba(25,118,210,0.06), transparent 70%), linear-gradient(180deg, #F0F6FE 0%, #fff 100%)`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${INK_100} 1px, transparent 1px), linear-gradient(90deg, ${INK_100} 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
          backgroundPosition: '-1px -1px',
          maskImage: 'radial-gradient(ellipse 70% 30% at 50% 0%, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 30% at 50% 0%, black 0%, transparent 70%)',
          opacity: 0.45,
          pointerEvents: 'none',
        },
      }}
    >
      <LandingNavbar />

      <Box component='main' sx={{ position: 'relative', flex: 1, pb: '48px' }}>
        {/* Hero */}
        <Box sx={{ ...PAGE_CONTAINER, textAlign: 'center', pt: '72px', pb: '48px' }}>
          <Box
            component='span'
            sx={{
              display: 'inline-block',
              fontSize: '12px',
              color: BLUE_500,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              mb: '14px',
            }}
          >
            Fale com nossa equipe
          </Box>
          <Box
            component='h1'
            sx={{
              fontSize: 'clamp(30px, 3.6vw, 44px)',
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              color: INK_900,
              fontWeight: 600,
              m: 0,
              mb: '16px',
            }}
          >
            Solicitar demonstração
          </Box>
          <Box
            component='p'
            sx={{
              fontSize: '17px',
              lineHeight: 1.55,
              color: INK_600,
              maxWidth: '520px',
              mx: 'auto',
              mt: 0,
              mb: 0,
              textAlign: 'center',
              fontWeight: 400,
            }}
          >
            Preencha o formulário e nossa equipe entrará em contato em até 1 dia útil para agendar uma demonstração personalizada.
          </Box>
        </Box>

        {/* Form card */}
        <Box sx={PAGE_CONTAINER}>
          <Box
            sx={{
              maxWidth: '680px',
              mx: 'auto',
              background: '#fff',
              border: `1px solid ${INK_100}`,
              borderRadius: '16px',
              boxShadow: SHADOW_XL,
              p: { xs: '28px 24px', sm: '40px 48px' },
            }}
          >
            {submitted ? (
              <Box sx={{ textAlign: 'center', py: '32px' }}>
                <Box sx={{ color: BLUE_500, mb: '16px', display: 'flex', justifyContent: 'center' }}>
                  <IconCheckCircle />
                </Box>
                <Box
                  component='h2'
                  sx={{ fontSize: '22px', fontWeight: 600, color: INK_900, m: 0, mb: '12px', letterSpacing: '-0.015em' }}
                >
                  Solicitação enviada!
                </Box>
                <Box component='p' sx={{ fontSize: '15px', color: INK_600, lineHeight: 1.6, m: 0, mb: '28px' }}>
                  Recebemos sua solicitação. Nossa equipe entrará em contato em até 1 dia útil para agendar a demonstração.
                </Box>
                <Button
                  component={Link}
                  to='/'
                  disableElevation
                  sx={{
                    background: BLUE_500,
                    color: '#fff',
                    fontWeight: 500,
                    fontSize: '14px',
                    textTransform: 'none',
                    px: '22px',
                    height: '44px',
                    borderRadius: '8px',
                    '&:hover': { background: BLUE_600 },
                  }}
                >
                  Voltar ao início
                </Button>
              </Box>
            ) : (
              <Box component='form' onSubmit={handleSubmit(onSubmit)} noValidate>
                <Box sx={{ display: 'grid', gap: '20px' }}>
                  {/* Row 1: Nome completo */}
                  <Controller
                    name='fullName'
                    control={control}
                    defaultValue=''
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label='Nome completo'
                        fullWidth
                        size='small'
                        disabled={isSubmitting}
                        error={!!errors.fullName}
                        helperText={errors.fullName?.message}
                        sx={FIELD_SX}
                      />
                    )}
                  />

                  {/* Row 2: E-mail | Telefone */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '20px' }}>
                    <Controller
                      name='email'
                      control={control}
                      defaultValue=''
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label='E-mail'
                          type='email'
                          fullWidth
                          size='small'
                          disabled={isSubmitting}
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          sx={FIELD_SX}
                        />
                      )}
                    />
                    <Controller
                      name='phone'
                      control={control}
                      defaultValue=''
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label='Telefone / WhatsApp'
                          type='tel'
                          fullWidth
                          size='small'
                          disabled={isSubmitting}
                          error={!!errors.phone}
                          helperText={errors.phone?.message}
                          sx={FIELD_SX}
                        />
                      )}
                    />
                  </Box>

                  {/* Row 3: Organização | Cargo */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '20px' }}>
                    <Controller
                      name='organization'
                      control={control}
                      defaultValue=''
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label='Nome da organização'
                          fullWidth
                          size='small'
                          disabled={isSubmitting}
                          error={!!errors.organization}
                          helperText={errors.organization?.message}
                          sx={FIELD_SX}
                        />
                      )}
                    />
                    <Controller
                      name='role'
                      control={control}
                      defaultValue=''
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          label='Cargo / função'
                          fullWidth
                          size='small'
                          disabled={isSubmitting}
                          error={!!errors.role}
                          helperText={errors.role?.message}
                          sx={FIELD_SX}
                        >
                          {ROLE_OPTIONS.map(opt => (
                            <MenuItem key={opt} value={opt} sx={{ fontSize: '14px' }}>{opt}</MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Box>

                  {/* Row 4: Tipo de organização */}
                  <Controller
                    name='organizationType'
                    control={control}
                    defaultValue=''
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label='Tipo de organização'
                        fullWidth
                        size='small'
                        disabled={isSubmitting}
                        error={!!errors.organizationType}
                        helperText={errors.organizationType?.message}
                        sx={FIELD_SX}
                      >
                        {ORGANIZATION_TYPES.map(opt => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: '14px' }}>{opt}</MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  {serverError && (
                    <Alert severity='error' sx={{ borderRadius: '8px', fontSize: '13px' }}>
                      {serverError}
                    </Alert>
                  )}

                  {/* Submit */}
                  <Button
                    type='submit'
                    fullWidth
                    disableElevation
                    disabled={isSubmitting}
                    sx={{
                      background: BLUE_500,
                      color: '#fff',
                      fontWeight: 500,
                      fontSize: '15px',
                      textTransform: 'none',
                      height: '46px',
                      borderRadius: '8px',
                      gap: '8px',
                      boxShadow: '0 1px 2px rgba(25, 118, 210, 0.18)',
                      '&:hover': { background: BLUE_600, boxShadow: '0 4px 10px rgba(25, 118, 210, 0.25)' },
                      '&:disabled': { background: BLUE_500, opacity: 0.7, color: '#fff' },
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <CircularProgress size={18} sx={{ color: '#fff' }} />
                        Enviando…
                      </>
                    ) : (
                      'Solicitar demonstração'
                    )}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

          {/* Trust block — below form card, horizontal */}
          <Box
            sx={{
              maxWidth: '680px',
              mx: 'auto',
              mt: '24px',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'center',
              gap: { xs: '12px', sm: '32px' },
            }}
          >
            {TRUST_ITEMS.map(item => (
              <Box
                key={item}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#E8F5E9',
                    color: '#2E7D32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconCheck />
                </Box>
                <Box component='span' sx={{ fontSize: '13px', color: INK_500, lineHeight: 1.4 }}>
                  {item}
                </Box>
              </Box>
            ))}
          </Box>

          {/* LGPD note */}
          <Box sx={{ maxWidth: '680px', mx: 'auto', mt: '16px', textAlign: 'center' }}>
            <Box component='span' sx={{ fontSize: '12px', color: INK_500 }}>
              Suas informações são tratadas com confidencialidade, em conformidade com a LGPD.
            </Box>
          </Box>
        </Box>
      </Box>

      <LandingFooter />
    </Box>
  )
}

export default DemoRequestPage
