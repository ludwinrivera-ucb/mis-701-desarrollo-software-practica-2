import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AlertMessage } from '../components/AlertMessage';

export function ProductFormPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    sku: '',
    price: '',
    stock: '',
    minStock: 5,
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing) return;

    let isMounted = true;

    async function loadProduct() {
      try {
        const prod = await api.getProductById(id);
        if (isMounted && prod) {
          setFormData({
            name: prod.name || '',
            category: prod.category || '',
            brand: prod.brand || '',
            sku: prod.sku || '',
            price: prod.price || '',
            stock: prod.stock || 0,
            minStock: prod.minStock || 5,
            description: prod.description || ''
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error al cargar los datos del producto.');
        }
      } finally {
        if (isMounted) {
          setFetching(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock, 10) || 0,
      minStock: parseInt(formData.minStock, 10) || 5
    };

    try {
      if (isEditing) {
        await api.updateProduct(id, payload);
      } else {
        await api.createProduct(payload);
      }
      navigate('/productos');
    } catch (err) {
      setError(err.message || 'Error al guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <LoadingSpinner message="Cargando información del producto..." />;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-9">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-dark m-0">
              {isEditing ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            <p className="text-muted small m-0">
              {isEditing
                ? 'Actualice las características o inventario del producto'
                : 'Complete el formulario para agregar un producto al catálogo'}
            </p>
          </div>
          <Link to="/productos" className="btn btn-outline-secondary btn-sm fw-semibold">
            <i className="bi bi-arrow-left me-1"></i> Volver
          </Link>
        </div>

        <AlertMessage type="danger" message={error} onClose={() => setError('')} />

        <div className="table-panel">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Nombre del producto *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Ej. Cuaderno espiral 100 hojas Lider"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Categoría *</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Seleccione una categoría</option>
                  <option value="books">Cuadernos y Papelería</option>
                  <option value="pencils">Escritura y Colores</option>
                  <option value="paint">Arte y Manualidades</option>
                  <option value="geometry">Reglas y Geometría</option>
                  <option value="glues">Pegamentos y Tijeras</option>
                  <option value="bags">Mochilas y Estuches</option>
                  <option value="others">Otros útiles</option>
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Marca</label>
                <input
                  type="text"
                  name="brand"
                  className="form-control"
                  placeholder="Ej. Faber-Castell, Líder, Artesco"
                  value={formData.brand}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Código / SKU</label>
                <input
                  type="text"
                  name="sku"
                  className="form-control"
                  placeholder="Ej. ART-1024"
                  value={formData.sku}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Precio (Bs.) *</label>
                <input
                  type="number"
                  name="price"
                  step="0.50"
                  min="0"
                  className="form-control"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Cantidad en Stock *</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  className="form-control"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Stock Mínimo Alerta</label>
                <input
                  type="number"
                  name="minStock"
                  min="1"
                  className="form-control"
                  placeholder="5"
                  value={formData.minStock}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Descripción</label>
                <textarea
                  name="description"
                  rows="3"
                  className="form-control"
                  placeholder="Detalles o características del producto (color, tamaño, presentación)..."
                  value={formData.description}
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
                      Guardando...
                    </>
                  ) : isEditing ? (
                    'Actualizar producto'
                  ) : (
                    'Guardar producto'
                  )}
                </button>
                <Link to="/productos" className="btn btn-outline-secondary px-4">
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
