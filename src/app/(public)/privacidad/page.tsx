import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Aviso de Privacidad - Enhorabuena",
}

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 bg-white rounded-2xl shadow-sm border border-slate-100 my-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Aviso de Privacidad</h1>
      
      <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
        <p>
          En <strong>Enhorabuena</strong> ("nosotros", "nuestro" o "la aplicación"), valoramos tu privacidad y estamos comprometidos con la protección de tus datos.
        </p>
        
        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. Recopilación de Información</h2>
        <p>
          Nuestra aplicación funciona principalmente como un catálogo digital para consulta de productos. <strong>No recopilamos ni almacenamos información personal identificable</strong> de los visitantes públicos sin su consentimiento explícito. No solicitamos registro ni cuentas de usuario para navegar por el catálogo o utilizar el carrito de cotizaciones.
        </p>

        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. Uso de Cookies</h2>
        <p>
          Utilizamos cookies técnicas y de rendimiento necesarias para el funcionamiento de la plataforma (por ejemplo, para mantener el estado del carrito de compras temporalmente en tu dispositivo o gestionar la sesión de administradores). Estas cookies no rastrean tu actividad fuera de nuestra aplicación.
        </p>

        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">3. Cotizaciones por WhatsApp</h2>
        <p>
          Cuando utilizas la función de "Enviar carrito por WhatsApp", la aplicación genera un mensaje predeterminado y te redirige a la aplicación de WhatsApp de tu dispositivo. Nosotros no interceptamos, leemos ni almacenamos los mensajes enviados a través de este medio, ya que la comunicación se realiza directamente desde tu dispositivo personal hacia nuestra línea de atención.
        </p>

        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">4. Analíticas</h2>
        <p>
          Es posible que utilicemos servicios de análisis web básicos para entender cómo interactúan los usuarios con el catálogo (como qué productos son más visitados) con el fin de mejorar nuestro servicio. Esta información es anónima y agregada.
        </p>

        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">5. Cambios a este Aviso</h2>
        <p>
          Nos reservamos el derecho de actualizar este Aviso de Privacidad en cualquier momento. Te recomendamos revisarlo periódicamente.
        </p>

        <p className="mt-8 text-sm italic">
          Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  )
}
