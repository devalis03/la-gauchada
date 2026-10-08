import { FaWhatsapp } from "react-icons/fa"

const whatsappHref = "https://wa.me/5493815764026?text=Hola%2C%20quiero%20conocer%20m%C3%A1s%20sobre%20los%20productos%20de%20La%20Gauchada%20Mates."

export function WhatsappButton() {
  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
      aria-label="Contactar a La Gauchada Mates por WhatsApp"
      title="Contactar por WhatsApp"
    >
      <FaWhatsapp className="h-7 w-7" aria-hidden="true" />
    </a>
  )
}
