export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          image: string
          category: string
          subcategory: string | null
          stock: number
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          description: string
          price: number
          image: string
          category: string
          subcategory?: string | null
          stock?: number
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          image?: string
          category?: string
          subcategory?: string | null
          stock?: number
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          items: Json
          customer: Json
          subtotal: number
          shipping: number
          total: number
          status: string
          payment_method: string
          transference_status: string | null
          payment_status: string
          payment_id: string | null
          external_reference: string | null
          stock_restored: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          items: Json
          customer: Json
          subtotal: number
          shipping: number
          total: number
          status?: string
          payment_method: string
          transference_status?: string | null
          payment_status?: string
          payment_id?: string | null
          external_reference?: string | null
          stock_restored?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          items?: Json
          customer?: Json
          subtotal?: number
          shipping?: number
          total?: number
          status?: string
          payment_method?: string
          transference_status?: string | null
          payment_status?: string
          payment_id?: string | null
          external_reference?: string | null
          stock_restored?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          role: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_notifications: {
        Row: {
          payment_id: string
          processed_at: string
        }
        Insert: {
          payment_id: string
          processed_at?: string
        }
        Update: {
          payment_id?: string
          processed_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_product_stock: {
        Args: { p_id: string; p_quantity: number }
        Returns: { id: string; stock: number }[]
      }
      increment_product_stock: {
        Args: { p_id: string; p_quantity: number }
        Returns: { id: string; stock: number }[]
      }
      restore_order_stock: {
        Args: { p_order_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
