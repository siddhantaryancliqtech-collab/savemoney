import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all offers
router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      storeId,
      offerType,
      minCashback,
      maxCashback,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      isExclusive,
      isTrending
    } = req.query;

    let query = supabase
      .from('offers')
      .select(`
        *,
        store:stores(*),
        category:categories(*)
      `);

    // Apply filters
    if (category) {
      query = query.eq('category_id', category);
    }

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    if (offerType) {
      query = query.eq('offer_type', offerType);
    }

    if (minCashback) {
      query = query.gte('cashback_rate', parseFloat(minCashback));
    }

    if (maxCashback) {
      query = query.lte('cashback_rate', parseFloat(maxCashback));
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (isExclusive === 'true') {
      query = query.eq('is_exclusive', true);
    }

    if (isTrending === 'true') {
      query = query.eq('is_trending', true);
    }

    // Only show active and non-expired offers
    query = query.eq('is_active', true);
    query = query.or('expiry_date.is.null,expiry_date.gt.now()');

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
        offers: data,
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

// Get trending offers
router.get('/trending', async (req, res, next) => {
  try {
    const { data: offers, error } = await supabase
      .from('offers')
      .select(`
        *,
        store:stores(*),
        category:categories(*)
      `)
      .eq('is_trending', true)
      .eq('is_active', true)
      .or('expiry_date.is.null,expiry_date.gt.now()')
      .order('click_count', { ascending: false })
      .limit(8);

    if (error) throw error;

    res.json({
      success: true,
      data: { offers }
    });
  } catch (error) {
    next(error);
  }
});

// Get featured offers
router.get('/featured', async (req, res, next) => {
  try {
    const { data: offers, error } = await supabase
      .from('offers')
      .select(`
        *,
        store:stores(*),
        category:categories(*)
      `)
      .eq('is_featured', true)
      .eq('is_active', true)
      .or('expiry_date.is.null,expiry_date.gt.now()')
      .order('sort_order', { ascending: true })
      .limit(8);

    if (error) throw error;

    res.json({
      success: true,
      data: { offers }
    });
  } catch (error) {
    next(error);
  }
});

// Track offer click
router.post('/:id/track', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Increment click count
    const { error } = await supabase.rpc('increment_offer_clicks', {
      offer_id: id
    });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Click tracked successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;