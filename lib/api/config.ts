
import { supabase } from "@/lib/supabase/client"

export const configApi = {
    getConfig: async () => {
        const { data, error } = await supabase
            .from('mst_config_general')
            .select('*')
            .eq('id_config', 'CONFIG_MAIN')
            .single()

        if (error) throw error
        return data
    },

    updateConfig: async (updates: any) => {
        const { data, error } = await supabase
            .from('mst_config_general')
            .update(updates)
            .eq('id_config', 'CONFIG_MAIN')
            .select()
            .single()

        if (error) throw error
        return data
    }
}
