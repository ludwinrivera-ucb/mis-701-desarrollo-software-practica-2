import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AlertMessage } from '../components/AlertMessage';

export function SalesListPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchSales() {
      setLoading(true);
      try {
        const data = await api.getSales(status);
        if (isMounted) {
          setSales(data || []);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error al obtener el registro de ventas.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSales();

    return () => {
      isMounted = false;
    };
  }, [status]);

  const handleDelete = async (id, productName) => {
    if (!window.confirm(`¿Está seguro de anular la venta del producto "${productName}"? Esto restituirá el stock al inventario.`)) {
      return;
    }

    try {
      await api.deleteSale(id);
      setSuccessMsg(`La venta del producto "${productName}" fue eliminada y se restituyó el stock.`);
      setSales(sales.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message || 'Error al eliminar la venta.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark m-0">Registro de ventas</h2>
          <p className="text-muted small m-0">Historial transaccional y estado de pagos</p>
        </div>
        <Link to="/ventas/nueva" className="btn btn-primary fw-bold">
          <i className="bi bi-cart-plus me-1"></i> Registrar venta
        </Link>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      <div className="table-panel mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold mb-1 small text-muted">Filtrar por estado de pago:</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="ok">Pagado (ok)</option>
              <option value="warn">En proceso (warn)</option>
              <option value="danger">Pendiente (danger)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-panel">
        {loading ? (
          <LoadingSpinner message="Cargando registro de ventas..." />
        ) : (
          <div className="table-responsive">
            <table className="table table-ideas align-middle">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Cliente / Pago</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sales.length > 0 ? (
                  sales.map((sale) => (
                    <tr key={sale.id}>
                      <td>
                        <strong className="text-dark d-block">{sale.productName}</strong>
                        {sale.productSku && (
                          <small className="text-muted">SKU: {sale.productSku}</small>
                        )}
                      </td>
                      <td>{sale.quantity} u.</td>
                      <td>{sale.formattedDate || new Date(sale.date).toLocaleDateString('es-ES')}</td>
                      <td className="fw-bold">{Number(sale.total).toFixed(2)} Bs.</td>
                      <td>
                        <span className={`badge-status ${sale.status || 'ok'}`}>
                          {sale.statusLabel || 'Pagado'}
                        </span>
                      </td>
                      <td>
                        <span className="d-block fw-semibold">{sale.customer || 'Cliente mostrador'}</span>
                        <small className="text-muted text-capitalize">{sale.paymentMethod || 'Efectivo'}</small>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <Link
                            to={`/ventas/editar/${sale.id}`}
                            className="btn btn-outline-primary"
                            title="Editar venta"
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </Link>
                          <button
                            onClick={() => handleDelete(sale.id, sale.productName)}
                            className="btn btn-outline-danger"
                            title="Eliminar venta"
                          >
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-5">
                      No se encontraron registros de ventas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
