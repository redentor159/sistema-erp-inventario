
import { supabase } from "@/lib/supabase/client"
import { MstConfigGeneral, MstCliente, MstProveedor } from "@/types"
import { ConfigGeneralForm, ClienteForm, ProveedorForm } from "@/lib/validators/mst"

export const mstApi = {
    // Config General
    getConfig: async () => {
        const { data, error } = await supabase
            .from('mst_config_general')
            .select('*')
            .single()

        if (error) throw error
        return data as MstConfigGeneral
    },

    updateConfig: async (config: ConfigGeneralForm) => {
        // Upsert because it's a singleton, but usually we update by ID
        const { data, error } = await supabase
            .from('mst_config_general')
            .upsert(config)
            .select()
            .single()

        if (error) throw error
        return data as MstConfigGeneral
    },

    // Clientes
    getClientes: async () => {
        const { data, error } = await supabase
            .from('mst_clientes')
            .select('*')
            .order('nombre_completo')

        if (error) throw error
        return data as MstCliente[]
    },

    createCliente: async (cliente: ClienteForm) => {
        const { data, error } = await supabase
            .from('mst_clientes')
            .insert(cliente)
            .select()
            .single()

        if (error) throw error
        return data as MstCliente
    },

    // Proveedores
    getProveedores: async () => {
        const { data, error } = await supabase
            .from('mst_proveedores')
            .select('*')
            .order('razon_social')

        if (error) throw error
        return data as MstProveedor[]
    },

    getConfiguracion: async () => {
        const { data, error } = await supabase.from('mst_config_general').select('*').single()
        if (error) throw error
        return data as MstConfigGeneral
    },

    createProveedor: async (proveedor: ProveedorForm) => {
        const { data, error } = await supabase
            .from('mst_proveedores')
            .insert(proveedor)
            .select()
            .single()

        if (error) throw error
        return data as MstProveedor
    },

    updateCliente: async (cliente: ClienteForm) => {
        const { data, error } = await supabase
            .from('mst_clientes')
            .update(cliente)
            .eq('id_cliente', cliente.id_cliente)
            .select()
            .single()

        if (error) throw error
        return data as MstCliente
    },

    updateProveedor: async (proveedor: ProveedorForm) => {
        const { data, error } = await supabase
            .from('mst_proveedores')
            .update(proveedor)
            .eq('id_proveedor', proveedor.id_proveedor)
            .select()
            .single()

        if (error) throw error
        return data as MstProveedor
    },

    deleteCliente: async (id_cliente: string) => {
        const { error } = await supabase
            .from('mst_clientes')
            .delete()
            .eq('id_cliente', id_cliente)

        if (error) throw error
        return true
    },

    deleteProveedor: async (id_proveedor: string) => {
        const { error } = await supabase
            .from('mst_proveedores')
            .delete()
            .eq('id_proveedor', id_proveedor)

        if (error) throw error
        return true
    }
}
