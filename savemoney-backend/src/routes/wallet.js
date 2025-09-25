import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get wallet data
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('total_cashback, available_cashback, pending_cashback')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    const walletData = {
      totalCashback: user.total_cashback,
      availableCashback: user.available_cashback,
      pendingCashback: user.pending_cashback,
      withdrawnCashback: user.total_cashback - user.available_cashback - user.pending_cashback,
    };

    res.json({
      success: true,
      data: { wallet: walletData }
    });
  } catch (error) {
    next(error);
  }
});

// Get transactions
router.get('/transactions', authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let query = supabase
      .from('transactions')
      .select(`
        *,
        store:stores(*),
        offer:offers(*)
      `)
      .eq('user_id', req.user.id);

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      success: true,
      data: {
        transactions: data,
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

// Create withdrawal request
router.post('/withdraw', authenticateToken, async (req, res, next) => {
  try {
    const { amount, method, accountDetails } = req.body;

    // Validate withdrawal amount
    if (amount < 10) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Minimum withdrawal amount is ₹10'
        }
      });
    }

    // Check available balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('available_cashback')
      .eq('id', req.user.id)
      .single();

    if (userError) throw userError;

    if (user.available_cashback < amount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_BALANCE',
          message: 'Insufficient balance for withdrawal'
        }
      });
    }

    // Create withdrawal request
    const { data: withdrawal, error } = await supabase
      .from('withdrawals')
      .insert({
        user_id: req.user.id,
        amount,
        method,
        account_details: accountDetails,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: { withdrawal }
    });
  } catch (error) {
    next(error);
  }
});

export default router;