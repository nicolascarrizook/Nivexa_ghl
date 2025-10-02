import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { PhoneInput, type CountryOption } from './PhoneInput'

const meta: Meta<typeof PhoneInput> = {
  title: 'Design System/Inputs/PhoneInput',
  component: PhoneInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Input especializado para números telefónicos con soporte internacional, formateado automático y detección de WhatsApp.',
      },
    },
  },
  argTypes: {
    defaultCountry: {
      control: 'select',
      options: ['MX', 'US', 'CA', 'ES', 'AR', 'CO', 'CL', 'PE'],
      description: 'País por defecto',
    },
    placeholder: {
      control: 'text',
      description: 'Texto placeholder',
    },
    disabled: {
      control: 'boolean',
      description: 'Deshabilitar el input',
    },
    required: {
      control: 'boolean',
      description: 'Campo requerido',
    },
    showWhatsAppIcon: {
      control: 'boolean',
      description: 'Mostrar indicador de WhatsApp',
    },
    loading: {
      control: 'boolean',
      description: 'Estado de carga',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PhoneInput>

// Interactive wrapper component
function PhoneInputWrapper(args: any) {
  const [value, setValue] = useState<string>(args.value || '')
  const [formattedValue, setFormattedValue] = useState<string>('')
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null)

  const handleChange = (fullNumber: string, formatted: string, country: CountryOption) => {
    setValue(fullNumber)
    setFormattedValue(formatted)
    setSelectedCountry(country)
    console.log('Phone changed:', { fullNumber, formatted, country })
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <PhoneInput
        {...args}
        value={value}
        onChange={handleChange}
      />
      
      {/* Value display */}
      {value && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Información del teléfono:
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
            <div><strong>Número completo:</strong> {value}</div>
            <div><strong>Formateado:</strong> {formattedValue}</div>
            {selectedCountry && (
              <>
                <div><strong>País:</strong> {selectedCountry.flag} {selectedCountry.name}</div>
                <div><strong>Código:</strong> {selectedCountry.dialCode}</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const Default: Story = {
  render: (args) => <PhoneInputWrapper {...args} />,
  args: {
    defaultCountry: 'MX',
    placeholder: 'Número de teléfono',
    disabled: false,
    required: false,
    showWhatsAppIcon: true,
    loading: false,
  },
}

export const MexicanNumber: Story = {
  render: (args) => <PhoneInputWrapper {...args} />,
  args: {
    defaultCountry: 'MX',
    value: '+525512345678', // Mexican mobile number
    placeholder: 'Teléfono móvil mexicano',
    disabled: false,
    required: false,
    showWhatsAppIcon: true,
    loading: false,
  },
}

export const USNumber: Story = {
  render: (args) => <PhoneInputWrapper {...args} />,
  args: {
    defaultCountry: 'US',
    value: '+15551234567', // US number
    placeholder: 'US phone number',
    disabled: false,
    required: false,
    showWhatsAppIcon: true,
    loading: false,
  },
}

export const SpanishNumber: Story = {
  render: (args) => <PhoneInputWrapper {...args} />,
  args: {
    defaultCountry: 'ES',
    value: '+34612345678', // Spanish mobile
    placeholder: 'Teléfono español',
    disabled: false,
    required: false,
    showWhatsAppIcon: true,
    loading: false,
  },
}

export const WithoutWhatsApp: Story = {
  render: (args) => <PhoneInputWrapper {...args} />,
  args: {
    defaultCountry: 'MX',
    value: '+525512345678',
    placeholder: 'Sin indicador de WhatsApp',
    disabled: false,
    required: false,
    showWhatsAppIcon: false,
    loading: false,
  },
}

export const Required: Story = {
  render: (args) => <PhoneInputWrapper {...args} />,
  args: {
    defaultCountry: 'MX',
    placeholder: 'Teléfono requerido *',
    disabled: false,
    required: true,
    showWhatsAppIcon: true,
    loading: false,
  },
}

export const Disabled: Story = {
  render: (args) => <PhoneInputWrapper {...args} />,
  args: {
    defaultCountry: 'MX',
    value: '+525512345678',
    placeholder: 'Teléfono no editable',
    disabled: true,
    required: false,
    showWhatsAppIcon: true,
    loading: false,
  },
}

export const Loading: Story = {
  render: (args) => <PhoneInputWrapper {...args} />,
  args: {
    defaultCountry: 'MX',
    placeholder: 'Validando número...',
    disabled: false,
    required: false,
    showWhatsAppIcon: true,
    loading: true,
    value: '+525512345678',
  },
}

export const WithError: Story = {
  render: (args) => <PhoneInputWrapper {...args} />,
  args: {
    defaultCountry: 'MX',
    placeholder: 'Número telefónico',
    disabled: false,
    required: true,
    showWhatsAppIcon: true,
    loading: false,
    error: 'Número de teléfono inválido para México',
    value: '+52123', // Invalid Mexican number
  },
}

export const WithSuccess: Story = {
  render: (args) => <PhoneInputWrapper {...args} />,
  args: {
    defaultCountry: 'MX',
    placeholder: 'Teléfono verificado',
    disabled: false,
    required: false,
    showWhatsAppIcon: true,
    loading: false,
    success: 'Número válido y verificado',
    value: '+525512345678',
  },
}

export const LandlineNumber: Story = {
  render: (args) => <PhoneInputWrapper {...args} />,
  args: {
    defaultCountry: 'MX',
    value: '+525512345678', // Simulated landline (no WhatsApp)
    placeholder: 'Teléfono fijo',
    disabled: false,
    required: false,
    showWhatsAppIcon: true,
    loading: false,
  },
}

export const MultipleCountries: Story = {
  render: (args) => <PhoneInputWrapper {...args} />,
  args: {
    defaultCountry: 'MX',
    placeholder: 'Teléfono internacional',
    disabled: false,
    required: false,
    showWhatsAppIcon: true,
    loading: false,
  },
}

export const ArgentinianNumber: Story = {
  render: (args) => <PhoneInputWrapper {...args} />,
  args: {
    defaultCountry: 'AR',
    value: '+5491134567890', // Argentine mobile
    placeholder: 'Teléfono argentino',
    disabled: false,
    required: false,
    showWhatsAppIcon: true,
    loading: false,
  },
}

export const ColombianNumber: Story = {
  render: (args) => <PhoneInputWrapper {...args} />,
  args: {
    defaultCountry: 'CO',
    value: '+573001234567', // Colombian mobile
    placeholder: 'Teléfono colombiano',
    disabled: false,
    required: false,
    showWhatsAppIcon: true,
    loading: false,
  },
}

export const ChileanNumber: Story = {
  render: (args) => <PhoneInputWrapper {...args} />,
  args: {
    defaultCountry: 'CL',
    value: '+56987654321', // Chilean mobile
    placeholder: 'Teléfono chileno',
    disabled: false,
    required: false,
    showWhatsAppIcon: true,
    loading: false,
  },
}

export const PeruvianNumber: Story = {
  render: (args) => <PhoneInputWrapper {...args} />,
  args: {
    defaultCountry: 'PE',
    value: '+51987654321', // Peruvian mobile
    placeholder: 'Teléfono peruano',
    disabled: false,
    required: false,
    showWhatsAppIcon: true,
    loading: false,
  },
}