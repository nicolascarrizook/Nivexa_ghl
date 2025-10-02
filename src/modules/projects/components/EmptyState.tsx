import { Button } from "@/components/Button";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  FileX,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import React from "react";

interface EmptyStateProps {
  type?: "no-projects" | "no-results" | "no-data" | "error";
  title?: string;
  description?: string;
  icon?: React.ElementType;
  actionLabel?: string;
  onActionClick?: () => void;
  secondaryActionLabel?: string;
  onSecondaryActionClick?: () => void;
  className?: string;
  animated?: boolean;
  illustration?: "simple" | "detailed" | "none";
}

const EMPTY_STATE_CONFIG = {
  "no-projects": {
    icon: Building2,
    title: "Comienza tu primer proyecto",
    description:
      "Crea tu primer proyecto para gestionar clientes, pagos y progreso de manera profesional.",
    actionLabel: "Crear Proyecto",
    secondaryActionLabel: "Ver Guía",
    gradient: "from-blue-500 to-purple-600",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-700",
  },
  "no-results": {
    icon: Search,
    title: "No se encontraron proyectos",
    description:
      "Intenta ajustar los filtros de búsqueda o crear un nuevo proyecto.",
    actionLabel: "Limpiar Filtros",
    secondaryActionLabel: "Nuevo Proyecto",
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  "no-data": {
    icon: FileX,
    title: "Sin datos disponibles",
    description: "No hay información para mostrar en este momento.",
    actionLabel: "Actualizar",
    gradient: "from-gray-500 to-gray-600",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
  error: {
    icon: FileX,
    title: "Error al cargar",
    description:
      "Hubo un problema al cargar los proyectos. Intenta nuevamente.",
    actionLabel: "Reintentar",
    gradient: "from-red-500 to-red-600",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
} as const;

const FloatingIcon: React.FC<{
  icon: React.ElementType;
  className?: string;
  delay?: number;
}> = ({ icon: Icon, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{
      opacity: 0.3,
      y: 0,
      rotate: [0, 10, -10, 0],
    }}
    transition={{
      duration: 0.6,
      delay,
      rotate: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }}
    className={clsx(
      "absolute p-2 rounded-lg bg-white/50 backdrop-blur-sm border border-white/20",
      className
    )}
  >
    <Icon className="h-5 w-5 text-gray-400" />
  </motion.div>
);

const DetailedIllustration: React.FC<{
  type: keyof typeof EMPTY_STATE_CONFIG;
}> = ({ type }) => {
  const config = EMPTY_STATE_CONFIG[type];
  const MainIcon = config.icon;

  return (
    <div className="relative w-32 h-32 mx-auto">
      {/* Main icon container */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        className={clsx(
          "absolute inset-4 rounded-2xl flex items-center justify-center",
          "bg-gradient-to-br ",
          config.gradient
        )}
      >
        <MainIcon className="h-12 w-12 text-white" />

        {/* Shine effect */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "linear",
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
        />
      </motion.div>

      {/* Floating decorative icons */}
      <FloatingIcon icon={Plus} className="top-0 right-2" delay={0.2} />
      <FloatingIcon icon={Sparkles} className="bottom-2 left-0" delay={0.4} />
      <FloatingIcon icon={ArrowRight} className="top-8 -left-2" delay={0.6} />
    </div>
  );
};

const SimpleIllustration: React.FC<{
  type: keyof typeof EMPTY_STATE_CONFIG;
}> = ({ type }) => {
  const config = EMPTY_STATE_CONFIG[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 0.4,
        type: "spring",
        stiffness: 200,
      }}
      className={clsx(
        "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6",
        config.iconBg
      )}
    >
      <Icon className={clsx("h-8 w-8", config.iconColor)} />
    </motion.div>
  );
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = "no-projects",
  title: customTitle,
  description: customDescription,
  icon: CustomIcon,
  actionLabel: customActionLabel,
  onActionClick,
  secondaryActionLabel: customSecondaryActionLabel,
  onSecondaryActionClick,
  className,
  animated = true,
  illustration = "detailed",
}) => {
  const config = EMPTY_STATE_CONFIG[type];
  const Icon = CustomIcon || config.icon;

  const title = customTitle || config.title;
  const description = customDescription || config.description;
  const actionLabel = customActionLabel || config.actionLabel;
  const secondaryActionLabel =
    customSecondaryActionLabel || config.secondaryActionLabel;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={clsx(
        "flex flex-col items-center justify-center text-center",
        "bg-white rounded-xl border border-gray-200 p-8 lg:p-12",
        "min-h-[400px]",
        className
      )}
      variants={animated ? containerVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "visible" : undefined}
    >
      {/* Illustration */}
      <motion.div
        variants={animated ? itemVariants : undefined}
        className="mb-6"
      >
        {illustration === "detailed" && <DetailedIllustration type={type} />}
        {illustration === "simple" && <SimpleIllustration type={type} />}
        {illustration === "none" && (
          <div
            className={clsx(
              "w-12 h-12 mx-auto rounded-xl flex items-center justify-center",
              config.iconBg
            )}
          >
            <Icon className={clsx("h-6 w-6", config.iconColor)} />
          </div>
        )}
      </motion.div>

      {/* Content */}
      <motion.div
        variants={animated ? itemVariants : undefined}
        className="max-w-md mx-auto space-y-3"
      >
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </motion.div>

      {/* Actions */}
      <motion.div
        variants={animated ? itemVariants : undefined}
        className="flex flex-col sm:flex-row gap-3 mt-8"
      >
        {actionLabel && onActionClick && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="primary"
              size="md"
              onClick={onActionClick}
              className="inline-flex items-center px-6 py-2.5 font-medium rounded-lg "
            >
              <Icon className="h-4 w-4 mr-2" />
              {actionLabel}
            </Button>
          </motion.div>
        )}

        {secondaryActionLabel && onSecondaryActionClick && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="secondary"
              size="md"
              onClick={onSecondaryActionClick}
              className="inline-flex items-center px-6 py-2.5 font-medium rounded-lg"
            >
              {secondaryActionLabel}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Helpful tips for no-projects state */}
      {type === "no-projects" && (
        <motion.div
          variants={animated ? itemVariants : undefined}
          className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 max-w-lg"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 p-1 bg-gray-100 rounded-full">
              <Sparkles className="h-4 w-4 text-gray-700" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-medium text-gray-900">
                ¿Primera vez usando Nivexa?
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona proyectos arquitectónicos con seguimiento de pagos,
                progreso y documentos en un solo lugar.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
