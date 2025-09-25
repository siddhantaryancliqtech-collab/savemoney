import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res, next) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
});

// Get single category
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: category, error } = await supabase
      .from('categories')
      .select(`
        *,
        stores(*),
        offers(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    next(error);
  }
});

export default router;