import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all stores
router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      isPopular
    } = req.query;

    let query = supabase
      .from('stores')
      .select(`
        *,
        category:categories(*)
      `);

    // Apply filters
    if (category) {
      query = query.eq('category_id', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (isPopular === 'true') {
      query = query.eq('is_popular', true);
    }

    // Only show active stores
    query = query.eq('is_active', true);

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      success: true,
      data: {
        stores: data,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single store
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: store, error } = await supabase
      .from('stores')
      .select(`
        *,
        category:categories(*),
        offers(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: { store }
    });
  } catch (error) {
    next(error);
  }
});

// Create store (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const storeData = {
      ...req.body,
      slug: req.body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    };

    const { data: store, error } = await supabase
      .from('stores')
      .insert(storeData)
      .select(`
        *,
        category:categories(*)
      `)
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: { store }
    });
  } catch (error) {
    next(error);
  }
});

// Update store (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = {
      ...req.body,
      updated_at: new Date().toISOString(),
    };

    const { data: store, error } = await supabase
      .from('stores')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        category:categories(*)
      `)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Store updated successfully',
      data: { store }
    });
  } catch (error) {
    next(error);
  }
});

// Delete store (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Store deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get popular stores
router.get('/popular', async (req, res, next) => {
  try {
    const { data: stores, error } = await supabase
      .from('stores')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('is_popular', true)
      .eq('is_active', true)
      .order('total_clicks', { ascending: false })
      .limit(12);

    if (error) throw error;

    res.json({
      success: true,
      data: { stores }
    });
  } catch (error) {
    next(error);
  }
});

export default router;