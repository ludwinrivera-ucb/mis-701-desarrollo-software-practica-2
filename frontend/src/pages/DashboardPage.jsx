import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AlertMessage } from '../components/AlertMessage';

export function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchMetrics() {
      try {
        const data = await api.getDashboardMetrics();
        if (isMounted) {
          setMetrics(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error al cargar las métricas del dashboard.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchMetrics();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingSpinner message="Cargando estadísticas y métricas del sistema..." />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark m-0">Estadísticas y métricas</h2>
          <p className="text-muted small m-0">Resumen consolidado del estado del sistema e inventario</p>
        </div>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card-metric">
            <div className="label">Productos registrados</div>
            <div className="value metric-products">
              {metrics ? metrics.totalProducts.toLocaleString('es-ES') : '0'}
            </div>
            <div className="trend text-success">
              <i className="bi bi-arrow-up-right me-1"></i> Catálogo activo
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card-metric">
            <div className="label">Ventas del mes</div>
            <div className="value metric-month-sales">
              {metrics ? Number(metrics.monthlySalesTotal).toFixed(2) : '0.00'} Bs.
            </div>
            <div className="trend text-primary">
              <i className="bi bi-calendar-check me-1"></i> Total acumulado mes
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card-metric">
            <div className="label">Ventas del día</div>
            <div className="value metric-day-sales">
              {metrics ? Number(metrics.dailySalesTotal).toFixed(2) : '0.00'} Bs.
            </div>
            <div className="trend text-info">
              <i className="bi bi-clock-history me-1"></i> Total de hoy
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card-metric">
            <div className="label">Stock bajo</div>
            <div className="value metric-low-stock">
              {metrics ? metrics.lowStockProductsCount : '0'}
            </div>
            <div className="trend text-warning">
              <i className="bi bi-exclamation-triangle me-1"></i> Reponer pronto
            </div>
          </div>
        </div>
      </div>

      <div className="table-panel">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="h5 fw-bold m-0 text-dark">Actividad reciente</h3>
          <Link to="/ventas" className="btn btn-outline-primary btn-sm fw-semibold">
            Ver todo <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-ideas align-middle">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {metrics && metrics.recentSales && metrics.recentSales.length > 0 ? (
                metrics.recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <strong className="text-dark">{sale.productName}</strong>
                    </td>
                    <td>{sale.quantity} u.</td>
                    <td>{sale.formattedDate || new Date(sale.date).toLocaleDateString('es-ES')}</td>
                    <td className="fw-bold">{Number(sale.total).toFixed(2)} Bs.</td>
                    <td>
                      <span className={`badge-status ${sale.status || 'ok'}`}>
                        {sale.statusLabel || 'Pagado'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No hay registros de ventas recientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
