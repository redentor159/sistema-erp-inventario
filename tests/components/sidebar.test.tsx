import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AppSidebar } from '../../components/dashboard/app-sidebar'

// Mock UserNav since it has its own complex fetching logic
vi.mock('../../components/dashboard/user-nav', () => ({
    UserNav: () => <div data-testid="user-nav-mock">User Nav</div>
}))

describe('AppSidebar Component', () => {
    it('debe renderizar todos los enlaces principales (dashboard)', () => {
        render(<AppSidebar />)

        expect(screen.getByText('Panel Principal')).toBeInTheDocument()
        expect(screen.getByText('Catálogo')).toBeInTheDocument()
        expect(screen.getByText('Inventario (Kardex)')).toBeInTheDocument()
        expect(screen.getByText('Cotizaciones')).toBeInTheDocument()
        expect(screen.getByText('Producción')).toBeInTheDocument()
    })

    it('debe renderizar el título del ERP', () => {
        render(<AppSidebar />)
        expect(screen.getByText('ERP/WMS')).toBeInTheDocument()
    })

    it('debe poder colapsarse al hacer clic en el botón', () => {
        const { container } = render(<AppSidebar />)

        // El logo está visible inicialmente
        expect(screen.getByText('ERP/WMS')).toBeInTheDocument()

        // Buscar el botón de colapsar (primer button dentro del sidebar h-16)
        const toggleButton = container.querySelector('button')
        expect(toggleButton).not.toBeNull()

        // Hacemos clic para colapsar
        fireEvent.click(toggleButton!)

        // El título del ERP debería desaparecer
        expect(screen.queryByText('ERP/WMS')).not.toBeInTheDocument()

        // Los textos de los enlaces deberían desaparecer (solo quedan los iconos y tooltips)
        expect(screen.queryByText('Panel Principal')).not.toBeInTheDocument()
    })

    it('debe renderizar los menús de configuración y reportes', () => {
        render(<AppSidebar />)
        expect(screen.getByText('Configuración')).toBeInTheDocument()
        expect(screen.getByText('Exportar Datos')).toBeInTheDocument()
    })
})
