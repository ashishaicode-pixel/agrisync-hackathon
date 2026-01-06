import { supabase } from '../config/supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // First test basic connection with a simple query
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      
      // Check if it's a table not found error
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return {
          success: false,
          error: 'Table does not exist',
          message: 'Please create the crops table in your Supabase dashboard'
        };
      }
      
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('Crops table accessible, sample data:', data);
    
    return {
      success: true,
      message: 'Supabase connection established successfully',
      recordCount: data ? data.length : 0
    };
    
  } catch (error) {
    console.error('Connection test failed:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
};

export const createCropsTableIfNotExists = async () => {
  try {
    console.log('Checking if crops table exists...');
    
    // Try to query the table first
    const { data, error: queryError } = await supabase
      .from('crops')
      .select('id')
      .limit(1);
    
    if (queryError) {
      console.error('Error checking table:', queryError);
      
      if (queryError.code === 'PGRST116' || queryError.message.includes('does not exist')) {
        console.log('Crops table does not exist. Please create it manually in Supabase dashboard.');
        return {
          success: false,
          error: 'Table does not exist',
          message: 'Please create the crops table in your Supabase dashboard using the SQL provided in SUPABASE_SETUP.md'
        };
      }
      
      return {
        success: false,
        error: queryError.message,
        details: queryError
      };
    }
    
    console.log('✅ Crops table exists and is accessible');
    return {
      success: true,
      message: 'Crops table is ready'
    };
    
  } catch (error) {
    console.error('Table check failed:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
};