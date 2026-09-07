import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AlertMessage } from '../components/AlertMessage';

export function SaleFormPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    unitPrice: '',
    date: new Date().toISOString().split('T')[0],
    status: 'ok',
    statusLabel: 'Pagado',
    customer: '',
    paymentMethod: 'efectivo',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function initData() {
      try {
        const prods = await api.getProducts();
        if (isMounted) {
          setProducts(prods || []);
        }

        if (isEditing) {
          const sale = await api.getSaleById(id);
          if (isMounted && sale) {
            const formattedDate = sale.date ? new Date(sale.date).toISOString().split('T')[0] : '';
            setFormData({
              productId: sale.productId || '',
              quantity: sale.quantity || 1,
              unitPrice: sale.unitPrice || '',
              date: formattedDate || new Date().toISOString().split('T')[0],
              status: sale.status || 'ok',
              statusLabel: sale.statusLabel || 'Pagado',
              customer: sale.customer || '',
              paymentMethod: sale.paymentMethod || 'efectivo',
              notes: sale.notes || ''
            });

            if (prods) {
              const matchedProd = prods.find((p) => p.id === sale.productId);
              setSelectedProduct(matchedProd || null);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error al cargar los datos para la venta.');
        }
      } finally {
        if (isMounted) {
          setFetching(false);
        }
      }
    }

    initData();

    return () => {
      isMounted = false;
    };
  }, [id, isEditing]);

  const handleProductChange = (e) => {
    const prodId = parseInt(e.target.value, 10);
    const prod = products.find((p) => p.id === prodId);
    setSelectedProduct(prod || null);

    setFormData((prev) => ({
      ...prev,
      productId: prodId,
      unitPrice: prod ? prod.price : prev.unitPrice
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'status') {
        const statusLabels = {
          ok: 'Pagado',
          warn: 'En proceso',
          danger: 'Pendiente'
        };
        updated.statusLabel = statusLabels[value] || 'Pagado';
      }
      return updated;
    });
  };

  const calculatedTotal = (parseInt(formData.quantity, 10) || 0) * (parseFloat(formData.unitPrice) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qty = parseInt(formData.quantity, 10) || 1;
    const prodId = parseInt(formData.productId, 10);

    if (!prodId) {
      setError('Por favor seleccione un producto.');
      return;
    }

    if (!isEditing && selectedProduct && qty > selectedProduct.stock) {
      setError(`Stock insuficiente. El producto '${selectedProduct.name}' cuenta solo con ${selectedProduct.stock} unidades disponibles.`);
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      productId: prodId,
      quantity: qty,
      unitPrice: parseFloat(formData.unitPrice) || 0,
      date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString()
    };

    try {
      if (isEditing) {
        await api.updateSale(id, payload);
      } else {
        await api.createSale(payload);
      }
      navigate('/ventas');
    } catch (err) {
      setError(err.message || 'Error al registrar la venta.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <LoadingSpinner message="Cargando catálogo de productos y formulario..." />;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-9">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-dark m-0">
              {isEditing ? 'Editar venta' : 'Nueva venta'}
            </h2>
            <p className="text-muted small m-0">
              {isEditing
                ? 'Actualice los datos o estado de la venta'
                : 'Registre una transacción de venta (descuento de stock automático)'}
            </p>
          </div>
          <Link to="/ventas" className="btn btn-outline-secondary btn-sm fw-semibold">
            <i className="bi bi-arrow-left me-1"></i> Volver
          </Link>
        </div>

        <AlertMessage type="danger" message={error} onClose={() => setError('')} />

        <div className="table-panel">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Producto *</label>
                <select
                  name="productId"
                  className="form-select"
                  value={formData.productId}
                  onChange={handleProductChange}
                  required
                >
                  <option value="" disabled>
                    Seleccione un producto del catálogo
                  </option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({Number(prod.price).toFixed(2)} Bs.) - Stock: {prod.stock} u.
                    </option>
                  ))}
                </select>

                {selectedProduct && (
                  <div className="form-text mt-1 text-primary fw-semibold">
                    <i className="bi bi-info-circle me-1"></i> Stock disponible actual: {selectedProduct.stock} unidades.
                  </div>
                )}
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Cantidad *</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  className="form-control"
                  placeholder="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Precio unitario (Bs.) *</label>
                <input
                  type="number"
                  name="unitPrice"
                  step="0.50"
                  min="0"
                  className="form-control"
                  placeholder="0.00"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Total calculado</label>
                <div className="form-control bg-light fw-bold text-success fs-5">
                  {calculatedTotal.toFixed(2)} Bs.
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Fecha de la venta *</label>
                <input
                  type="date"
                  name="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Estado del pago *</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="ok">Pagado (ok)</option>
                  <option value="warn">En proceso (warn)</option>
                  <option value="danger">Pendiente (danger)</option>
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Cliente (Opcional)</label>
                <input
                  type="text"
                  name="customer"
                  className="form-control"
                  placeholder="Ej. Juan Pérez"
                  value={formData.customer}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Método de pago</label>
                <select
                  name="paymentMethod"
                  className="form-select"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="qr">Transferencia / QR</option>
                  <option value="tarjeta">Tarjeta Débito/Crédito</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Notas o detalles adicionales</label>
                <textarea
                  name="notes"
                  rows="2"
                  className="form-control"
                  placeholder="Observaciones sobre la venta o entrega..."
                  value={formData.notes}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="col-12 pt-3 d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary fw-bold px-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Procesando...
                    </>
                  ) : isEditing ? (
                    'Actualizar venta'
                  ) : (
                    'Registrar venta'
                  )}
                </button>
                <Link to="/ventas" className="btn btn-outline-secondary px-4">
                  Cancelar
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
