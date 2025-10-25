import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async ({ orderData, userId }) => {
    // Use Firebase to create order
    const { firebaseFunctions } = await import('../../config/firebase');
    try {
      const created = await firebaseFunctions.createOrder({ ...orderData, userId });
      return { id: created.id, ...orderData };
    } catch (error) {
      throw error;
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (userId) => {
    const { firebaseFunctions } = await import('../../config/firebase');
    try {
      const data = await firebaseFunctions.getUserOrders(userId);
      return data || [];
    } catch (error) {
      throw error;
    }
  }
);

const initialState = {
  userOrders: [],
  currentOrder: null,
  loading: false,
  error: null
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.userOrders.push(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.userOrders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setCurrentOrder, clearCurrentOrder } = ordersSlice.actions;
export default ordersSlice.reducer;