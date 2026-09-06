import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsListPage } from './pages/ProductsListPage';
import { ProductFormPage } from './pages/ProductFormPage';
import { SalesListPage } from './pages/SalesListPage';
import { SaleFormPage } from './pages/SaleFormPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/productos" element={<ProductsListPage />} />
            <Route path="/productos/nuevo" element={<ProductFormPage />} />
            <Route path="/productos/editar/:id" element={<ProductFormPage />} />
            <Route path="/ventas" element={<SalesListPage />} />
            <Route path="/ventas/nueva" element={<SaleFormPage />} />
            <Route path="/ventas/editar/:id" element={<SaleFormPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
