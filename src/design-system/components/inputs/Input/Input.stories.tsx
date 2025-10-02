import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { User, Mail, Lock, Search, Phone, CreditCard, Building, MapPin } from 'lucide-react';
import Input from './Input';

const meta: Meta<typeof Input> = {
  title: 'Design System/Inputs/Input',
  component: Input,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Componente de input versátil para formularios CRM con soporte para iconos, validación, estados y formatos mexicanos.'
      }
    }
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño del input'
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'Tipo de input'
    },
    fullWidth: {
      control: 'boolean',
      description: 'Si el input ocupa todo el ancho'
    },
    disabled: {
      control: 'boolean',
      description: 'Estado deshabilitado'
    },
    required: {
      control: 'boolean',
      description: 'Campo requerido'
    },
    loading: {
      control: 'boolean',
      description: 'Estado de carga'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia básica
export const Default: Story = {
  args: {
    label: 'Nombre',
    placeholder: 'Ingresa tu nombre',
    type: 'text'
  }
};

// Tamaños
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Input
        size="sm"
        label="Input pequeño"
        placeholder="Tamaño pequeño"
      />
      <Input
        size="md"
        label="Input mediano"
        placeholder="Tamaño mediano (por defecto)"
      />
      <Input
        size="lg"
        label="Input grande"
        placeholder="Tamaño grande"
      />
    </div>
  )
};

// Tipos de input
export const InputTypes: Story = {
  render: () => (
    <div className="space-y-4">
      <Input
        type="text"
        label="Texto"
        placeholder="Texto normal"
        leftIcon={<User />}
      />
      <Input
        type="email"
        label="Email"
        placeholder="usuario@ejemplo.com"
        leftIcon={<Mail />}
      />
      <Input
        type="password"
        label="Contraseña"
        placeholder="••••••••"
        leftIcon={<Lock />}
      />
      <Input
        type="number"
        label="Número"
        placeholder="123"
      />
      <Input
        type="tel"
        label="Teléfono"
        placeholder="+52 55 1234 5678"
        leftIcon={<Phone />}
      />
      <Input
        type="search"
        label="Búsqueda"
        placeholder="Buscar..."
        leftIcon={<Search />}
      />
    </div>
  )
};

// Con iconos
export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4">
      <Input
        label="Usuario"
        placeholder="Nombre de usuario"
        leftIcon={<User />}
      />
      <Input
        label="Email"
        placeholder="correo@empresa.com"
        leftIcon={<Mail />}
        rightIcon={<CreditCard />}
      />
      <Input
        label="Búsqueda"
        placeholder="Buscar clientes..."
        rightIcon={<Search />}
      />
    </div>
  )
};

// Estados de validación
export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-4">
      <Input
        label="Campo normal"
        placeholder="Sin validación"
        helperText="Este es un texto de ayuda"
      />
      <Input
        label="Campo exitoso"
        placeholder="Datos válidos"
        success="Los datos son válidos"
        value="datos@validos.com"
        leftIcon={<Mail />}
      />
      <Input
        label="Campo con error"
        placeholder="Datos inválidos"
        error="El formato del email es incorrecto"
        value="email-invalido"
        leftIcon={<Mail />}
      />
      <Input
        label="Campo cargando"
        placeholder="Validando..."
        loading
        value="validando@datos.com"
        leftIcon={<Mail />}
      />
    </div>
  )
};

// Estados del input
export const InputStates: Story = {
  render: () => (
    <div className="space-y-4">
      <Input
        label="Campo normal"
        placeholder="Estado normal"
      />
      <Input
        label="Campo requerido"
        placeholder="Campo obligatorio"
        required
      />
      <Input
        label="Campo deshabilitado"
        placeholder="No editable"
        disabled
        value="Valor deshabilitado"
      />
      <Input
        label="Campo de solo lectura"
        placeholder="Solo lectura"
        readOnly
        value="Solo lectura"
      />
    </div>
  )
};

// Formulario CRM mexicano
export const MexicanCRMForm: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      nombre: '',
      email: '',
      telefono: '',
      empresa: '',
      rfc: '',
      direccion: '',
      codigoPostal: ''
    });

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    return (
      <div className="max-w-2xl space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Registro de Cliente - CRM México
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre completo"
            placeholder="Juan Pérez García"
            value={formData.nombre}
            onChange={handleChange('nombre')}
            leftIcon={<User />}
            required
          />
          
          <Input
            label="Email"
            type="email"
            placeholder="juan.perez@empresa.com.mx"
            value={formData.email}
            onChange={handleChange('email')}
            leftIcon={<Mail />}
            required
          />
          
          <Input
            label="Teléfono"
            type="tel"
            placeholder="+52 55 1234 5678"
            value={formData.telefono}
            onChange={handleChange('telefono')}
            leftIcon={<Phone />}
            helperText="Incluye lada (ej: +52 55)"
          />
          
          <Input
            label="Empresa"
            placeholder="Empresa S.A. de C.V."
            value={formData.empresa}
            onChange={handleChange('empresa')}
            leftIcon={<Building />}
          />
          
          <Input
            label="RFC"
            placeholder="ABC123456789"
            value={formData.rfc}
            onChange={handleChange('rfc')}
            helperText="13 caracteres para persona física"
            maxLength={13}
          />
          
          <Input
            label="Código Postal"
            placeholder="06600"
            value={formData.codigoPostal}
            onChange={handleChange('codigoPostal')}
            leftIcon={<MapPin />}
            maxLength={5}
          />
        </div>
        
        <Input
          label="Dirección"
          placeholder="Av. Insurgentes Sur 123, Col. Roma Norte"
          value={formData.direccion}
          onChange={handleChange('direccion')}
          fullWidth
        />
      </div>
    );
  }
};

// Formulario de login
export const LoginForm: Story = {
  render: () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    };

    return (
      <div className="max-w-md mx-auto space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Iniciar Sesión - Nivexa CRM
        </h3>
        
        <Input
          label="Email corporativo"
          type="email"
          placeholder="usuario@empresa.com.mx"
          value={credentials.email}
          onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
          leftIcon={<Mail />}
          required
        />
        
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={credentials.password}
          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
          leftIcon={<Lock />}
          required
          onEnter={handleSubmit}
        />
        
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </div>
    );
  }
};

// Búsqueda avanzada
export const SearchForm: Story = {
  render: () => {
    const [searchTerms, setSearchTerms] = useState({
      general: '',
      cliente: '',
      proyecto: '',
      monto: ''
    });

    return (
      <div className="max-w-3xl space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Búsqueda Avanzada de CRM
        </h3>
        
        <Input
          size="lg"
          placeholder="Buscar en todo el sistema..."
          value={searchTerms.general}
          onChange={(e) => setSearchTerms(prev => ({ ...prev, general: e.target.value }))}
          leftIcon={<Search />}
          fullWidth
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Cliente"
            placeholder="Nombre o empresa"
            value={searchTerms.cliente}
            onChange={(e) => setSearchTerms(prev => ({ ...prev, cliente: e.target.value }))}
            leftIcon={<User />}
          />
          
          <Input
            label="Proyecto"
            placeholder="Código de proyecto"
            value={searchTerms.proyecto}
            onChange={(e) => setSearchTerms(prev => ({ ...prev, proyecto: e.target.value }))}
            leftIcon={<Building />}
          />
          
          <Input
            label="Monto (MXN)"
            type="number"
            placeholder="50000"
            value={searchTerms.monto}
            onChange={(e) => setSearchTerms(prev => ({ ...prev, monto: e.target.value }))}
            leftIcon={<CreditCard />}
          />
        </div>
      </div>
    );
  }
};

// Ancho completo
export const FullWidth: Story = {
  render: () => (
    <div className="space-y-4">
      <Input
        label="Input ancho completo"
        placeholder="Este input ocupa todo el ancho disponible"
        fullWidth
      />
      <Input
        label="Input ancho automático"
        placeholder="Este input tiene ancho automático"
      />
    </div>
  )
};