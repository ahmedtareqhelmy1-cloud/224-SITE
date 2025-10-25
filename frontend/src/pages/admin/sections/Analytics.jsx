import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Analytics = () => {
  const orders = useSelector(state => state.orders.userOrders);
  const products = useSelector(state => state.products.items);

  // Sample data for charts
  const salesData = [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 5000 },
    { month: 'Apr', sales: 4500 },
    { month: 'May', sales: 6000 },
    { month: 'Jun', sales: 5500 },
  ];

  const categoryData = [
    { name: 'Shirts', value: 400 },
    { name: 'Pants', value: 300 },
    { name: 'Accessories', value: 200 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Sales Overview */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Sales Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md col-span-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <h4 className="text-blue-600 dark:text-blue-200 text-sm font-medium">Total Orders</h4>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-100">{orders.length}</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <h4 className="text-green-600 dark:text-green-200 text-sm font-medium">Total Products</h4>
              <p className="text-2xl font-bold text-green-800 dark:text-green-100">{products.length}</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
              <h4 className="text-purple-600 dark:text-purple-200 text-sm font-medium">Total Revenue</h4>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-100">
                {orders.reduce((sum, order) => sum + order.total, 0)} EGP
              </p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
              <h4 className="text-yellow-600 dark:text-yellow-200 text-sm font-medium">Avg. Order Value</h4>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-100">
                {orders.length > 0 
                  ? Math.round(orders.reduce((sum, order) => sum + order.total, 0) / orders.length)
                  : 0} EGP
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;